from rest_framework import viewsets, status, serializers
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
from apps.accounts.views import TransactionViewSet
from .utils import sync_customer_measurements, update_customer_balance, update_customer_points


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
                # Create transaction for the job order
                TransactionViewSet.transaction_create_or_update_job_order(job_order, is_update=False)
                # Update customer balance and points
                update_customer_balance(job_order.customer)
                update_customer_points(job_order.customer)
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
                old_customer = instance.customer
                job_order = serializer.save()
                # Update transaction for the job order
                TransactionViewSet.transaction_create_or_update_job_order(job_order, is_update=True)
                # Update customer balance and points (handle customer change if it happened)
                update_customer_balance(job_order.customer)
                update_customer_points(job_order.customer)
                if old_customer != job_order.customer:
                    update_customer_balance(old_customer)
                    update_customer_points(old_customer)
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
        customer = instance.customer
        instance.is_active = False
        instance.save()
        # Update customer balance and points after soft delete
        update_customer_balance(customer)
        update_customer_points(customer)
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
    
    @action(detail=True, methods=['post'])
    def mark_measurements_printed(self, request, pk=None):
        """Mark job order measurements as printed. POST body: { "measurement_ids": [1,2,3] } or omit to mark all."""
        job_order = self.get_object()
        measurement_ids = request.data.get('measurement_ids')
        now = timezone.now()
        qs = job_order.jobordermeasurement_set.filter(is_active=True)
        if measurement_ids is not None:
            qs = qs.filter(id__in=measurement_ids)
        updated = qs.update(is_printed=True, printed_at=now)
        return Response({
            'message': f'{updated} measurement(s) marked as printed.',
            'updated_count': updated,
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get job order statistics"""
        queryset = self.get_queryset()
        
        # Check if we should filter by delivery_date (for delivery stats) or created_at (for job order stats)
        use_delivery_date = request.query_params.get('use_delivery_date', 'false').lower() == 'true'
        date_field = 'delivery_date' if use_delivery_date else 'created_at'
        
        # Filter by date range if provided (from_date and to_date take precedence over time_range)
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
                queryset = queryset.filter(**{f'{date_field}__gte': from_datetime})
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
                queryset = queryset.filter(**{f'{date_field}__lte': to_datetime})
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        # Filter by time range if provided (only if from_date/to_date not provided)
        if not from_date and not to_date:
            time_range = request.query_params.get('time_range')
            if time_range and time_range.lower() != 'all':
                from datetime import timedelta
                now = timezone.now()
                
                if time_range == '1d':
                    # Last 24 hours
                    start_date = now - timedelta(days=1)
                elif time_range == '7d':
                    # Last 7 days
                    start_date = now - timedelta(days=7)
                elif time_range == '30d':
                    # Last 30 days
                    start_date = now - timedelta(days=30)
                elif time_range == '90d':
                    # Last 90 days
                    start_date = now - timedelta(days=90)
                else:
                    start_date = None
                
                if start_date:
                    queryset = queryset.filter(**{f'{date_field}__gte': start_date})
        
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
        from decimal import Decimal
        job_order = self.get_object()
        received_amount_raw = request.data.get('received_on_delivery_amount', 0)
        new_status = request.data.get('status', 'delivered')
        # Coerce to Decimal so transaction_create_or_update_job_order gets numeric values
        received_amount = Decimal(str(received_amount_raw)) if received_amount_raw not in (None, '') else Decimal('0')
        
        try:
            with transaction.atomic():
                # Update received amount
                if received_amount and received_amount > 0:
                    job_order.recived_on_delivery_amount = received_amount
                    # Recalculate balance amount
                    job_order.balance_amount = job_order.total_amount - job_order.advance_amount - received_amount
                
                # Update status
                if new_status in ['pending', 'in_progress', 'completed', 'delivered']:
                    job_order.status = new_status
                
                job_order.save()
                
                # Update transaction for the job order (especially if delivery_amount changed)
                TransactionViewSet.transaction_create_or_update_job_order(job_order, is_update=True)
                
                # Update customer balance and points
                update_customer_balance(job_order.customer)
                update_customer_points(job_order.customer)
                
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
        
        # When search is provided: global search (do not apply date range).
        # When no search: filter by delivery_date range for listing.
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(job_order_number__icontains=search) |
                models.Q(customer__name__icontains=search) |
                models.Q(customer__phone__icontains=search) |
                models.Q(customer__customer_id__icontains=search)
            )
        else:
            # Filter by delivery_date range for listing (from_date / to_date)
            from_date = request.query_params.get('from_date')
            to_date = request.query_params.get('to_date')
            if from_date:
                try:
                    from datetime import datetime, time
                    from_date_obj = datetime.strptime(from_date, '%Y-%m-%d').date()
                    from_datetime = datetime.combine(from_date_obj, time.min)
                    if timezone.is_aware(timezone.now()):
                        from_datetime = timezone.make_aware(from_datetime)
                    queryset = queryset.filter(delivery_date__gte=from_datetime)
                except ValueError:
                    pass
            if to_date:
                try:
                    from datetime import datetime, time
                    to_date_obj = datetime.strptime(to_date, '%Y-%m-%d').date()
                    to_datetime = datetime.combine(to_date_obj, time.max)
                    if timezone.is_aware(timezone.now()):
                        to_datetime = timezone.make_aware(to_datetime)
                    queryset = queryset.filter(delivery_date__lte=to_datetime)
                except ValueError:
                    pass
        
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
    
    @action(detail=True, methods=['patch'])
    def update_measurements(self, request, pk=None):
        """Update only measurements section of a job order"""
        job_order = self.get_object()
        job_order_measurements_data = request.data.get('job_order_measurements', None)
        
        if job_order_measurements_data is None:
            return Response(
                {'error': 'job_order_measurements field is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                # Delete existing measurements
                job_order.jobordermeasurement_set.all().delete()
                
                # Create new measurements
                for measurement_data in job_order_measurements_data:
                    material_id = measurement_data.get('material')
                    if material_id is None:
                        raise serializers.ValidationError("Material field is required for measurements")
                    
                    try:
                        material_id = int(material_id)
                    except (ValueError, TypeError):
                        raise serializers.ValidationError(f"Invalid material ID: {material_id}")
                    
                    try:
                        material = Material.objects.get(id=material_id)
                    except Material.DoesNotExist:
                        raise serializers.ValidationError(f"Material with ID {material_id} does not exist")
                    
                    # Remove material from measurement_data
                    measurement_data_copy = measurement_data.copy()
                    measurement_data_copy.pop('material', None)
                    
                    jobOrderMeasurement.objects.create(
                        job_order=job_order,
                        material=material,
                        **measurement_data_copy
                    )
                
                # Sync job order measurements to customer measurements
                sync_customer_measurements(job_order)
                
                serializer = JobOrderListSerializer(job_order)
                return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to update measurements: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['patch'], url_path='update_measurement/(?P<measurement_id>[^/.]+)')
    def update_single_measurement(self, request, pk=None, measurement_id=None):
        """Update a single measurement by its ID"""
        job_order = self.get_object()
        
        try:
            measurement_id = int(measurement_id)
        except (ValueError, TypeError):
            return Response(
                {'error': f'Invalid measurement ID: {measurement_id}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            measurement = jobOrderMeasurement.objects.get(id=measurement_id, job_order=job_order)
        except jobOrderMeasurement.DoesNotExist:
            return Response(
                {'error': f'Measurement with ID {measurement_id} does not exist for this job order'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        try:
            with transaction.atomic():
                # Update material if provided
                material_id = request.data.get('material')
                if material_id is not None:
                    try:
                        material_id = int(material_id)
                        material = Material.objects.get(id=material_id)
                        measurement.material = material
                    except (ValueError, TypeError):
                        return Response(
                            {'error': f'Invalid material ID: {material_id}'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    except Material.DoesNotExist:
                        return Response(
                            {'error': f'Material with ID {material_id} does not exist'}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                
                # Update measurement fields
                update_fields = ['thool', 'kethet', 'thool_kum', 'ardh_f_kum', 'jamba', 'ragab', 'note1', 'note2', 'note3', 'note4']
                for field in update_fields:
                    if field in request.data:
                        setattr(measurement, field, request.data[field])
                
                measurement.save()
                
                # Sync job order measurements to customer measurements
                sync_customer_measurements(job_order)
                
                serializer = JobOrderMeasurementSerializer(measurement)
                return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to update measurement: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['patch'])
    def update_bill(self, request, pk=None):
        """Update only bill section of a job order"""
        job_order = self.get_object()
        
        # Extract bill-related fields
        bill_data = {}
        if 'delivery_date' in request.data:
            bill_data['delivery_date'] = request.data['delivery_date']
        if 'total_amount' in request.data:
            bill_data['total_amount'] = request.data['total_amount']
        if 'advance_amount' in request.data:
            bill_data['advance_amount'] = request.data['advance_amount']
        if 'payment_method' in request.data:
            bill_data['payment_method'] = request.data['payment_method']
        if 'cash_amount' in request.data:
            bill_data['cash_amount'] = request.data['cash_amount']
        if 'card_amount' in request.data:
            bill_data['card_amount'] = request.data['card_amount']
        if 'remarks' in request.data:
            bill_data['remarks'] = request.data['remarks']
        
        # Handle job_order_items if provided
        job_order_items_data = request.data.get('job_order_items', None)
        
        try:
            with transaction.atomic():
                # Convert string values to Decimal for proper arithmetic
                from decimal import Decimal
                
                # Calculate balance amount if total or advance changed
                if 'total_amount' in bill_data or 'advance_amount' in bill_data:
                    # Get values and convert to Decimal
                    total_amount = bill_data.get('total_amount', job_order.total_amount)
                    advance_amount = bill_data.get('advance_amount', job_order.advance_amount)
                    
                    # Convert to Decimal if they're strings
                    if isinstance(total_amount, str):
                        total_amount = Decimal(total_amount)
                    elif not isinstance(total_amount, Decimal):
                        total_amount = Decimal(str(total_amount))
                    
                    if isinstance(advance_amount, str):
                        advance_amount = Decimal(advance_amount)
                    elif not isinstance(advance_amount, Decimal):
                        advance_amount = Decimal(str(advance_amount))
                    
                    bill_data['balance_amount'] = total_amount - advance_amount
                    bill_data['total_amount'] = total_amount
                    bill_data['advance_amount'] = advance_amount
                
                # Handle cash and card amounts based on payment method
                payment_method = bill_data.get('payment_method', job_order.payment_method)
                total_amount = bill_data.get('total_amount', job_order.total_amount)
                
                # Ensure total_amount is Decimal
                if isinstance(total_amount, str):
                    total_amount = Decimal(total_amount)
                elif not isinstance(total_amount, Decimal):
                    total_amount = Decimal(str(total_amount))
                
                if payment_method == 'cash':
                    bill_data['cash_amount'] = total_amount
                    bill_data['card_amount'] = Decimal('0')
                elif payment_method == 'card':
                    bill_data['cash_amount'] = Decimal('0')
                    bill_data['card_amount'] = total_amount
                elif payment_method == 'cash_card':
                    # For cash_card, use provided amounts or keep existing
                    if 'cash_amount' not in bill_data and 'card_amount' not in bill_data:
                        # If neither is provided, split the total amount
                        bill_data['cash_amount'] = total_amount / Decimal('2')
                        bill_data['card_amount'] = total_amount / Decimal('2')
                    elif 'cash_amount' in bill_data and 'card_amount' not in bill_data:
                        cash_amount = bill_data['cash_amount']
                        if isinstance(cash_amount, str):
                            cash_amount = Decimal(cash_amount)
                        elif not isinstance(cash_amount, Decimal):
                            cash_amount = Decimal(str(cash_amount))
                        bill_data['cash_amount'] = cash_amount
                        bill_data['card_amount'] = total_amount - cash_amount
                    elif 'card_amount' in bill_data and 'cash_amount' not in bill_data:
                        card_amount = bill_data['card_amount']
                        if isinstance(card_amount, str):
                            card_amount = Decimal(card_amount)
                        elif not isinstance(card_amount, Decimal):
                            card_amount = Decimal(str(card_amount))
                        bill_data['card_amount'] = card_amount
                        bill_data['cash_amount'] = total_amount - card_amount
                
                # Ensure all numeric fields in bill_data are Decimal
                numeric_fields = ['total_amount', 'advance_amount', 'balance_amount', 'cash_amount', 'card_amount']
                for field in numeric_fields:
                    if field in bill_data:
                        value = bill_data[field]
                        if isinstance(value, str):
                            bill_data[field] = Decimal(value)
                        elif not isinstance(value, Decimal):
                            bill_data[field] = Decimal(str(value))
                
                # Update job order bill fields
                for attr, value in bill_data.items():
                    setattr(job_order, attr, value)
                job_order.save()
                
                # Update transaction for the job order (especially if advance_amount changed)
                TransactionViewSet.transaction_create_or_update_job_order(job_order, is_update=True)
                
                # Update customer balance and points
                update_customer_balance(job_order.customer)
                update_customer_points(job_order.customer)
                
                # Update job order items if provided
                if job_order_items_data is not None:
                    # Delete existing items
                    job_order.joborderitem_set.all().delete()
                    
                    # Create new items
                    for item_data in job_order_items_data:
                        material_id = item_data.get('material')
                        if material_id is None:
                            raise serializers.ValidationError("Material field is required for job order items")
                        
                        try:
                            material_id = int(material_id)
                        except (ValueError, TypeError):
                            raise serializers.ValidationError(f"Invalid material ID: {material_id}")
                        
                        quantity = item_data['quantity']
                        amount = item_data['amount']
                        sub_total = quantity * amount
                        remarks = item_data.get('remarks', '')
                        
                        try:
                            material = Material.objects.get(id=material_id)
                        except Material.DoesNotExist:
                            raise serializers.ValidationError(f"Material with ID {material_id} does not exist")
                        
                        jobOrderItem.objects.create(
                            job_order=job_order,
                            material=material,
                            quantity=quantity,
                            amount=amount,
                            sub_total=sub_total,
                            remarks=remarks
                        )
                
                serializer = JobOrderListSerializer(job_order)
                return Response(serializer.data)
        except Exception as e:
            return Response(
                {'error': f'Failed to update bill: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
