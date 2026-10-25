from django.contrib import admin
from .models import Machines, Designs, Productionshifts, Productiondetails


class ProductionDetailsInline(admin.TabularInline):
    model = Productiondetails
    extra = 1
    fields = ('designid', 'parttype', 'stitchcount', 'mirrorcountperhead', 'headcountused', 'totalmirrors')


@admin.register(Machines)
class MachinesAdmin(admin.ModelAdmin):
    list_display = ('machineid', 'machinenumber', 'machinename', 'headcount', 'isactive', 'createdat')
    list_filter = ('isactive', 'headcount')
    search_fields = ('machinename', 'machinenumber')
    ordering = ('machinenumber',)


@admin.register(Designs)
class DesignsAdmin(admin.ModelAdmin):
    list_display = ('designid', 'designcode', 'partycode', 'designnumber', 'description', 'isactive', 'createdat')
    list_filter = ('partycode', 'isactive')
    search_fields = ('designcode', 'designnumber', 'description')
    ordering = ('partycode', 'designnumber')


@admin.register(Productionshifts)
class ProductionshiftsAdmin(admin.ModelAdmin):
    list_display = ('productionshiftid', 'machineid', 'shiftdate', 'shifttype', 'createdat')
    list_filter = ('shifttype', 'shiftdate', 'machineid')
    search_fields = ('notes',)
    inlines = [ProductionDetailsInline]
    ordering = ('-shiftdate', 'machineid', 'shifttype')


@admin.register(Productiondetails)
class ProductiondetailsAdmin(admin.ModelAdmin):
    list_display = ('productiondetailid', 'productionshiftid', 'designid', 'parttype', 'stitchcount', 'mirrorcountperhead', 'headcountused', 'totalmirrors')
    list_filter = ('parttype', 'productionshiftid__shiftdate', 'designid')
    search_fields = ('parttype',)
