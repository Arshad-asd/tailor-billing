from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from django.utils import timezone
from .models import Item, ItemCategory, Stock, StockMovement
from .serializers import (
    ItemSerializer, ItemCategorySerializer, StockSerializer, 
    StockMovementSerializer, StockAdjustmentSerializer
)


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
        
        # Search by name or SKU
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) | 
                models.Q(sku__icontains=search)
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
