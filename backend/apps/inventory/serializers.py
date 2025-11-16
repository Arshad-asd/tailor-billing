from rest_framework import serializers
from .models import Item, ItemCategory, Stock, StockMovement


class ItemCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    current_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Item
        fields = [
            'id', 'name', 'sku', 'description', 'category', 'category_name',
            'unit', 'is_active', 'is_raw_material', 'current_stock'
        ]
        read_only_fields = ['id', 'current_stock']
        extra_kwargs = {
            'sku': {'required': False, 'allow_blank': True, 'allow_null': True}
        }
    
    def get_current_stock(self, obj):
        """Get the current stock quantity for this item"""
        try:
            stock = Stock.objects.get(item=obj, location='main')
            return float(stock.quantity)
        except Stock.DoesNotExist:
            return 0.0


class StockSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    
    class Meta:
        model = Stock
        fields = [
            'id', 'item', 'item_name', 'item_sku', 'quantity', 
            'location', 'last_updated'
        ]
        read_only_fields = ['id', 'last_updated']


class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_sku = serializers.CharField(source='item.sku', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'item', 'item_name', 'item_sku', 'date', 'quantity',
            'movement_type', 'movement_type_display', 'reference', 'remarks'
        ]
        read_only_fields = ['id', 'date']


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for stock adjustment operations"""
    item = serializers.PrimaryKeyRelatedField(queryset=Item.objects.all())
    quantity = serializers.DecimalField(max_digits=10, decimal_places=2)
    movement_type = serializers.ChoiceField(choices=['IN', 'OUT', 'ADJUST'])
    reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    remarks = serializers.CharField(required=False, allow_blank=True)
    
    def validate_quantity(self, value):
        """Ensure quantity is positive"""
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive")
        return value
