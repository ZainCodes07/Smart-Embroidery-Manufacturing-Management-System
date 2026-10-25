from django.contrib import admin
from .models import (
    Suppliers,
    Materials,
    Materialreceipts,
    Materialreceiptlines,
    Materialissues,
    Materialissuelines,
)


class MaterialReceiptLinesInline(admin.TabularInline):
    model = Materialreceiptlines
    extra = 1
    fields = ('materialid', 'purchasequantity', 'purchaseunit', 'conversionfactor', 'unitrate', 'linetotal', 'notes')


class MaterialIssueLinesInline(admin.TabularInline):
    model = Materialissuelines
    extra = 1
    fields = ('materialid', 'issuequantity', 'notes')


@admin.register(Suppliers)
class SuppliersAdmin(admin.ModelAdmin):
    list_display = ('supplierid', 'suppliername', 'phone', 'address', 'isactive', 'createdat')
    list_filter = ('isactive', 'createdat')
    search_fields = ('suppliername', 'phone', 'address')
    ordering = ('supplierid',)


@admin.register(Materials)
class MaterialsAdmin(admin.ModelAdmin):
    list_display = ('materialid', 'materialname', 'variant', 'category', 'baseunit', 'isactive', 'createdat')
    list_filter = ('category', 'isactive', 'baseunit')
    search_fields = ('materialname', 'variant')
    ordering = ('materialid',)


@admin.register(Materialreceipts)
class MaterialreceiptsAdmin(admin.ModelAdmin):
    list_display = ('receiptid', 'receiptdate', 'receipttype', 'supplierid', 'billnumber', 'createdat')
    list_filter = ('receipttype', 'receiptdate')
    search_fields = ('billnumber', 'notes')
    inlines = [MaterialReceiptLinesInline]
    ordering = ('-receiptdate', '-receiptid')


@admin.register(Materialreceiptlines)
class MaterialreceiptlinesAdmin(admin.ModelAdmin):
    list_display = ('receiptlineid', 'receiptid', 'materialid', 'purchasequantity', 'purchaseunit', 'unitrate', 'linetotal')
    list_filter = ('purchaseunit',)
    search_fields = ('receiptid__billnumber', 'notes')


@admin.register(Materialissues)
class MaterialissuesAdmin(admin.ModelAdmin):
    list_display = ('issueid', 'issuedate', 'issuetype', 'machineid', 'createdat')
    list_filter = ('issuetype', 'issuedate', 'machineid')
    search_fields = ('notes',)
    inlines = [MaterialIssueLinesInline]
    ordering = ('-issuedate', '-issueid')


@admin.register(Materialissuelines)
class MaterialissuelinesAdmin(admin.ModelAdmin):
    list_display = ('issuelineid', 'issueid', 'materialid', 'issuequantity')
    search_fields = ('notes',)
