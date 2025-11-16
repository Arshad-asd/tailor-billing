from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'categories', views.ItemCategoryViewSet, basename='category')
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'stock', views.StockViewSet, basename='stock')
router.register(r'movements', views.StockMovementViewSet, basename='movement')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional endpoints for specific operations
    path('items/<int:pk>/stock-history/', views.ItemViewSet.as_view({'get': 'stock_history'}), name='item-stock-history'),
    path('items/<int:pk>/adjust-stock/', views.ItemViewSet.as_view({'post': 'adjust_stock'}), name='item-adjust-stock'),
    path('stock/low-stock-alerts/', views.StockViewSet.as_view({'get': 'low_stock_alerts'}), name='low-stock-alerts'),
    path('movements/summary/', views.StockMovementViewSet.as_view({'get': 'summary'}), name='movement-summary'),
] 