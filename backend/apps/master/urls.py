from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyDetailsViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'company-details', CompanyDetailsViewSet, basename='company-details')

urlpatterns = [
    path('', include(router.urls)),
]
