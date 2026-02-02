import csv
import io
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.db import transaction, models
from django.utils import timezone
from django.http import HttpResponse
from .models import Item, ItemCategory, Stock, StockMovement
from .serializers import (
    ItemSerializer, ItemCategorySerializer, StockSerializer,
    StockMovementSerializer, StockAdjustmentSerializer
)

# Expected upload columns (aliases accepted)
ITEM_UPLOAD_COLUMNS = {
    'item no': 'item_number',
    'item_no': 'item_number',
    'item number': 'item_number',
    'item_number': 'item_number',
    'item name': 'name',
    'item_name': 'name',
    'name': 'name',
    'category name': 'category_name',
    'category_name': 'category_name',
    'category': 'category_name',
    'unit': 'unit',
    'units': 'unit',
    'is_item': 'is_raw_material',
    'is_raw_material': 'is_raw_material',
}


class ItemCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing item categories
    """
    queryset = ItemCategory.objects.all()
    serializer_class = ItemCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter categories by search parameter"""
        queryset = ItemCategory.objects.all()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class ItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing inventory items
    """
    queryset = Item.objects.select_related('category').all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter items by various parameters"""
        queryset = Item.objects.select_related('category').all()
        
        # Filter by category
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category_id=category)
        
        # Filter by material type
        is_raw_material = self.request.query_params.get('is_raw_material', None)
        if is_raw_material is not None:
            queryset = queryset.filter(is_raw_material=is_raw_material.lower() == 'true')
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Search by name, SKU, or item_number
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(sku__icontains=search) |
                models.Q(item_number__icontains=search)
            )
        
        # Default order: item_number (nulls last), then name
        from django.db.models import Case, Value, When
        queryset = queryset.order_by(
            Case(When(item_number__isnull=True, then=Value(1)), default=Value(0)),
            'item_number', 'name'
        )
        return queryset
    
    @action(detail=True, methods=['get'])
    def stock_history(self, request, pk=None):
        """Get stock movement history for an item"""
        item = self.get_object()
        movements = StockMovement.objects.filter(item=item).order_by('-date')
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        """Adjust stock for an item"""
        item = self.get_object()
        serializer = StockAdjustmentSerializer(data=request.data)
        
        if serializer.is_valid():
            with transaction.atomic():
                # Create stock movement record
                movement = StockMovement.objects.create(
                    item=item,
                    quantity=serializer.validated_data['quantity'],
                    movement_type=serializer.validated_data['movement_type'],
                    reference=serializer.validated_data.get('reference', ''),
                    remarks=serializer.validated_data.get('remarks', '')
                )
                
                # Update or create stock record
                stock, created = Stock.objects.get_or_create(
                    item=item,
                    location='main',
                    defaults={'quantity': 0}
                )
                
                # Adjust stock based on movement type
                if serializer.validated_data['movement_type'] == 'IN':
                    stock.quantity += serializer.validated_data['quantity']
                elif serializer.validated_data['movement_type'] == 'OUT':
                    stock.quantity -= serializer.validated_data['quantity']
                elif serializer.validated_data['movement_type'] == 'ADJUST':
                    stock.quantity = serializer.validated_data['quantity']
                
                stock.save()
                
                return Response({
                    'message': 'Stock adjusted successfully',
                    'movement': StockMovementSerializer(movement).data,
                    'new_stock': float(stock.quantity)
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _normalize_item_row(self, row):
        """Convert dict of raw column names to standard keys."""
        out = {}
        for raw_key, value in row.items():
            if value is None or (isinstance(value, str) and not str(value).strip()):
                continue
            key_lower = (raw_key or '').strip().lower()
            std_key = ITEM_UPLOAD_COLUMNS.get(key_lower)
            if std_key:
                out[std_key] = value.strip() if isinstance(value, str) else value
        return out

    def _parse_bool(self, value):
        """Parse boolean from cell: true/false, 1/0, yes/no."""
        if value is None:
            return False
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return bool(value)
        s = (str(value) or '').strip().lower()
        return s in ('true', '1', 'yes', 'y')

    def _rows_from_csv(self, file):
        """Yield normalized row dicts from CSV file."""
        content = file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(content))
        for row in reader:
            normalized = self._normalize_item_row(row)
            if normalized:
                yield normalized

    def _rows_from_xlsx(self, file):
        """Yield normalized row dicts from XLSX file."""
        try:
            import openpyxl
        except ImportError:
            raise ValidationError('xlsx support requires openpyxl. Install with: pip install openpyxl')
        wb = openpyxl.load_workbook(file, read_only=True, data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if not rows:
            wb.close()
            return
        header = [str(c).strip() if c is not None else '' for c in rows[0]]
        for row in rows[1:]:
            out = {}
            for i, cell in enumerate(row):
                if i >= len(header) or not header[i]:
                    continue
                key_lower = header[i].lower()
                std_key = ITEM_UPLOAD_COLUMNS.get(key_lower)
                if std_key and cell is not None and (not isinstance(cell, str) or cell.strip()):
                    out[std_key] = cell.strip() if isinstance(cell, str) else cell
            if out:
                yield out
        wb.close()

    @action(detail=False, methods=['post'])
    def upload_items(self, request):
        """Accept xlsx or csv file; add or update items. Category is created if needed. Columns: item_no, item_name, category_name, unit, is_item."""
        file = request.FILES.get('file')
        if not file:
            return Response(
                {'error': 'No file provided. Use form field "file".'},
                status=status.HTTP_400_BAD_REQUEST
            )
        name = (file.name or '').lower()
        if name.endswith('.csv'):
            rows = list(self._rows_from_csv(file))
        elif name.endswith('.xlsx') or name.endswith('.xls'):
            rows = list(self._rows_from_xlsx(file))
        else:
            return Response(
                {'error': 'Only .csv or .xlsx files are accepted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not rows:
            return Response(
                {'error': 'No valid rows found. Expected header: item_no, item_name, category_name, unit, is_item'},
                status=status.HTTP_400_BAD_REQUEST
            )
        created = updated = 0
        errors = []
        for i, row in enumerate(rows):
            name_val = (row.get('name') or '').strip() or None
            if not name_val:
                name_val = (row.get('item_number') or '').strip() or None
            if not name_val:
                errors.append(f'Row {i + 2}: item name is required')
                continue
            item_number = (row.get('item_number') or '').strip() or None
            category_name = (row.get('category_name') or '').strip() or None
            unit = (row.get('unit') or '').strip() or 'meter'
            is_raw = self._parse_bool(row.get('is_raw_material', True))
            category = None
            if category_name:
                category, _ = ItemCategory.objects.get_or_create(
                    name=category_name,
                    defaults={'description': ''}
                )
            defaults = {
                'name': name_val,
                'category': category,
                'unit': unit,
                'is_active': True,
                'is_raw_material': is_raw,
            }
            try:
                if item_number:
                    obj, created_ = Item.objects.update_or_create(
                        item_number=item_number,
                        defaults=defaults
                    )
                    if created_:
                        created += 1
                    else:
                        updated += 1
                else:
                    Item.objects.create(item_number=None, **defaults)
                    created += 1
            except Exception as e:
                errors.append(f'Row {i + 2}: {str(e)}')
        return Response({
            'created': created,
            'updated': updated,
            'errors': errors,
            'message': f'Processed: {created} created, {updated} updated.'
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def download(self, request):
        """Download items as CSV. If no items exist, return template CSV with header only."""
        queryset = self.get_queryset().order_by('item_number')
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        header = ['item_no', 'item_name', 'category_name', 'unit', 'is_item']
        writer.writerow(header)
        if queryset.exists():
            for item in queryset:
                writer.writerow([
                    item.item_number or '',
                    item.name or '',
                    item.category.name if item.category else '',
                    item.unit or 'meter',
                    'yes' if item.is_raw_material else 'no',
                ])
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        filename = 'items_export.csv' if queryset.exists() else 'items_template.csv'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class StockViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stock records
    """
    queryset = Stock.objects.select_related('item').all()
    serializer_class = StockSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter stock by various parameters"""
        queryset = Stock.objects.select_related('item').all()
        
        # Filter by location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location=location)
        
        # Filter by low stock
        low_stock = self.request.query_params.get('low_stock', None)
        if low_stock is not None:
            threshold = float(low_stock)
            queryset = queryset.filter(quantity__lte=threshold)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def low_stock_alerts(self, request):
        """Get items with low stock"""
        threshold = float(request.query_params.get('threshold', 10))
        low_stock_items = self.get_queryset().filter(quantity__lte=threshold)
        serializer = self.get_serializer(low_stock_items, many=True)
        return Response(serializer.data)


class StockMovementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing stock movements
    """
    queryset = StockMovement.objects.select_related('item').all()
    serializer_class = StockMovementSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter movements by various parameters"""
        queryset = StockMovement.objects.select_related('item').all()
        
        # Filter by item
        item = self.request.query_params.get('item', None)
        if item:
            queryset = queryset.filter(item_id=item)
        
        # Filter by movement type
        movement_type = self.request.query_params.get('movement_type', None)
        if movement_type:
            queryset = queryset.filter(movement_type=movement_type)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get stock movement summary"""
        queryset = self.get_queryset()
        
        # Get date range
        date_from = request.query_params.get('date_from', None)
        date_to = request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
        
        # Calculate summary
        total_in = queryset.filter(movement_type='IN').aggregate(
            total=models.Sum('quantity')
        )['total'] or 0
        
        total_out = queryset.filter(movement_type='OUT').aggregate(
            total=models.Sum('quantity')
        )['total'] or 0
        
        total_adjustments = queryset.filter(movement_type='ADJUST').count()
        
        return Response({
            'total_in': float(total_in),
            'total_out': float(total_out),
            'net_movement': float(total_in - total_out),
            'total_adjustments': total_adjustments,
            'total_movements': queryset.count()
        })
