from django.db import models
from django.utils import timezone
from apps.inventory.models import Item
import random
import string

# Create your models here.
class Sale(models.Model):
    
    sale_number = models.CharField(max_length=255, unique=True, blank=True)
    customer_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now)
    payment_method = models.CharField(max_length=255, choices=[('cash', 'Cash'), ('bank', 'Bank'),('cash_bank', 'Cash Bank')])
    status = models.CharField(max_length=255, default='pending')
    notes = models.TextField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        # Generate sale number if it's empty or null
        if not self.sale_number:
            self.sale_number = self.generate_sale_number()
        super().save(*args, **kwargs)

    def generate_sale_number(self):
        """Generate a unique sale number"""
        while True:
            # Generate a 6-digit random number with prefix 'SALE-'
            sale_number = 'SALE-' + ''.join(random.choices(string.digits, k=6))
            
            # Check if this sale number already exists
            if not Sale.objects.filter(sale_number=sale_number).exists():
                return sale_number

    def __str__(self):
        return self.sale_number


class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='sale_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.sale.sale_number + ' - ' + self.item.name