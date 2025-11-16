from django.db import models

# Create your models here.
class Material(models.Model):
    name = models.CharField(max_length=255)
    thool = models.DecimalField(max_digits=10, decimal_places=2)
    kethet = models.DecimalField(max_digits=10, decimal_places=2)
    thool_kum = models.DecimalField(max_digits=10, decimal_places=2)
    ardh_f_kum = models.DecimalField(max_digits=10, decimal_places=2)
    jamba = models.DecimalField(max_digits=10, decimal_places=2)
    ragab = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name