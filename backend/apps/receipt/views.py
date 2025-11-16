from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from .models import Receipt
from .serializers import ReceiptSerializer, ReceiptCreateSerializer


class ReceiptViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing receipts with full CRUD operations.
    
    Provides:
    - GET /api/receipts/ - List all receipts
    - POST /api/receipts/ - Create new receipt (auto-generates receipt_id)
    - GET /api/receipts/{id}/ - Retrieve specific receipt
    - PUT /api/receipts/{id}/ - Update receipt (full update)
    - PATCH /api/receipts/{id}/ - Update receipt (partial update)
    - DELETE /api/receipts/{id}/ - Delete receipt
    - GET /api/receipts/search/?q=query - Search receipts
    - GET /api/receipts/active/ - Get only active receipts
    - GET /api/receipts/by-job-order/{job_order_id}/ - Get receipts for specific job order
    - GET /api/receipts/today/ - Get today's receipts
    """
    queryset = Receipt.objects.select_related('job_order', 'job_order__customer').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'job_order', 'receipt_date']
    search_fields = ['receipt_id', 'receipt_remarks', 'job_order__job_order_number', 'job_order__customer__name']
    ordering_fields = ['created_at', 'updated_at', 'receipt_date', 'receipt_amount', 'receipt_id']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ReceiptCreateSerializer
        return ReceiptSerializer

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
                {'error': 'Failed to create receipt', 'details': str(e)},
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
                {'error': 'Failed to update receipt', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide better error handling"""
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': 'Failed to delete receipt', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        """Return queryset with optional filtering"""
        queryset = Receipt.objects.select_related('job_order', 'job_order__customer').all()
        
        # Filter by active status if requested
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(receipt_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(receipt_date__date__lte=end_date)
            
        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active receipts"""
        active_receipts = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_receipts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search receipts by receipt_id, job order number, or customer name"""
        query = request.query_params.get('q', '')
        if query:
            receipts = self.get_queryset().filter(
                Q(receipt_id__icontains=query) |
                Q(job_order__job_order_number__icontains=query) |
                Q(job_order__customer__name__icontains=query) |
                Q(receipt_remarks__icontains=query)
            )
            serializer = self.get_serializer(receipts, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=False, methods=['get'], url_path='by-job-order/(?P<job_order_id>[^/.]+)')
    def by_job_order(self, request, job_order_id=None):
        """Get receipts for a specific job order"""
        try:
            receipts = self.get_queryset().filter(job_order_id=job_order_id)
            serializer = self.get_serializer(receipts, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': 'Failed to fetch receipts for job order', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's receipts"""
        from datetime import date
        today = date.today()
        today_receipts = self.get_queryset().filter(receipt_date__date=today)
        serializer = self.get_serializer(today_receipts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get receipt summary statistics"""
        from django.db.models import Sum, Count
        from datetime import date, timedelta
        
        queryset = self.get_queryset()
        
        # Get date range from query params or default to last 30 days
        end_date = date.today()
        start_date = end_date - timedelta(days=30)
        
        if request.query_params.get('start_date'):
            start_date = request.query_params.get('start_date')
        if request.query_params.get('end_date'):
            end_date = request.query_params.get('end_date')
        
        # Filter by date range
        queryset = queryset.filter(receipt_date__date__range=[start_date, end_date])
        
        # Calculate summary
        total_receipts = queryset.count()
        total_amount = queryset.aggregate(total=Sum('receipt_amount'))['total'] or 0
        active_receipts = queryset.filter(is_active=True).count()
        
        summary = {
            'total_receipts': total_receipts,
            'total_amount': float(total_amount),
            'active_receipts': active_receipts,
            'inactive_receipts': total_receipts - active_receipts,
            'date_range': {
                'start_date': start_date,
                'end_date': end_date
            }
        }
        
        return Response(summary)

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle receipt active status"""
        receipt = self.get_object()
        receipt.is_active = not receipt.is_active
        receipt.save()
        serializer = self.get_serializer(receipt)
        return Response(serializer.data)
