from django.db import models
from apps.materials.models import Material
# Create your models here.
class Customer(models.Model):
    customer_id = models.CharField(max_length=255, unique=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    balance = models.DecimalField(max_digits=10, decimal_places=2)
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.customer_id:
            # Get the highest existing customer_id number
            last_customer = Customer.objects.filter(
                customer_id__regex=r'^\d+$'
            ).order_by('customer_id').last()
            
            if last_customer:
                # Extract the number and increment it
                last_number = int(last_customer.customer_id)
                self.customer_id = str(last_number + 1)
            else:
                # Start with 1 if no customers exist
                self.customer_id = '1'
        
        super().save(*args, **kwargs)

    def __str__(self): 
        return self.name

class CustomerMeasurement(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    thool = models.CharField(max_length=100, blank=True, default='')
    kethet = models.CharField(max_length=100, blank=True, default='')
    thool_kum = models.CharField(max_length=100, blank=True, default='')
    ardh_f_kum = models.CharField(max_length=100, blank=True, default='')
    jamba = models.CharField(max_length=100, blank=True, default='')
    ragab = models.CharField(max_length=100, blank=True, default='')
    note1 = models.TextField(null=True, blank=True)
    note2 = models.TextField(null=True, blank=True)
    note3 = models.TextField(null=True, blank=True)
    note4 = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = [['customer', 'material']]
        ordering = ['material__material_number']
    
    def __str__(self):
        return self.customer.name + ' - ' + self.material.name
    
