from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleListSerializer, SaleItemSerializer
from apps.inventory.models import Item
import random
import string

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer

    def get_serializer_class(self):
        if self.action == 'list':
            return SaleListSerializer
        return SaleSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by payment method if provided
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        # Filter by item if provided
        item_id = self.request.query_params.get('item_id')
        if item_id:
            queryset = queryset.filter(sale_items__item_id=item_id).distinct()
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                from datetime import datetime
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__date__gte=start_date_obj)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        if end_date:
            try:
                from datetime import datetime
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__date__lte=end_date_obj)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        return queryset
    
    def generate_sale_number(self):
        """Generate a unique sale number"""
        while True:
            # Generate a 6-digit random number with prefix 'SALE-'
            sale_number = 'SALE-' + ''.join(random.choices(string.digits, k=6))
            
            # Check if this sale number already exists
            if not Sale.objects.filter(sale_number=sale_number).exists():
                return sale_number
    
    def perform_create(self, serializer):
        # Generate automatic sale number
        sale_number = self.generate_sale_number()
        serializer.save(sale_number=sale_number)
    
    def create(self, request, *args, **kwargs):
        """Create a new sale with automatic sale number generation"""
        try:
            with transaction.atomic():
                # Generate sale number
                sale_number = self.generate_sale_number()
                
                # Prepare data
                data = request.data.copy()
                data['sale_number'] = sale_number
                
                # Validate and create sale using serializer's create method
                serializer = self.get_serializer(data=data)
                serializer.is_valid(raise_exception=True)
                sale = serializer.save()
                
                # The serializer's create method already handles sale_items
                # Just ensure total_amount is calculated correctly
                if sale.sale_items.exists():
                    total_amount = sum(item.total_amount for item in sale.sale_items.all())
                    sale.total_amount = total_amount
                    sale.amount = total_amount
                    sale.save()
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to create sale: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Update an existing sale"""
        try:
            with transaction.atomic():
                instance = self.get_object()
                serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
                serializer.is_valid(raise_exception=True)
                sale = serializer.save()
                
                # Recalculate total amount from sale items
                total_amount = sum(item.total_amount for item in sale.sale_items.all())
                sale.total_amount = total_amount
                sale.amount = total_amount
                sale.save()
                
                return Response(serializer.data)
                
        except Exception as e:
            return Response(
                {'error': f'Failed to update sale: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        """Add an item to an existing sale"""
        try:
            sale = self.get_object()
            item_data = request.data.copy()
            item_data['sale'] = sale.id
            
            serializer = SaleItemSerializer(data=item_data)
            serializer.is_valid(raise_exception=True)
            sale_item = serializer.save()
            
            # Recalculate total amount
            total_amount = sum(item.total_amount for item in sale.sale_items.all())
            sale.total_amount = total_amount
            sale.amount = total_amount
            sale.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': f'Failed to add item: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['delete'])
    def remove_item(self, request, pk=None):
        """Remove an item from a sale"""
        try:
            sale = self.get_object()
            item_id = request.data.get('item_id')
            
            if not item_id:
                return Response(
                    {'error': 'item_id is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                sale_item = sale.sale_items.get(id=item_id)
                sale_item.delete()
                
                # Recalculate total amount
                total_amount = sum(item.total_amount for item in sale.sale_items.all())
                sale.total_amount = total_amount
                sale.amount = total_amount
                sale.save()
                
                return Response({'message': 'Item removed successfully'})
                
            except SaleItem.DoesNotExist:
                return Response(
                    {'error': 'Sale item not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
                
        except Exception as e:
            return Response(
                {'error': f'Failed to remove item: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark a sale as completed"""
        try:
            sale = self.get_object()
            sale.status = 'completed'
            sale.save()
            
            return Response({'message': 'Sale marked as completed'})
            
        except Exception as e:
            return Response(
                {'error': f'Failed to mark sale as completed: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def mark_cancelled(self, request, pk=None):
        """Mark a sale as cancelled"""
        try:
            sale = self.get_object()
            sale.status = 'cancelled'
            sale.save()
            
            return Response({'message': 'Sale marked as cancelled'})
            
        except Exception as e:
            return Response(
                {'error': f'Failed to mark sale as cancelled: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def by_customer(self, request):
        """Get sales by customer name"""
        customer_name = request.query_params.get('customer_name')
        if not customer_name:
            return Response(
                {'error': 'customer_name parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sales = Sale.objects.filter(customer_name__icontains=customer_name)
        serializer = self.get_serializer(sales, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_date_range(self, request):
        """Get sales by date range"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date parameters are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from datetime import datetime
            start_date = datetime.strptime(start_date, '%Y-%m-%d')
            end_date = datetime.strptime(end_date, '%Y-%m-%d')
            
            sales = Sale.objects.filter(date__date__range=[start_date.date(), end_date.date()])
            serializer = self.get_serializer(sales, many=True)
            return Response(serializer.data)
            
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class SaleItemViewSet(viewsets.ModelViewSet):
    queryset = SaleItem.objects.all()
    serializer_class = SaleItemSerializer
    
    def get_queryset(self):
        """Filter sale items by sale ID if provided"""
        queryset = SaleItem.objects.all()
        sale_id = self.request.query_params.get('sale_id')
        if sale_id:
            queryset = queryset.filter(sale_id=sale_id)
        return queryset
