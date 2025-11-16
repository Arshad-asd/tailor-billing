from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from django.utils import timezone
from .models import JobOrder, jobOrderItem, jobOrderMeasurement
from .serializers import (
    JobOrderCreateSerializer, 
    JobOrderUpdateSerializer, 
    JobOrderListSerializer,
    JobOrderItemSerializer,
    JobOrderMeasurementSerializer,
    JobOrderMeasurementReadSerializer
)
from apps.crm.models import Customer
from apps.materials.models import Material


class JobOrderViewSet(viewsets.ModelViewSet):
    queryset = JobOrder.objects.filter(is_active=True).order_by('-created_at')
    permission_classes = [IsAuthenticated]
    
    # Explicitly define allowed methods
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']
    
    
    def get_serializer_class(self):
        if self.action == 'create':
            return JobOrderCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return JobOrderUpdateSerializer
        else:
            return JobOrderListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by customer if provided
        customer_id = self.request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # Filter by payment method if provided
        payment_method = self.request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        # Filter by date range if provided (created_at for job orders)
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        
        if from_date:
            try:
                from datetime import datetime
                from_date_obj = datetime.strptime(from_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=from_date_obj)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        if to_date:
            try:
                from datetime import datetime
                to_date_obj = datetime.strptime(to_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=to_date_obj)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        # Search by job order number, customer name, customer phone, or customer ID
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(job_order_number__icontains=search) |
                models.Q(customer__name__icontains=search) |
                models.Q(customer__phone__icontains=search) |
                models.Q(customer__customer_id__icontains=search)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new job order with customer and items"""
        print("=== CREATE JOB ORDER DEBUG ===")
        print("Request method:", request.method)
        print("Request data:", request.data)
        
        serializer = self.get_serializer(data=request.data)
        print("Serializer class:", self.get_serializer_class())
        
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        print("Serializer is valid, proceeding with creation...")
        
        try:
            with transaction.atomic():
                job_order = serializer.save()
                response_serializer = JobOrderListSerializer(job_order)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': f'Failed to create job order: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def update(self, request, *args, **kwargs):
        """Update an existing job order"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                job_order = serializer.save()
                response_serializer = JobOrderListSerializer(job_order)
                return Response(response_serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to update job order: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete a job order"""
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update job order status"""
        job_order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['pending', 'in_progress', 'completed', 'delivered']:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        job_order.status = new_status
        job_order.save()
        
        serializer = JobOrderListSerializer(job_order)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def items(self, request, pk=None):
        """Get job order items"""
        job_order = self.get_object()
        items = job_order.joborderitem_set.filter(is_active=True)
        serializer = JobOrderItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def measurements(self, request, pk=None):
        """Get job order measurements"""
        job_order = self.get_object()
        measurements = job_order.jobordermeasurement_set.filter(is_active=True)
        serializer = JobOrderMeasurementReadSerializer(measurements, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get job order statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total_orders': queryset.count(),
            'pending': queryset.filter(status='pending').count(),
            'in_progress': queryset.filter(status='in_progress').count(),
            'completed': queryset.filter(status='completed').count(),
            'delivered': queryset.filter(status='delivered').count(),
            'total_revenue': sum(order.total_amount for order in queryset),
            'total_balance': sum(order.balance_amount for order in queryset),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent job orders"""
        limit = int(request.query_params.get('limit', 10))
        queryset = self.get_queryset()[:limit]
        serializer = JobOrderListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def test(self, request):
        """Test endpoint to verify ViewSet is working"""
        return Response({'message': 'JobOrderViewSet is working correctly'})
    
    @action(detail=False, methods=['post'])
    def test_post(self, request):
        """Test POST endpoint to verify ViewSet is working"""
        print("=== TEST POST DEBUG ===")
        print("Request method:", request.method)
        print("Request data:", request.data)
        return Response({'message': 'POST method is working correctly', 'received_data': request.data})
    
    @action(detail=True, methods=['post'])
    def update_delivery(self, request, pk=None):
        """Update delivery status and received amount"""
        job_order = self.get_object()
        received_amount = request.data.get('received_on_delivery_amount', 0)
        new_status = request.data.get('status', 'delivered')
        
        try:
            with transaction.atomic():
                # Update received amount
                if received_amount:
                    job_order.recived_on_delivery_amount = received_amount
                    # Recalculate balance amount
                    job_order.balance_amount = job_order.total_amount - job_order.advance_amount - received_amount
                
                # Update status
                if new_status in ['pending', 'in_progress', 'completed', 'delivered']:
                    job_order.status = new_status
                
                job_order.save()
                
                serializer = JobOrderListSerializer(job_order)
                return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to update delivery: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def deliveries(self, request):
        """Get deliveries filtered by delivery_date"""
        queryset = self.get_queryset()
        
        # Filter by status if provided (exclude 'all' status)
        status_filter = request.query_params.get('status')
        if status_filter and status_filter.lower() != 'all':
            queryset = queryset.filter(status=status_filter)
        
        # Filter by blocked status if provided
        is_blocked_param = request.query_params.get('is_blocked')
        if is_blocked_param is not None:
            is_blocked = is_blocked_param.lower() in ('true', '1', 'yes')
            queryset = queryset.filter(is_blocked=is_blocked)
        
        # Filter by customer if provided
        customer_id = request.query_params.get('customer_id')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        # Filter by payment method if provided
        payment_method = request.query_params.get('payment_method')
        if payment_method:
            queryset = queryset.filter(payment_method=payment_method)
        
        # Filter by delivery_date range (this is the key difference from regular job orders)
        from_date = request.query_params.get('from_date')
        to_date = request.query_params.get('to_date')
        
        if from_date:
            try:
                from datetime import datetime, time
                from_date_obj = datetime.strptime(from_date, '%Y-%m-%d').date()
                # Use date range starting from beginning of the day
                from_datetime = datetime.combine(from_date_obj, time.min)
                if timezone.is_aware(timezone.now()):
                    from_datetime = timezone.make_aware(from_datetime)
                queryset = queryset.filter(delivery_date__gte=from_datetime)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        if to_date:
            try:
                from datetime import datetime, time
                to_date_obj = datetime.strptime(to_date, '%Y-%m-%d').date()
                # Use date range ending at end of the day
                to_datetime = datetime.combine(to_date_obj, time.max)
                if timezone.is_aware(timezone.now()):
                    to_datetime = timezone.make_aware(to_datetime)
                queryset = queryset.filter(delivery_date__lte=to_datetime)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        # Search by job order number, customer name, customer phone, or customer ID
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(job_order_number__icontains=search) |
                models.Q(customer__name__icontains=search) |
                models.Q(customer__phone__icontains=search) |
                models.Q(customer__customer_id__icontains=search)
            )
        
        serializer = JobOrderListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def toggle_block(self, request, pk=None):
        """Toggle block/unblock status of a job order"""
        job_order = self.get_object()
        job_order.is_blocked = not job_order.is_blocked
        job_order.save()
        
        serializer = JobOrderListSerializer(job_order)
        return Response(serializer.data)
    
