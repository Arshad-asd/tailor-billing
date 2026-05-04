from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.db import transaction as db_transaction
from decimal import Decimal
from .models import Receipt
from .serializers import ReceiptSerializer, ReceiptCreateSerializer
from apps.accounts.views import TransactionViewSet
from apps.joborder.models import JobOrder
from apps.joborder.utils import update_customer_balance


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

    def get_queryset(self):
        queryset = super().get_queryset()

        search_job_order = self.request.query_params.get('search_job_order')
        if search_job_order:
            queryset = queryset.filter(job_order__job_order_id__icontains=search_job_order)

        search_customer_id = self.request.query_params.get('search_customer_id')
        if search_customer_id:
            queryset = queryset.filter(job_order__customer__customer_id=search_customer_id)

        search_phone = self.request.query_params.get('search_phone')
        if search_phone:
            queryset = queryset.filter(job_order__customer__phone=search_phone)

        return queryset

    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return ReceiptCreateSerializer
        return ReceiptSerializer

    def create(self, request, *args, **kwargs):
        """Override create to provide better error handling and update job order balance"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            with db_transaction.atomic():
                receipt = serializer.save()
                job_order = receipt.job_order
                
                # Update job order balance by reducing it by receipt amount
                receipt_amount = Decimal(str(receipt.receipt_amount))
                current_balance = Decimal(str(job_order.balance_amount))
                
                # Calculate new balance (ensure it doesn't go below 0)
                new_balance = max(Decimal('0'), current_balance - receipt_amount)
                job_order.balance_amount = new_balance
                job_order.save()
                
                # Create transaction for the receipt
                TransactionViewSet.transaction_create_or_update_receipt(receipt)
                
                # Update customer balance
                update_customer_balance(job_order.customer)
                
            response_serializer = ReceiptSerializer(receipt)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
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
        """Override update to provide better error handling and update job order balance"""
        try:
            receipt = self.get_object()
            old_amount = Decimal(str(receipt.receipt_amount))
            old_job_order = receipt.job_order
            
            serializer = self.get_serializer(receipt, data=request.data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)
            
            with db_transaction.atomic():
                # Get new amount before saving
                new_amount = Decimal(str(serializer.validated_data.get('receipt_amount', old_amount)))
                new_job_order = serializer.validated_data.get('job_order', old_job_order)
                
                # If job order changed, restore balance to old job order and reduce new job order
                if new_job_order != old_job_order:
                    # Restore balance to old job order
                    old_job_order.balance_amount = Decimal(str(old_job_order.balance_amount)) + old_amount
                    old_job_order.save()
                    
                    # Reduce balance from new job order
                    new_job_order.balance_amount = max(Decimal('0'), Decimal(str(new_job_order.balance_amount)) - new_amount)
                    new_job_order.save()
                else:
                    # Same job order, adjust balance based on amount difference
                    amount_diff = new_amount - old_amount
                    current_balance = Decimal(str(new_job_order.balance_amount))
                    new_balance = max(Decimal('0'), current_balance - amount_diff)
                    new_job_order.balance_amount = new_balance
                    new_job_order.save()
                
                # Save the receipt
                receipt = serializer.save()
                
                # Update customer balance (handle job order change if it happened)
                update_customer_balance(new_job_order.customer)
                if old_job_order != new_job_order:
                    update_customer_balance(old_job_order.customer)
                
            response_serializer = ReceiptSerializer(receipt)
            return Response(response_serializer.data)
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
        """Override destroy to provide better error handling and restore job order balance"""
        try:
            receipt = self.get_object()
            job_order = receipt.job_order
            receipt_amount = Decimal(str(receipt.receipt_amount))
            
            with db_transaction.atomic():
                # Restore balance to job order
                current_balance = Decimal(str(job_order.balance_amount))
                job_order.balance_amount = current_balance + receipt_amount
                job_order.save()
                
                # Delete the receipt
                receipt.delete()
                
                # Update customer balance
                update_customer_balance(job_order.customer)
                
            return Response(status=status.HTTP_204_NO_CONTENT)
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
        """Toggle receipt active status and adjust job order balance accordingly"""
        receipt = self.get_object()
        job_order = receipt.job_order
        receipt_amount = Decimal(str(receipt.receipt_amount))
        was_active = receipt.is_active
        
        with db_transaction.atomic():
            receipt.is_active = not receipt.is_active
            receipt.save()
            
            # If deactivating, restore balance; if activating, reduce balance
            current_balance = Decimal(str(job_order.balance_amount))
            if was_active and not receipt.is_active:
                # Receipt was active, now inactive - restore balance
                job_order.balance_amount = current_balance + receipt_amount
            elif not was_active and receipt.is_active:
                # Receipt was inactive, now active - reduce balance
                job_order.balance_amount = max(Decimal('0'), current_balance - receipt_amount)
            
            job_order.save()
            
            # Update customer balance
            update_customer_balance(job_order.customer)
        
        serializer = self.get_serializer(receipt)
        return Response(serializer.data)
