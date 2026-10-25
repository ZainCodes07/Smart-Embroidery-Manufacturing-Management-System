from django.urls import path
from .views import ProductionReportView, InventoryReportView

urlpatterns = [
    path('production/', ProductionReportView.as_view(), name='report-production'),
    path('inventory/', InventoryReportView.as_view(), name='report-inventory'),
]
