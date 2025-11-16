from django.db import models

class CompanyDetails(models.Model):
    company_name = models.CharField(max_length=255)
    company_name_ar = models.CharField(max_length=255)
    company_address = models.TextField()
    company_phone = models.CharField(max_length=255)
    company_email = models.EmailField(max_length=255)
    company_website = models.URLField(max_length=255)
    company_logo = models.ImageField(upload_to='company/', blank=True, null=True)
    company_currency = models.CharField(max_length=255)
    company_open_time = models.TimeField()
    company_close_time = models.TimeField()
    company_created_at = models.DateTimeField(auto_now_add=True)
    company_updated_at = models.DateTimeField(auto_now=True)
    company_is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return self.company_name