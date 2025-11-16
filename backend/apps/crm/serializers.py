from rest_framework import serializers
from .models import Customer
from django.db.models import Count, Sum, Max
from apps.joborder.models import JobOrder
from apps.sale.models import Sale


class CustomerSerializer(serializers.ModelSerializer):
    total_orders = serializers.SerializerMethodField()
    total_order_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id',
            'customer_id',
            'name',
            'phone',
            'balance',
            'points',
            'total_orders',
            'total_order_amount',
            'created_at',
            'updated_at',
            'is_active'
        ]
        read_only_fields = ['id', 'customer_id', 'created_at', 'updated_at']
        extra_kwargs = {
            'balance': {'required': False},
            'points': {'required': False},
        }
    
    def get_total_orders(self, obj):
        """Calculate total job orders for this customer"""
        return JobOrder.objects.filter(customer=obj, is_active=True).count()
    
    def get_total_order_amount(self, obj):
        """Calculate total amount from job orders for this customer"""
        from django.db.models import Sum
        result = JobOrder.objects.filter(customer=obj, is_active=True).aggregate(
            total=Sum('total_amount')
        )
        return float(result['total'] or 0)

    def create(self, validated_data):
        """Override create to provide default values for balance and points"""
        # Set default values if not provided
        if 'balance' not in validated_data:
            validated_data['balance'] = 0.00
        if 'points' not in validated_data:
            validated_data['points'] = 0
        
        return super().create(validated_data)

    def validate_phone(self, value):
        """Validate phone number format"""
        if not value:
            raise serializers.ValidationError("Phone number is required")
        # Add more phone validation logic if needed
        return value

    def validate_balance(self, value):
        """Validate balance is not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Balance cannot be negative")
        return value

    def validate_points(self, value):
        """Validate points are not negative"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Points cannot be negative")
        return value


class CustomerReportSerializer(serializers.ModelSerializer):
    """Serializer for customer reports with calculated fields"""
    total_orders = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    balance_amount = serializers.SerializerMethodField()
    last_order_date = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    
    class Meta:
        model = Customer
        fields = [
            'id',
            'customer_id',
            'name',
            'phone',
            'email',
            'balance',
            'points',
            'total_orders',
            'total_amount',
            'balance_amount',
            'last_order_date',
            'created_at',
            'updated_at',
            'is_active'
        ]
        read_only_fields = ['id', 'customer_id', 'created_at', 'updated_at']
    
    def get_total_orders(self, obj):
        """Calculate total job orders for this customer"""
        return JobOrder.objects.filter(customer=obj, is_active=True).count()
    
    def get_total_amount(self, obj):
        """Calculate total amount from job orders for this customer"""
        job_orders = JobOrder.objects.filter(customer=obj, is_active=True)
        total = sum(order.total_amount for order in job_orders)
        return round(total, 2)
    
    def get_balance_amount(self, obj):
        """Calculate total balance amount from job orders for this customer"""
        job_orders = JobOrder.objects.filter(customer=obj, is_active=True)
        balance = sum(order.balance_amount for order in job_orders)
        return round(balance, 2)
    
    def get_last_order_date(self, obj):
        """Get the date of the most recent job order for this customer"""
        last_order = JobOrder.objects.filter(customer=obj, is_active=True).order_by('-created_at').first()
        return last_order.created_at if last_order else None
    
    def get_email(self, obj):
        """Return empty string for email since it's not in the model"""
        return ""
