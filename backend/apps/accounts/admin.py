from django.contrib import admin
from .models import Transaction, TransactionLine
# Register your models here.
admin.site.register(Transaction)
admin.site.register(TransactionLine)
