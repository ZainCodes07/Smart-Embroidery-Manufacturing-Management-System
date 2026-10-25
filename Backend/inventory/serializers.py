from rest_framework import serializers
from .models import (
    Suppliers,
    Materials,
    Materialreceipts,
    Materialreceiptlines,
    Materialissues,
    Materialissuelines,
)


class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Suppliers
        fields = '__all__'


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materials
        fields = '__all__'


class MaterialReceiptLineSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='materialid.materialname')
    material_variant = serializers.ReadOnlyField(source='materialid.variant')

    class Meta:
        model = Materialreceiptlines
        fields = '__all__'


class MaterialReceiptSerializer(serializers.ModelSerializer):
    supplier_name = serializers.ReadOnlyField(source='supplierid.suppliername')
    lines = MaterialReceiptLineSerializer(many=True, read_only=True)

    class Meta:
        model = Materialreceipts
        fields = '__all__'


class MaterialIssueLineSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='materialid.materialname')
    material_variant = serializers.ReadOnlyField(source='materialid.variant')

    class Meta:
        model = Materialissuelines
        fields = '__all__'


class MaterialIssueSerializer(serializers.ModelSerializer):
    machine_number = serializers.ReadOnlyField(source='machineid.machinenumber')
    lines = MaterialIssueLineSerializer(many=True, read_only=True)

    class Meta:
        model = Materialissues
        fields = '__all__'
