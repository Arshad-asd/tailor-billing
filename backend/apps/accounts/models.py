# from django.db import models

# class Transaction(models.Model):
#     transaction_id = models.CharField(max_length=255)
#     transaction_type = models.CharField(max_length=255)
#     transaction_amount = models.DecimalField(max_digits=10, decimal_places=2)
#     transaction_date = models.DateTimeField()
#     transaction_status = models.CharField(max_length=255)
#     transaction_remarks = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     is_active = models.BooleanField(default=True)

#     def __str__(self):
#         return self.transaction_id
    
# class TransactionLine(models.Model):
#     transaction_type = models.CharField(max_length=255)
#     transaction_type_description = models.TextField(null=True, blank=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     is_active = models.BooleanField(default=True)

#     def __str__(self):
#         return self.transaction_type