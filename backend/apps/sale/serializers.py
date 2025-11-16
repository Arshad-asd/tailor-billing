from rest_framework import serializers
from .models import Sale, SaleItem
from apps.inventory.models import Item


class SaleItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'item', 'item_name', 'item_sku', 'quantity', 'price', 'total_amount', 'created_at', 'updated_at', 'is_active']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0")
        return value

    def validate(self, attrs):
        # Calculate total_amount
        quantity = attrs.get('quantity', 0)
        price = attrs.get('price', 0)
        attrs['total_amount'] = quantity * price
        return attrs


class SaleSerializer(serializers.ModelSerializer):
    sale_items = SaleItemSerializer(many=True, required=False)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'customer_name', 'amount', 'date', 
            'payment_method', 'status', 'notes', 'total_amount', 
            'sale_items', 'created_at', 'updated_at', 'is_active'
        ]
        read_only_fields = ['id', 'sale_number', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value

    def validate_total_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Total amount must be greater than 0")
        return value

    def create(self, validated_data):
        sale_items_data = validated_data.pop('sale_items', [])
        sale = Sale.objects.create(**validated_data)
        
        for item_data in sale_items_data:
            SaleItem.objects.create(sale=sale, **item_data)
        
        return sale

    def update(self, instance, validated_data):
        sale_items_data = validated_data.pop('sale_items', None)
        
        # Update sale fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update sale items if provided
        if sale_items_data is not None:
            # Delete existing sale items
            instance.sale_items.all().delete()
            
            # Create new sale items
            for item_data in sale_items_data:
                SaleItem.objects.create(sale=instance, **item_data)
        
        return instance


class SaleListSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Sale
        fields = [
            'id', 'sale_number', 'customer_name', 'amount', 'date', 
            'payment_method', 'status', 'total_amount', 'items_count',
            'created_at', 'is_active'
        ]
    
    def get_items_count(self, obj):
        return obj.sale_items.count()
