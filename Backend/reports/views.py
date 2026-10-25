from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from production.models import Productionshifts, Productiondetails
from inventory.models import Materialreceiptlines, Materialissuelines


class ProductionReportView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        shifts = Productionshifts.objects.all().order_by('-shiftdate')
        if start_date:
            shifts = shifts.filter(shiftdate__gte=start_date)
        if end_date:
            shifts = shifts.filter(shiftdate__lte=end_date)

        report_data = []
        for s in shifts[:100]:
            total_stitches = s.details.aggregate(total=Sum('stitchcount'))['total'] or 0
            total_mirrors = s.details.aggregate(total=Sum('totalmirrors'))['total'] or 0
            report_data.append({
                'shift_id': s.productionshiftid,
                'machine': s.machineid.machinenumber,
                'date': s.shiftdate,
                'type': s.shifttype,
                'total_stitches': total_stitches,
                'total_mirrors': total_mirrors,
            })

        return Response(report_data)


class InventoryReportView(APIView):
    def get(self, request):
        receipts = Materialreceiptlines.objects.values(
            'materialid__materialname', 'materialid__variant'
        ).annotate(total_received=Sum('basequantity')).order_by('materialid__materialname')

        issues = Materialissuelines.objects.values(
            'materialid__materialname', 'materialid__variant'
        ).annotate(total_issued=Sum('issuequantity')).order_by('materialid__materialname')

        return Response({
            'receipts_summary': list(receipts),
            'issues_summary': list(issues)
        })
