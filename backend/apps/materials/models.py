from django.db import models

# Create your models here.
class Material(models.Model):
    name = models.CharField(max_length=255)
    thool = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    kethet = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    thool_kum = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ardh_f_kum = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    jamba = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    ragab = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_measurement_required = models.BooleanField(default=False)
    def __str__(self):
        return self.name