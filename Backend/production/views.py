import datetime
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
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

    @action(detail=False, methods=['post'], url_path='commit-fleet-shift')
    def commit_fleet_shift(self, request):
        import json
        data = getattr(request, 'data', None)
        if data is None:
            try:
                data = json.loads(request.body.decode('utf-8'))
            except Exception:
                data = {}
        shift_date_str = data.get('shiftDate') or data.get('shift_date')
        shift_type = (data.get('shiftType') or data.get('shift_type') or 'DAY').upper()
        machines_data = data.get('machines', {})

        if not shift_date_str:
            shift_date = datetime.date.today()
        else:
            try:
                shift_date = datetime.datetime.strptime(shift_date_str, '%Y-%m-%d').date()
            except ValueError:
                shift_date = datetime.date.today()

        saved_shifts = []
        total_stitches = 0
        total_mirrors = 0

        # Support both dictionary mapping {1: {...}} and array of machines [{...}]
        machine_items = machines_data.values() if isinstance(machines_data, dict) else machines_data

        with transaction.atomic():
            for m_item in machine_items:
                m_num = m_item.get('number') or m_item.get('machine_number')
                runs = m_item.get('runs', [])
                if not m_num or not runs:
                    continue

                try:
                    machine = Machines.objects.get(machinenumber=int(m_num))
                except Machines.DoesNotExist:
                    continue

                operator_name = m_item.get('operator', 'Floor')
                notes = m_item.get('notes') or f"Operator: {operator_name}"

                # Update or create shift record
                shift, _ = Productionshifts.objects.update_or_create(
                    machineid=machine,
                    shiftdate=shift_date,
                    shifttype=shift_type,
                    defaults={'notes': notes[:250]}
                )
                saved_shifts.append(shift)

                for r in runs:
                    design_code = (r.get('designCode') or r.get('design_code') or 'SH-70').strip().upper()
                    if '-' in design_code:
                        parts = design_code.split('-', 1)
                        party_code = parts[0][:2]
                        design_num = parts[1][:30]
                    else:
                        party_code = 'SH'
                        design_num = design_code[:30]

                    if party_code not in ['SH', 'AB', 'D']:
                        party_code = 'SH'

                    design, _ = Designs.objects.get_or_create(
                        partycode=party_code,
                        designnumber=design_num,
                        defaults={'description': f'Pattern {design_code}', 'isactive': True}
                    )

                    part_type = (r.get('partType') or r.get('part_type') or 'TUK').strip().upper()
                    rounds = max(int(r.get('rounds') or 1), 1)
                    stitches_per_round = int(r.get('stitchesPerRound') or r.get('stitches_per_round') or 0)
                    mirrors_per_head = int(r.get('mirrorsPerHead') or r.get('mirrors_per_head') or 0)

                    run_total_stitches = rounds * stitches_per_round
                    run_total_mirrors_per_head = rounds * mirrors_per_head
                    heads_used = machine.headcount

                    Productiondetails.objects.update_or_create(
                        productionshiftid=shift,
                        designid=design,
                        parttype=part_type,
                        defaults={
                            'stitchcount': run_total_stitches,
                            'mirrorcountperhead': run_total_mirrors_per_head,
                            'headcountused': heads_used
                        }
                    )

                    total_stitches += run_total_stitches
                    total_mirrors += (run_total_mirrors_per_head * heads_used)

        return Response({
            'success': True,
            'message': f"Successfully committed shift log for {len(saved_shifts)} machines into SQL Server.",
            'shift_date': str(shift_date),
            'shift_type': shift_type,
            'machines_count': len(saved_shifts),
            'total_stitches': total_stitches,
            'total_mirrors': total_mirrors
        }, status=status.HTTP_201_CREATED)


class ProductionDetailViewSet(viewsets.ModelViewSet):
    queryset = Productiondetails.objects.all().order_by('-productionshiftid__shiftdate')
    serializer_class = ProductionDetailSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['parttype', 'designid__designcode']
