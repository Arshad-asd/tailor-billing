from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import JobOrderViewSet

router = DefaultRouter()
router.register(r'', JobOrderViewSet, basename='joborder')

urlpatterns = [
    path('', include(router.urls)),
]
