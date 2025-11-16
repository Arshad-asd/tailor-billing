from django.db import models
from apps.crm.models import Customer
from apps.materials.models import Material

# Create your models here.



class JobOrder(models.Model):
     job_order_number = models.CharField(max_length=255)
     customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
     status = models.CharField(max_length=255, choices=[('pending', 'Pending'), ('in_progress', 'In Progress'), ('completed', 'Completed'),('delivered', 'Delivered')])
     delivery_date = models.DateTimeField()
     total_amount = models.DecimalField(max_digits=10, decimal_places=2)
     advance_amount = models.DecimalField(max_digits=10, decimal_places=2)
     recived_on_delivery_amount = models.DecimalField(max_digits=10, decimal_places=2,default=0)
     balance_amount = models.DecimalField(max_digits=10, decimal_places=2,default=0)
     payment_method = models.CharField(max_length=50, choices=[
         ('cash', 'Cash'),
         ('card', 'Card'),
         ('cash_card', 'Cash Card')
     ], default='cash')
     cash_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
     card_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
     created_at = models.DateTimeField(auto_now_add=True)
     updated_at = models.DateTimeField(auto_now=True)
     is_active = models.BooleanField(default=True)
     is_blocked = models.BooleanField(default=False)
     remarks = models.TextField(null=True, blank=True)

     def __str__(self):
        return self.job_order_number

class jobOrderItem(models.Model):
    job_order = models.ForeignKey(JobOrder, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    fees = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)


class jobOrderMeasurement(models.Model):
    job_order = models.ForeignKey(JobOrder, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    thool = models.DecimalField(max_digits=10, decimal_places=2)
    kethet = models.DecimalField(max_digits=10, decimal_places=2)
    thool_kum = models.DecimalField(max_digits=10, decimal_places=2)
    ardh_f_kum = models.DecimalField(max_digits=10, decimal_places=2)
    jamba = models.DecimalField(max_digits=10, decimal_places=2)
    ragab = models.DecimalField(max_digits=10, decimal_places=2)
    note1 = models.TextField(null=True, blank=True)
    note2 = models.TextField(null=True, blank=True)
    note3 = models.TextField(null=True, blank=True)
    note4 = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
