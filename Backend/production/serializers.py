from rest_framework import serializers
from .models import Machines, Designs, Productionshifts, Productiondetails


class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machines
        fields = '__all__'


class DesignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Designs
        fields = '__all__'


class ProductionDetailSerializer(serializers.ModelSerializer):
    design_code = serializers.ReadOnlyField(source='designid.designcode')
    party_code = serializers.ReadOnlyField(source='designid.partycode')

    class Meta:
        model = Productiondetails
        fields = '__all__'


class ProductionShiftSerializer(serializers.ModelSerializer):
    machine_number = serializers.ReadOnlyField(source='machineid.machinenumber')
    details = ProductionDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Productionshifts
        fields = '__all__'
