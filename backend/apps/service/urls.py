# from django.urls import path, include
# from . import views
# from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'services', views.ServiceViewSet, basename='service')
# router.register(r'customers', views.CustomerViewSet, basename='customer')

# urlpatterns = [
#     path('', include(router.urls)),
#     # Service specific endpoints
#     path('services/<int:pk>/pricing/', views.UpdateServicePricingView.as_view(), name='update-service-pricing'),
#     path('services/<int:pk>/availability/', views.UpdateServiceAvailabilityView.as_view(), name='update-service-availability'),
    
#     # Customer endpoints
#     path('customers/<int:pk>/history/', views.CustomerHistoryView.as_view(), name='customer-history'),
#     path('customers/<int:pk>/preferences/', views.CustomerPreferencesView.as_view(), name='customer-preferences'),
    
#     # Reports
#     path('reports/services/', views.ServiceReportView.as_view(), name='service-report'),
#     path('reports/customers/', views.CustomerReportView.as_view(), name='customer-report'),
# ] 