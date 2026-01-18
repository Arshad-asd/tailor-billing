from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Q
from .models import CompanyDetails, SidebarItemConfiguration, PageBackgroundSettings
from .serializers import (
    CompanyDetailsSerializer,
    SidebarItemConfigurationSerializer,
    PageBackgroundSettingsSerializer,
    GlobalSearchResultSerializer
)
from apps.joborder.models import JobOrder
from apps.crm.models import Customer
from apps.receipt.models import Receipt
from apps.sale.models import Sale


class CompanyDetailsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing company details with full CRUD operations.
    
    Provides:
    - GET /api/master/company-details/ - List all company details
    - POST /api/master/company-details/ - Create new company details
    - GET /api/master/company-details/{id}/ - Retrieve specific company details
    - PUT /api/master/company-details/{id}/ - Update company details (full update)
    - PATCH /api/master/company-details/{id}/ - Update company details (partial update)
    - DELETE /api/master/company-details/{id}/ - Delete company details
    - GET /api/master/company-details/default/ - Get default company details
    - GET /api/master/company-details/active/ - Get only active company details
    """
    queryset = CompanyDetails.objects.all()
    serializer_class = CompanyDetailsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['company_is_active', 'is_default']
    search_fields = ['company_name', 'company_name_ar', 'company_email', 'company_phone']
    ordering_fields = ['company_created_at', 'company_updated_at', 'company_name']
    ordering = ['-company_created_at']

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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
                {'error': 'Failed to create company details', 'details': str(e)},
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
                {'error': 'Failed to update company details', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide better error handling"""
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': 'Failed to delete company details', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        """Return queryset with optional filtering"""
        queryset = CompanyDetails.objects.all()
        
        # Filter by active status if requested
        is_active = self.request.query_params.get('company_is_active', None)
        if is_active is not None:
            queryset = queryset.filter(company_is_active=is_active.lower() == 'true')
        
        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active company details"""
        active_companies = self.get_queryset().filter(company_is_active=True)
        serializer = self.get_serializer(active_companies, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def default(self, request):
        """Get the default company details"""
        default_company = CompanyDetails.objects.filter(
            is_default=True,
            company_is_active=True
        ).first()
        
        if default_company:
            serializer = self.get_serializer(default_company)
            return Response(serializer.data)
        return Response(
            {'error': 'No default company found'},
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=True, methods=['patch'])
    def set_default(self, request, pk=None):
        """Set this company as the default company"""
        company = self.get_object()
        
        # Unset other default companies
        CompanyDetails.objects.filter(
            is_default=True,
            company_is_active=True
        ).exclude(id=company.id).update(is_default=False)
        
        # Set this company as default
        company.is_default = True
        company.save()
        
        serializer = self.get_serializer(company)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle company active status"""
        company = self.get_object()
        company.company_is_active = not company.company_is_active
        company.save()
        serializer = self.get_serializer(company)
        return Response(serializer.data)


class SidebarItemConfigurationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sidebar item configurations.
    
    Provides:
    - GET /api/master/sidebar-items/ - List all sidebar item configurations
    - POST /api/master/sidebar-items/ - Create new sidebar item configuration
    - GET /api/master/sidebar-items/{id}/ - Retrieve specific sidebar item configuration
    - PUT /api/master/sidebar-items/{id}/ - Update sidebar item configuration (full update)
    - PATCH /api/master/sidebar-items/{id}/ - Update sidebar item configuration (partial update)
    - DELETE /api/master/sidebar-items/{id}/ - Delete sidebar item configuration
    - GET /api/master/sidebar-items/active/ - Get only active sidebar items
    """
    queryset = SidebarItemConfiguration.objects.all()
    serializer_class = SidebarItemConfigurationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['item_name', 'item_key', 'route_path']
    ordering_fields = ['display_order', 'item_name', 'created_at']
    ordering = ['display_order', 'item_name']

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active sidebar items ordered by display_order"""
        active_items = self.get_queryset().filter(is_active=True).order_by('display_order', 'item_name')
        serializer = self.get_serializer(active_items, many=True)
        return Response(serializer.data)


class PageBackgroundSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing page background settings.
    
    Provides:
    - GET /api/master/page-backgrounds/ - List all page background settings
    - POST /api/master/page-backgrounds/ - Create new page background setting
    - GET /api/master/page-backgrounds/{id}/ - Retrieve specific page background setting
    - PUT /api/master/page-backgrounds/{id}/ - Update page background setting (full update)
    - PATCH /api/master/page-backgrounds/{id}/ - Update page background setting (partial update)
    - DELETE /api/master/page-backgrounds/{id}/ - Delete page background setting
    - GET /api/master/page-backgrounds/active/ - Get all active page background settings
    - GET /api/master/page-backgrounds/by-route/{route}/ - Get background setting for a specific route
    """
    queryset = PageBackgroundSettings.objects.all()
    serializer_class = PageBackgroundSettingsSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'background_type']
    search_fields = ['page_name', 'page_route']
    ordering_fields = ['page_name', 'created_at']
    ordering = ['page_name']

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active page background settings"""
        active_settings = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_settings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-route/(?P<route>[^/.]+)')
    def by_route(self, request, route=None):
        """Get background setting for a specific route"""
        # Reconstruct the full route path
        full_route = f"/admin/{route}" if not route.startswith('/') else route
        
        background_setting = self.get_queryset().filter(
            page_route=full_route,
            is_active=True
        ).first()
        
        if background_setting:
            serializer = self.get_serializer(background_setting)
            return Response(serializer.data)
        
        return Response(
            {'error': f'No background setting found for route: {full_route}'},
            status=status.HTTP_404_NOT_FOUND
        )


class GlobalSearchViewSet(viewsets.ViewSet):
    """
    ViewSet for global search across job orders, customers, and receipts.
    
    Provides:
    - GET /api/master/global-search/?q=query - Search across all entities
    """
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Global search across job orders, customers, and receipts.
        
        Query parameters:
        - q: Search query string (required)
        - limit: Maximum number of results per category (default: 10)
        """
        query = request.query_params.get('q', '').strip()
        limit = int(request.query_params.get('limit', 10))
        
        if not query:
            return Response(
                {'error': 'Search query is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = []
        
        # Search Job Orders
        job_orders = JobOrder.objects.filter(
            Q(job_order_number__icontains=query) |
            Q(customer__name__icontains=query) |
            Q(customer__phone__icontains=query) |
            Q(customer__customer_id__icontains=query) |
            Q(remarks__icontains=query),
            is_active=True
        ).select_related('customer')[:limit]
        
        for job_order in job_orders:
            results.append({
                'id': job_order.id,
                'type': 'job_order',
                'title': job_order.job_order_number,
                'subtitle': f"Customer: {job_order.customer.name} | Status: {job_order.status}",
                'route': f'/admin/job-orders',
                'metadata': {
                    'job_order_id': job_order.id,
                    'customer_name': job_order.customer.name,
                    'status': job_order.status,
                    'total_amount': str(job_order.total_amount),
                }
            })
        
        # Search Customers
        customers = Customer.objects.filter(
            Q(name__icontains=query) |
            Q(phone__icontains=query) |
            Q(customer_id__icontains=query),
            is_active=True
        )[:limit]
        
        for customer in customers:
            results.append({
                'id': customer.id,
                'type': 'customer',
                'title': customer.name,
                'subtitle': f"ID: {customer.customer_id} | Phone: {customer.phone}",
                'route': f'/admin/customers',
                'metadata': {
                    'customer_id': customer.id,
                    'customer_code': customer.customer_id,
                    'phone': customer.phone,
                    'balance': str(customer.balance),
                }
            })
        
        # Search Receipts
        receipts = Receipt.objects.filter(
            Q(receipt_id__icontains=query) |
            Q(job_order__job_order_number__icontains=query) |
            Q(job_order__customer__name__icontains=query) |
            Q(receipt_remarks__icontains=query),
            is_active=True
        ).select_related('job_order', 'job_order__customer')[:limit]
        
        for receipt in receipts:
            results.append({
                'id': receipt.id,
                'type': 'receipt',
                'title': receipt.receipt_id,
                'subtitle': f"Job Order: {receipt.job_order.job_order_number} | Customer: {receipt.job_order.customer.name}",
                'route': f'/admin/receipt',
                'metadata': {
                    'receipt_id': receipt.id,
                    'job_order_number': receipt.job_order.job_order_number,
                    'customer_name': receipt.job_order.customer.name,
                    'amount': str(receipt.receipt_amount),
                }
            })
        
        # Search Sales
        sales = Sale.objects.filter(
            Q(sale_number__icontains=query) |
            Q(customer_name__icontains=query) |
            Q(notes__icontains=query),
            is_active=True
        )[:limit]
        
        for sale in sales:
            results.append({
                'id': sale.id,
                'type': 'sale',
                'title': sale.sale_number,
                'subtitle': f"Customer: {sale.customer_name} | Amount: {sale.total_amount}",
                'route': f'/admin/sales',
                'metadata': {
                    'sale_id': sale.id,
                    'sale_number': sale.sale_number,
                    'customer_name': sale.customer_name,
                    'total_amount': str(sale.total_amount),
                    'status': sale.status,
                }
            })
        
        # Serialize results
        serializer = GlobalSearchResultSerializer(results, many=True)
        return Response({
            'query': query,
            'results': serializer.data,
            'count': len(results)
        })
