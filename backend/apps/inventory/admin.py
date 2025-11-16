from django.contrib import admin
from .models import Item, ItemCategory, Stock, StockMovement


@admin.register(ItemCategory)
class ItemCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']
    list_filter = ['name']


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'sku', 'category', 'unit', 'is_active', 
        'is_raw_material', 'get_current_stock'
    ]
    list_filter = ['category', 'is_active', 'is_raw_material', 'unit']
    search_fields = ['name', 'sku', 'description']
    list_editable = ['is_active']
    readonly_fields = ['get_current_stock']
    
    def get_current_stock(self, obj):
        """Display current stock quantity"""
        try:
            stock = Stock.objects.get(item=obj, location='main')
            return f"{stock.quantity} {obj.unit}"
        except Stock.DoesNotExist:
            return f"0 {obj.unit}"
    get_current_stock.short_description = 'Current Stock'


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['item', 'quantity', 'location', 'last_updated']
    list_filter = ['location', 'last_updated']
    search_fields = ['item__name', 'item__sku']
    readonly_fields = ['last_updated']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('item')


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = [
        'item', 'date', 'quantity', 'movement_type', 
        'reference', 'get_movement_display'
    ]
    list_filter = ['movement_type', 'date', 'item__category']
    search_fields = ['item__name', 'item__sku', 'reference', 'remarks']
    readonly_fields = ['date']
    date_hierarchy = 'date'
    
    def get_movement_display(self, obj):
        """Display movement with color coding"""
        if obj.movement_type == 'IN':
            return f"+{obj.quantity}"
        elif obj.movement_type == 'OUT':
            return f"-{obj.quantity}"
        else:
            return f"={obj.quantity}"
    get_movement_display.short_description = 'Movement'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('item')
