from django.db import models
import random
import string

class Item(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey('ItemCategory', on_delete=models.SET_NULL, null=True)
    unit = models.CharField(max_length=20, default='meter')  # meter, piece, roll, etc.
    is_active = models.BooleanField(default=True)
    is_raw_material = models.BooleanField(default=True)  # raw/final product

    def save(self, *args, **kwargs):
        # Generate SKU if it's empty or null
        if not self.sku:
            self.sku = self.generate_sku()
        super().save(*args, **kwargs)

    def generate_sku(self):
        """Generate a unique 5-digit SKU"""
        while True:
            # Generate a 5-digit random number
            sku = ''.join(random.choices(string.digits, k=5))
            
            # Check if this SKU already exists
            if not Item.objects.filter(sku=sku).exists():
                return sku


class ItemCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)


class Stock(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100, default='main')  # Optional multi-location
    last_updated = models.DateTimeField(auto_now=True)


class StockMovement(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    movement_type = models.CharField(
        max_length=20,
        choices=[
            ('IN', 'Stock In'),
            ('OUT', 'Stock Out'),
            ('ADJUST', 'Adjustment')
        ]
    )
    reference = models.CharField(max_length=100, null=True, blank=True)  # PurchaseOrder, JobOrder, etc.
    remarks = models.TextField(null=True, blank=True)