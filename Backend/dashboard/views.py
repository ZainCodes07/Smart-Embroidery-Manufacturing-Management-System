from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count
from inventory.models import Suppliers, Materials, Materialreceipts, Materialissues
from production.models import Machines, Designs, Productionshifts, Productiondetails


class DashboardStatsView(APIView):
    def get(self, request):
        stats = {
            'total_machines': Machines.objects.filter(isactive=True).count(),
            'total_designs': Designs.objects.filter(isactive=True).count(),
            'total_suppliers': Suppliers.objects.filter(isactive=True).count(),
            'total_materials': Materials.objects.filter(isactive=True).count(),
            'total_shifts_logged': Productionshifts.objects.count(),
            'total_stitches': Productiondetails.objects.aggregate(total=Sum('stitchcount'))['total'] or 0,
            'total_mirrors': Productiondetails.objects.aggregate(total=Sum('totalmirrors'))['total'] or 0,
        }
        return Response(stats)
