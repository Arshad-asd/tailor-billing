from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.exceptions import ValidationError
from .models import Material
from .serializers import MaterialSerializer


class MaterialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing materials with full CRUD operations.
    
    Provides:
    - GET /api/materials/ - List all materials
    - POST /api/materials/ - Create new material
    - GET /api/materials/{id}/ - Retrieve specific material
    - PUT /api/materials/{id}/ - Update material (full update)
    - PATCH /api/materials/{id}/ - Update material (partial update)
    - DELETE /api/materials/{id}/ - Delete material
    - GET /api/materials/search/?q=query - Search materials
    - GET /api/materials/active/ - Get only active materials
    """
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_active', 'name']
    search_fields = ['name']
    ordering_fields = ['created_at', 'updated_at', 'name', 'price']
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
                {'error': 'Failed to create material', 'details': str(e)},
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
                {'error': 'Failed to update material', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """Override destroy to provide better error handling"""
        try:
            return super().destroy(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {'error': 'Failed to delete material', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_queryset(self):
        """Return queryset with optional filtering"""
        queryset = Material.objects.all()
        
        # Filter by active status if requested
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active materials"""
        active_materials = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_materials, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search materials by name"""
        query = request.query_params.get('q', '')
        if query:
            materials = self.get_queryset().filter(
                name__icontains=query
            )
            serializer = self.get_serializer(materials, many=True)
            return Response(serializer.data)
        return Response([])

    @action(detail=True, methods=['patch'])
    def toggle_status(self, request, pk=None):
        """Toggle material active status"""
        material = self.get_object()
        material.is_active = not material.is_active
        material.save()
        serializer = self.get_serializer(material)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def update_price(self, request, pk=None):
        """Update material price"""
        material = self.get_object()
        new_price = request.data.get('price')
        
        if new_price is None:
            return Response(
                {'error': 'Price is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            material.price = float(new_price)
            if material.price < 0:
                return Response(
                    {'error': 'Price cannot be negative'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            material.save()
            serializer = self.get_serializer(material)
            return Response(serializer.data)
        except ValueError:
            return Response(
                {'error': 'Invalid price value'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get material statistics"""
        queryset = self.get_queryset()
        
        total_materials = queryset.count()
        active_materials = queryset.filter(is_active=True).count()
        inactive_materials = queryset.filter(is_active=False).count()
        
        # Calculate average price
        from django.db.models import Avg
        avg_price = queryset.aggregate(avg_price=Avg('price'))['avg_price'] or 0
        
        # Calculate total value (sum of all prices)
        from django.db.models import Sum
        total_value = queryset.aggregate(total_value=Sum('price'))['total_value'] or 0
        
        return Response({
            'total_materials': total_materials,
            'active_materials': active_materials,
            'inactive_materials': inactive_materials,
            'average_price': round(float(avg_price), 2),
            'total_value': round(float(total_value), 2)
        })
