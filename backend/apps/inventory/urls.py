# from django.urls import path, include
# from . import views
# from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'inventory', views.InventoryViewSet, basename='inventory')
# router.register(r'materials', views.MaterialViewSet, basename='material')
# router.register(r'categories', views.CategoryViewSet, basename='category')

# urlpatterns = [
#     path('', include(router.urls)),
#     # Inventory specific endpoints
#     path('inventory/<int:pk>/adjust/', views.AdjustInventoryView.as_view(), name='adjust-inventory'),
#     path('inventory/<int:pk>/low-stock/', views.LowStockAlertView.as_view(), name='low-stock-alert'),
    
#     # Material endpoints
#     path('materials/<int:pk>/usage/', views.MaterialUsageView.as_view(), name='material-usage'),
    
#     # Reports
#     path('reports/inventory/', views.InventoryReportView.as_view(), name='inventory-report'),
#     path('reports/materials/', views.MaterialReportView.as_view(), name='material-report'),
# ] 