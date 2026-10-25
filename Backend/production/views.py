from rest_framework import viewsets, filters
from .models import Machines, Designs, Productionshifts, Productiondetails
from .serializers import (
    MachineSerializer,
    DesignSerializer,
    ProductionShiftSerializer,
    ProductionDetailSerializer,
)


class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machines.objects.all().order_by('machinenumber')
    serializer_class = MachineSerializer


class DesignViewSet(viewsets.ModelViewSet):
    queryset = Designs.objects.all().order_by('partycode', 'designnumber')
    serializer_class = DesignSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['designcode', 'designnumber', 'partycode']


class ProductionShiftViewSet(viewsets.ModelViewSet):
    queryset = Productionshifts.objects.all().order_by('-shiftdate', 'machineid')
    serializer_class = ProductionShiftSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['shiftdate', 'shifttype']


class ProductionDetailViewSet(viewsets.ModelViewSet):
    queryset = Productiondetails.objects.all().order_by('-productionshiftid__shiftdate')
    serializer_class = ProductionDetailSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['parttype', 'designid__designcode']
