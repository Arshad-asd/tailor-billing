from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from .models import Customer, CustomerMeasurement
from .serializers import CustomerSerializer, CustomerReportSerializer, CustomerMeasurementSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing customers with full CRUD operations.
    
    Provides:
    - GET /api/crm/customers/ - List all customers
    - POST /api/crm/customers/ - Create new customer
    - GET /api/crm/customers/{id}/ - Retrieve specific customer
    - PUT /api/crm/customers/{id}/ - Update customer (full update)
    - PATCH /api/crm/customers/{id}/ - Update customer (partial update)
    - DELETE /api/crm/customers/{id}/ - Delete customer
    - GET /api/crm/customers/search/?q=query - Search customers
    - GET /api/crm/customers/active/ - Get only active customers
    """
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'customer_id']
    search_fields = ['name', 'phone', 'customer_id']
    ordering_fields = ['created_at', 'updated_at', 'name', 'customer_id']
    ordering = ['-created_at']

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
                {'error': 'Failed to create customer', 'details': str(e)},
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
                {'error': 'Failed to update customer', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide better error handling"""
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': 'Failed to delete customer', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        """Return queryset with optional filtering"""
        queryset = Customer.objects.all()
        
        # Filter by active status if requested
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        # Filter by date range if provided
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            try:
                from datetime import datetime
                start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__gte=start_date_obj)
            except ValueError:
                pass  # Invalid date format, ignore the filter
        
        if end_date:
            try:
                from datetime import datetime
                end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(created_at__date__lte=end_date_obj)
            except ValueError:
                pass  # Invalid date format, ignore the filter
            
        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active customers"""
        active_customers = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_customers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search customers with separate filters for each field.
        
        Query Parameters:
        - name: partial match (case-insensitive)
        - customer_id: exact match
        - phone: exact match
        
        All provided filters are combined with AND logic.
        If no filters provided, returns all active customers.
        
        Example: /api/crm/customers/search/?name=john&phone=12345
        """
        name = request.query_params.get('name', '').strip()
        customer_id = request.query_params.get('customer_id', '').strip()
        phone = request.query_params.get('phone', '').strip()
        
        # Start with base queryset
        queryset = self.get_queryset()
        
        # Apply filters only if values are provided
        if name:
            queryset = queryset.filter(name__icontains=name)
        
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)
        
        if phone:
            queryset = queryset.filter(phone=phone)
        
        # If no filters provided, return active customers
        if not name and not customer_id and not phone:
            queryset = queryset.filter(is_active=True)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_balance(self, request, pk=None):
        """Update customer balance"""
        customer = self.get_object()
        new_balance = request.data.get('balance')
        
        if new_balance is None:
            return Response(
                {'error': 'Balance is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            customer.balance = float(new_balance)
            customer.save()
            serializer = self.get_serializer(customer)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'Invalid balance value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def update_points(self, request, pk=None):
        """Update customer points"""
        customer = self.get_object()
        new_points = request.data.get('points')
        
        if new_points is None:
            return Response(
                {'error': 'Points is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            customer.points = int(new_points)
            customer.save()
            serializer = self.get_serializer(customer)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'Invalid points value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle customer active status"""
        customer = self.get_object()
        customer.is_active = not customer.is_active
        customer.save()
        serializer = self.get_serializer(customer)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def report(self, request):
        """Get customer report with calculated fields"""
        queryset = self.get_queryset()
        
        # Apply pagination if needed
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = CustomerReportSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = CustomerReportSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def measurements(self, request, pk=None):
        """Get all measurements for a specific customer"""
        customer = self.get_object()
        measurements = CustomerMeasurement.objects.filter(customer=customer, is_active=True).select_related('material').order_by('material__material_number')
        serializer = CustomerMeasurementSerializer(measurements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def save_measurement(self, request, pk=None):
        """Save or update a customer measurement"""
        from apps.materials.models import Material
        from apps.joborder.utils import normalize_measurement_data
        from django.db import transaction as db_transaction
        
        customer = self.get_object()
        material_id = request.data.get('material')
        
        if material_id is None:
            return Response(
                {'error': 'Material field is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            material_id = int(material_id)
        except (ValueError, TypeError):
            return Response(
                {'error': f'Invalid material ID: {material_id}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            material = Material.objects.get(id=material_id)
        except Material.DoesNotExist:
            return Response(
                {'error': f'Material with ID {material_id} does not exist'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with db_transaction.atomic():
                measurement_data = request.data.copy()
                measurement_data.pop('material', None)
                normalize_measurement_data(measurement_data)
                
                # Get or create customer measurement
                customer_measurement, created = CustomerMeasurement.objects.get_or_create(
                    customer=customer,
                    material=material,
                    defaults=measurement_data
                )
                
                # If it already exists, update it
                if not created:
                    for field, value in measurement_data.items():
                        setattr(customer_measurement, field, value)
                    customer_measurement.is_active = True
                    customer_measurement.save()
                
                serializer = CustomerMeasurementSerializer(customer_measurement)
                return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'Failed to save measurement: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def next_customer_id(self, request):
        """Get the next auto-generated customer_id (total count + 1)"""
        total_count = Customer.objects.count()
        next_id = str(total_count + 1)
        return Response({'next_customer_id': next_id})

    @action(detail=False, methods=['get'])
    def count(self, request):
        """Get customer count. Optional query param: is_active=true for active only."""
        queryset = self.get_queryset()
        is_active_param = request.query_params.get('is_active')
        if is_active_param is not None and is_active_param.lower() == 'true':
            queryset = queryset.filter(is_active=True)
        count = queryset.count()
        return Response({'count': count})
