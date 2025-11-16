from rest_framework import serializers
from .models import Material


class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = [
            'id',
            'name',
            'thool',
            'kethet',
            'thool_kum',
            'ardh_f_kum',
            'jamba',
            'ragab',
            'price',
            'created_at',
            'updated_at',
            'is_active'
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

    def validate_thool(self, value):
        """Validate thool measurement is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Thool measurement cannot be negative")
        return value

    def validate_kethet(self, value):
        """Validate kethet measurement is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Kethef measurement cannot be negative")
        return value

    def validate_thool_kum(self, value):
        """Validate thool_kum measurement is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Thool Kum measurement cannot be negative")
        return value

    def validate_ardh_f_kum(self, value):
        """Validate ardh_f_kum measurement is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Ardh F Kum measurement cannot be negative")
        return value

    def validate_jamba(self, value):
        """Validate jamba measurement is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Jamba measurement cannot be negative")
        return value

    def validate_ragab(self, value):
        """Validate ragab measurement is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Ragab measurement cannot be negative")
        return value
