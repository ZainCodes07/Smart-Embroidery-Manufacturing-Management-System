import csv
from django.http import HttpResponse
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
                'date': str(s.shiftdate),
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


class ExportProductionCSVView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        machine_num = request.query_params.get('machine')

        shifts = Productionshifts.objects.all().order_by('-shiftdate', 'machineid__machinenumber')
        if start_date:
            shifts = shifts.filter(shiftdate__gte=start_date)
        if end_date:
            shifts = shifts.filter(shiftdate__lte=end_date)
        if machine_num:
            shifts = shifts.filter(machineid__machinenumber=int(machine_num))

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="ZJI_Fashions_Production_Audit.csv"'
        response.write('\ufeff')  # UTF-8 BOM for Microsoft Excel

        writer = csv.writer(response)
        writer.writerow([
            "Shift ID", "Date", "Shift Type", "Machine Unit", "Head Count",
            "Design Code", "Part Type", "Stitches Logged", "Mirrors Per Head",
            "Total Mirrors Consumed", "Notes"
        ])

        for s in shifts:
            details = s.details.all()
            if details.exists():
                for d in details:
                    writer.writerow([
                        s.productionshiftid,
                        str(s.shiftdate),
                        s.shifttype,
                        f"Machine {s.machineid.machinenumber}",
                        s.machineid.headcount,
                        d.designid.designcode,
                        d.parttype,
                        d.stitchcount,
                        d.mirrorcountperhead,
                        d.totalmirrors,
                        s.notes or ""
                    ])
            else:
                writer.writerow([
                    s.productionshiftid,
                    str(s.shiftdate),
                    s.shifttype,
                    f"Machine {s.machineid.machinenumber}",
                    s.machineid.headcount,
                    "-", "-", 0, 0, 0, s.notes or ""
                ])

        return response
