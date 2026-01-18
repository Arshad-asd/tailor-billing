from rest_framework import serializers
from .models import CompanyDetails, SidebarItemConfiguration, PageBackgroundSettings


class CompanyDetailsSerializer(serializers.ModelSerializer):
    company_logo_url = serializers.SerializerMethodField()
    
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
            'company_logo_url',
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

    def get_company_logo_url(self, obj):
        """Return the full URL for the company logo"""
        if obj.company_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company_logo.url)
            return obj.company_logo.url
        return None

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


class SidebarItemConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SidebarItemConfiguration
        fields = [
            'id',
            'item_key',
            'item_name',
            'route_path',
            'icon_name',
            'is_active',
            'display_order',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_item_key(self, value):
        """Validate item_key is unique"""
        if not value:
            raise serializers.ValidationError("Item key is required")
        return value.lower().replace(' ', '-')

    def validate_route_path(self, value):
        """Validate route_path starts with /admin/"""
        if not value.startswith('/admin/'):
            raise serializers.ValidationError("Route path must start with '/admin/'")
        return value


class PageBackgroundSettingsSerializer(serializers.ModelSerializer):
    background_image_url = serializers.SerializerMethodField()

    class Meta:
        model = PageBackgroundSettings
        fields = [
            'id',
            'page_route',
            'page_name',
            'background_type',
            'background_color',
            'background_image',
            'background_image_url',
            'background_gradient',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'background_image': {'required': False, 'allow_null': True},
            'background_color': {'required': False, 'allow_null': True},
            'background_gradient': {'required': False, 'allow_null': True},
        }

    def get_background_image_url(self, obj):
        """Return the full URL for the background image"""
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
            return obj.background_image.url
        return None

    def validate(self, data):
        """Validate that appropriate background fields are set based on background_type"""
        background_type = data.get('background_type', self.instance.background_type if self.instance else 'color')
        
        if background_type == 'color' and not data.get('background_color') and not (self.instance and self.instance.background_color):
            raise serializers.ValidationError("Background color is required when background_type is 'color'")
        
        if background_type == 'image' and not data.get('background_image') and not (self.instance and self.instance.background_image):
            raise serializers.ValidationError("Background image is required when background_type is 'image'")
        
        if background_type == 'gradient' and not data.get('background_gradient') and not (self.instance and self.instance.background_gradient):
            raise serializers.ValidationError("Background gradient is required when background_type is 'gradient'")
        
        return data


class GlobalSearchResultSerializer(serializers.Serializer):
    """Serializer for global search results"""
    id = serializers.IntegerField()
    type = serializers.CharField()  # 'job_order', 'customer', 'receipt'
    title = serializers.CharField()
    subtitle = serializers.CharField(required=False, allow_blank=True)
    route = serializers.CharField()  # Route to navigate to
    metadata = serializers.DictField(required=False)  # Additional metadata

