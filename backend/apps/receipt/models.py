from django.db import models
from apps.joborder.models import JobOrder

# Create your models here.
class Receipt(models.Model):
    receipt_id = models.CharField(max_length=255)
    receipt_date = models.DateTimeField()
    receipt_amount = models.DecimalField(max_digits=10, decimal_places=2)
    receipt_remarks = models.TextField(null=True, blank=True)
    job_order = models.ForeignKey(JobOrder, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.receipt_id} - {self.job_order.job_order_number} - {self.receipt_amount}"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Receipt'
        verbose_name_plural = 'Receipts'

