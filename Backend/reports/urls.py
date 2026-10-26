from django.urls import path
from .views import ProductionReportView, InventoryReportView, ExportProductionCSVView

urlpatterns = [
    path('production/', ProductionReportView.as_view(), name='report-production'),
    path('inventory/', InventoryReportView.as_view(), name='report-inventory'),
    path('export-csv/', ExportProductionCSVView.as_view(), name='export-production-csv'),
]
