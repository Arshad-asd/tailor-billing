# from django.urls import path, include
# from . import views
# from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'job-orders', views.JobOrderViewSet, basename='job-order')
# router.register(r'measurements', views.MeasurementViewSet, basename='measurement')

# urlpatterns = [
#     path('', include(router.urls)),
#     # Job Order specific endpoints
#     path('job-orders/<int:pk>/status/', views.UpdateJobOrderStatusView.as_view(), name='update-job-order-status'),
#     path('job-orders/<int:pk>/assign/', views.AssignJobOrderView.as_view(), name='assign-job-order'),
#     path('job-orders/<int:pk>/complete/', views.CompleteJobOrderView.as_view(), name='complete-job-order'),
    
#     # Measurement endpoints
#     path('measurements/<int:pk>/update/', views.UpdateMeasurementView.as_view(), name='update-measurement'),
    
#     # Dashboard and reports
#     path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
#     path('reports/job-orders/', views.JobOrderReportView.as_view(), name='job-order-report'),
# ] 