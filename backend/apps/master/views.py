from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import CompanyDetails, SidebarItemConfiguration, PageBackgroundSettings
from .serializers import (
    CompanyDetailsSerializer,
    SidebarItemConfigurationSerializer,
    PageBackgroundSettingsSerializer
)


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
    - GET /api/master/page-backgrounds/active/ - Get only active page background settings
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
