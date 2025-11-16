from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import CompanyDetails
from .serializers import CompanyDetailsSerializer


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
