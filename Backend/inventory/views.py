from decimal import Decimal
from django.db.models import Sum
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Suppliers,
    Materials,
    Materialreceipts,
    Materialreceiptlines,
    Materialissues,
    Materialissuelines,
)
from .serializers import (
    SupplierSerializer,
    MaterialSerializer,
    MaterialReceiptSerializer,
    MaterialReceiptLineSerializer,
    MaterialIssueSerializer,
    MaterialIssueLineSerializer,
)


class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Suppliers.objects.all().order_by('suppliername')
    serializer_class = SupplierSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['suppliername', 'phone']


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Materials.objects.all().order_by('category', 'materialname')
    serializer_class = MaterialSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['materialname', 'variant', 'category']

    @action(detail=False, methods=['get'], url_path='stock-balance')
    def stock_balance(self, request):
        materials = Materials.objects.filter(isactive=True).order_by('category', 'materialname')
        data = []
        for m in materials:
            inward = Materialreceiptlines.objects.filter(materialid=m).aggregate(total=Sum('basequantity'))['total'] or Decimal('0.0')
            outward = Materialissuelines.objects.filter(materialid=m).aggregate(total=Sum('issuequantity'))['total'] or Decimal('0.0')
            balance = inward - outward
            data.append({
                'material_id': m.materialid,
                'material_name': m.materialname,
                'variant': m.variant,
                'category': m.category,
                'base_unit': m.baseunit,
                'total_received': float(inward),
                'total_issued': float(outward),
                'current_balance': float(balance),
                'status': 'Low Stock' if balance < 10 else 'Adequate'
            })
        return Response(data)


class MaterialReceiptViewSet(viewsets.ModelViewSet):
    queryset = Materialreceipts.objects.all().order_by('-receiptdate', '-receiptid')
    serializer_class = MaterialReceiptSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['billnumber', 'notes']


class MaterialReceiptLineViewSet(viewsets.ModelViewSet):
    queryset = Materialreceiptlines.objects.all()
    serializer_class = MaterialReceiptLineSerializer


class MaterialIssueViewSet(viewsets.ModelViewSet):
    queryset = Materialissues.objects.all().order_by('-issuedate', '-issueid')
    serializer_class = MaterialIssueSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['notes']


class MaterialIssueLineViewSet(viewsets.ModelViewSet):
    queryset = Materialissuelines.objects.all()
    serializer_class = MaterialIssueLineSerializer
