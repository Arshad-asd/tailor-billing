from django.db import models
from apps.crm.models import Customer
from apps.joborder.models import JobOrder
from apps.sale.models import Sale
from apps.receipt.models import Receipt

class Transaction(models.Model):
    transaction_method_choices = [
        ('job_order', 'Job Order'),
        ('sale', 'Sale'),
        ('receipt', 'Receipt'),
    ]
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, null=True, blank=True)
    job_order = models.ForeignKey(JobOrder, on_delete=models.CASCADE, null=True, blank=True)
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, null=True, blank=True)
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, null=True, blank=True)
    transaction_id = models.CharField(max_length=255)
    transaction_method = models.CharField(max_length=255, choices=transaction_method_choices)
    transaction_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_date = models.DateTimeField()
    transaction_status = models.CharField(max_length=255)
    transaction_remarks = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.transaction_id
    
class TransactionLine(models.Model):
    transaction_line_type_choices = [
        ('credit', 'Credit'),
        ('debit', 'Debit'),
    ]
    transaction_line_method_choices = [
        ('job_order_advance', 'Job Order Advance'),
        ('job_order_delivery', 'Job Order Delivery'),
        ('sale', 'Sale'),
        ('receipt', 'Receipt'),
    ]
    transaction = models.ForeignKey(Transaction, on_delete=models.CASCADE)
    transaction_line_type = models.CharField(max_length=255, choices=transaction_line_type_choices)
    transaction_line_method = models.CharField(max_length=255, choices=transaction_line_method_choices)
    transaction_line_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_line_description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.transaction_line_type