from rest_framework import serializers
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = [
            'id',
            'name',
            'material_number',
            'price',
            'created_at',
            'updated_at',
            'is_active',
            'is_measurement_required'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        """Validate material name is not empty"""
        if not value or not value.strip():
            raise serializers.ValidationError("Material name is required")
        return value.strip()

    def validate_price(self, value):
        """Validate price is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Price cannot be negative")
        return value

    def validate_material_number(self, value):
        """Validate material number if provided"""
        if value and not value.strip():
            raise serializers.ValidationError("Material number cannot be empty if provided")
        return value.strip() if value else value
