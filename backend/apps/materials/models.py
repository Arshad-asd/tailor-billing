from django.db import models

# Create your models here.
class Material(models.Model):
    name = models.CharField(max_length=255)
    arabic_name = models.CharField(max_length=255, blank=True, null=True)
    material_number = models.CharField(max_length=255, unique=True, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_measurement_required = models.BooleanField(default=False)
    def __str__(self):
        return self.name