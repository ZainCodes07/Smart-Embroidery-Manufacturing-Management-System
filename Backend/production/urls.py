from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MachineViewSet,
    DesignViewSet,
    ProductionShiftViewSet,
    ProductionDetailViewSet,
)

router = DefaultRouter()
router.register(r'machines', MachineViewSet, basename='machine')
router.register(r'designs', DesignViewSet, basename='design')
router.register(r'shifts', ProductionShiftViewSet, basename='production-shift')
router.register(r'details', ProductionDetailViewSet, basename='production-detail')

urlpatterns = [
    path('', include(router.urls)),
]
