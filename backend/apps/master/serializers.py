from rest_framework import serializers
from .models import CompanyDetails


class CompanyDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDetails
        fields = [
            'id',
            'company_name',
            'company_name_ar',
            'company_address',
            'company_phone',
            'company_email',
            'company_website',
            'company_logo',
            'company_currency',
            'company_open_time',
            'company_close_time',
            'company_created_at',
            'company_updated_at',
            'company_is_active',
            'is_default',
        ]
        read_only_fields = ['id', 'company_created_at', 'company_updated_at']
        extra_kwargs = {
            'company_logo': {'required': False, 'allow_null': True},
        }

    def validate_company_email(self, value):
        """Validate company email format"""
        if not value:
            raise serializers.ValidationError("Company email is required")
        return value

    def validate_company_phone(self, value):
        """Validate company phone number"""
        if not value:
            raise serializers.ValidationError("Company phone is required")
        return value

    def validate_company_name(self, value):
        """Validate company name"""
        if not value:
            raise serializers.ValidationError("Company name is required")
        return value

    def validate(self, data):
        """Validate that only one company can be set as default"""
        is_default = data.get('is_default', False)
        if is_default:
            # Check if another company is already set as default
            existing_default = CompanyDetails.objects.filter(
                is_default=True,
                company_is_active=True
            ).exclude(id=self.instance.id if self.instance else None)
            
            if existing_default.exists():
                raise serializers.ValidationError(
                    "Another company is already set as default. Please unset it first."
                )
        return data

