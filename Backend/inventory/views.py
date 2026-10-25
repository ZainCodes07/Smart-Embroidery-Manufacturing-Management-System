from rest_framework import viewsets, filters
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
