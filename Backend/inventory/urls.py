from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet,
    MaterialViewSet,
    MaterialReceiptViewSet,
    MaterialReceiptLineViewSet,
    MaterialIssueViewSet,
    MaterialIssueLineViewSet,
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename='supplier')
router.register(r'materials', MaterialViewSet, basename='material')
router.register(r'receipts', MaterialReceiptViewSet, basename='receipt')
router.register(r'receipt-lines', MaterialReceiptLineViewSet, basename='receipt-line')
router.register(r'issues', MaterialIssueViewSet, basename='issue')
router.register(r'issue-lines', MaterialIssueLineViewSet, basename='issue-line')

urlpatterns = [
    path('', include(router.urls)),
]
