import csv
import io
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.http import HttpResponse
from .models import Material
from .serializers import MaterialSerializer

# Expected upload columns (aliases accepted)
UPLOAD_COLUMNS = {
    'material no': 'material_number',
    'material_no': 'material_number',
    'material number': 'material_number',
    'material_number': 'material_number',
    'material name': 'name',
    'material_name': 'name',
    'name': 'name',
    'is_material': 'is_measurement_required',
    'is_measurement': 'is_measurement_required',
    'is_measurement_required': 'is_measurement_required',
    'arabic name': 'arabic_name',
    'arabic_name': 'arabic_name',
}


class MaterialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing materials with full CRUD operations.
    
    Provides:
    - GET /api/materials/ - List all materials
    - POST /api/materials/ - Create new material
    - GET /api/materials/{id}/ - Retrieve specific material
    - PUT /api/materials/{id}/ - Update material (full update)
    - PATCH /api/materials/{id}/ - Update material (partial update)
    - DELETE /api/materials/{id}/ - Delete material
    - GET /api/materials/search/?q=query - Search materials
    - GET /api/materials/active/ - Get only active materials
    """
    queryset = Material.objects.all().order_by('id')
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'name', 'is_measurement_required', 'material_number']
    search_fields = ['name', 'material_number']
    ordering_fields = ['id', 'created_at', 'updated_at', 'name', 'price', 'material_number']
    ordering = ['id']

    def create(self, request, *args, **kwargs):
        """Override create to provide better error handling"""
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': 'Validation failed', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to create material', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """Override update to provide better error handling"""
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as e:
            return Response(
                {'error': 'Validation failed', 'details': e.detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to update material', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide better error handling"""
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': 'Failed to delete material', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        """Return queryset with optional filtering"""
        queryset = Material.objects.all().order_by('id')
        
        # Filter by active status if requested
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by measurement required status if requested
        is_measurement_required = self.request.query_params.get('is_measurement_required', None)
        if is_measurement_required is not None:
            queryset = queryset.filter(is_measurement_required=is_measurement_required.lower() == 'true')
            
        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active materials"""
        active_materials = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_materials, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search materials by name and material_number"""
        query = request.query_params.get('q', '')
        if query:
            materials = self.get_queryset().filter(
                Q(name__icontains=query) | Q(material_number__icontains=query)
            )
            serializer = self.get_serializer(materials, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle material active status"""
        material = self.get_object()
        material.is_active = not material.is_active
        material.save()
        serializer = self.get_serializer(material)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_price(self, request, pk=None):
        """Update material price"""
        material = self.get_object()
        new_price = request.data.get('price')
        
        if new_price is None:
            return Response(
                {'error': 'Price is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            material.price = float(new_price)
            if material.price < 0:
                return Response(
                    {'error': 'Price cannot be negative'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            material.save()
            serializer = self.get_serializer(material)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'Invalid price value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get material statistics"""
        queryset = self.get_queryset()
        
        total_materials = queryset.count()
        active_materials = queryset.filter(is_active=True).count()
        inactive_materials = queryset.filter(is_active=False).count()
        
        # Calculate average price
        from django.db.models import Avg
        avg_price = queryset.aggregate(avg_price=Avg('price'))['avg_price'] or 0
        
        # Calculate total value (sum of all prices)
        from django.db.models import Sum
        total_value = queryset.aggregate(total_value=Sum('price'))['total_value'] or 0
        
        return Response({
            'total_materials': total_materials,
            'active_materials': active_materials,
            'inactive_materials': inactive_materials,
            'average_price': round(float(avg_price), 2),
            'total_value': round(float(total_value), 2)
        })

    def _normalize_row(self, row):
        """Convert dict of raw column names to standard keys. row keys can be str, strip and lower for match."""
        out = {}
        for raw_key, value in row.items():
            if value is None or (isinstance(value, str) and not value.strip()):
                continue
            key_lower = (raw_key or '').strip().lower()
            std_key = UPLOAD_COLUMNS.get(key_lower)
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
        s = (value or '').strip().lower()
        return s in ('true', '1', 'yes', 'y')

    def _rows_from_csv(self, file):
        """Yield normalized row dicts from CSV file. First row = header."""
        content = file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8-sig')
        reader = csv.DictReader(io.StringIO(content))
        for row in reader:
            normalized = self._normalize_row(row)
            if normalized:
                yield normalized

    def _rows_from_xlsx(self, file):
        """Yield normalized row dicts from XLSX file. First row = header."""
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
                std_key = UPLOAD_COLUMNS.get(key_lower)
                if std_key and cell is not None and (not isinstance(cell, str) or cell.strip()):
                    out[std_key] = cell.strip() if isinstance(cell, str) else cell
            if out:
                yield out
        wb.close()

    @action(detail=False, methods=['post'])
    def upload_materials(self, request):
        """Accept xlsx or csv file; add or update materials. Columns: material_no, material_name, is_material, arabic_name. Price set to 0."""
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
                {'error': 'No valid rows found. Expected header: material_no, material_name, is_material, arabic_name'},
                status=status.HTTP_400_BAD_REQUEST
            )
        created = updated = 0
        errors = []
        for i, row in enumerate(rows):
            name_val = row.get('name') or row.get('material_name')
            if not name_val:
                name_val = (row.get('material_number') or row.get('material_no') or '').strip() or None
            if not name_val:
                errors.append(f'Row {i + 2}: material name is required')
                continue
            if isinstance(name_val, str):
                name_val = name_val.strip()
            material_number = (row.get('material_number') or row.get('material_no') or '').strip() or None
            arabic_name = (row.get('arabic_name') or '').strip() or None
            if isinstance(arabic_name, str):
                arabic_name = arabic_name.strip() or None
            is_measurement = self._parse_bool(row.get('is_measurement_required', False))
            defaults = {
                'name': name_val,
                'arabic_name': arabic_name,
                'price': 0,
                'is_active': True,
                'is_measurement_required': is_measurement,
            }
            try:
                if material_number:
                    obj, created_ = Material.objects.update_or_create(
                        material_number=material_number,
                        defaults=defaults
                    )
                    if created_:
                        created += 1
                    else:
                        updated += 1
                else:
                    Material.objects.create(
                        material_number=None,
                        **defaults
                    )
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
        """Download materials as CSV. If no materials exist, return template CSV with header only."""
        queryset = self.get_queryset().order_by('id')
        buffer = io.StringIO()
        writer = csv.writer(buffer)
        header = ['material_no', 'material_name', 'is_material', 'arabic_name']
        writer.writerow(header)
        if queryset.exists():
            for m in queryset:
                writer.writerow([
                    m.material_number or '',
                    m.name or '',
                    'yes' if m.is_measurement_required else 'no',
                    m.arabic_name or '',
                ])
        response = HttpResponse(buffer.getvalue(), content_type='text/csv')
        filename = 'materials_export.csv' if queryset.exists() else 'materials_template.csv'
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
