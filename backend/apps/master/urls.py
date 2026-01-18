from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CompanyDetailsViewSet,
    SidebarItemConfigurationViewSet,
    PageBackgroundSettingsViewSet
)

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'company-details', CompanyDetailsViewSet, basename='company-details')
router.register(r'sidebar-items', SidebarItemConfigurationViewSet, basename='sidebar-items')
router.register(r'page-backgrounds', PageBackgroundSettingsViewSet, basename='page-backgrounds')

urlpatterns = [
    path('', include(router.urls)),
]
