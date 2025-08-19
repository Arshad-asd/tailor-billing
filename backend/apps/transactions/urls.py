# from django.urls import path, include
# from . import views
# from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'transactions', views.TransactionViewSet, basename='transaction')
# router.register(r'sales', views.SalesViewSet, basename='sale')
# router.register(r'purchases', views.PurchaseViewSet, basename='purchase')

# urlpatterns = [
#     path('', include(router.urls)),
#     # Transaction specific endpoints
#     path('transactions/<int:pk>/status/', views.UpdateTransactionStatusView.as_view(), name='update-transaction-status'),
#     path('transactions/<int:pk>/receipt/', views.GenerateReceiptView.as_view(), name='generate-receipt'),
    
#     # Sales endpoints
#     path('sales/<int:pk>/complete/', views.CompleteSaleView.as_view(), name='complete-sale'),
#     path('sales/<int:pk>/refund/', views.RefundSaleView.as_view(), name='refund-sale'),
    
#     # Purchase endpoints
#     path('purchases/<int:pk>/approve/', views.ApprovePurchaseView.as_view(), name='approve-purchase'),
#     path('purchases/<int:pk>/receive/', views.ReceivePurchaseView.as_view(), name='receive-purchase'),
    
#     # Reports
#     path('reports/sales/', views.SalesReportView.as_view(), name='sales-report'),
#     path('reports/purchases/', views.PurchaseReportView.as_view(), name='purchase-report'),
#     path('reports/revenue/', views.RevenueReportView.as_view(), name='revenue-report'),
# ] 