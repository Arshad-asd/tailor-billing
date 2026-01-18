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


class SidebarItemConfiguration(models.Model):
    """Configuration for sidebar items - allows customizing which route each sidebar item points to"""
    item_key = models.CharField(max_length=100, unique=True, help_text="Unique identifier for the sidebar item (e.g., 'dashboard', 'job-orders')")
    item_name = models.CharField(max_length=255, help_text="Display name for the sidebar item")
    route_path = models.CharField(max_length=255, help_text="The route path this item should navigate to (e.g., '/admin/dashboard')")
    icon_name = models.CharField(max_length=100, blank=True, null=True, help_text="Icon identifier (for reference)")
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0, help_text="Order in which items appear in sidebar")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', 'item_name']
        verbose_name = "Sidebar Item Configuration"
        verbose_name_plural = "Sidebar Item Configurations"

    def __str__(self):
        return f"{self.item_name} -> {self.route_path}"


class PageBackgroundSettings(models.Model):
    """Background settings for individual pages - allows customizing background image or color per page"""
    page_route = models.CharField(max_length=255, unique=True, help_text="Route path for the page (e.g., '/admin/dashboard', '/admin/job-orders')")
    page_name = models.CharField(max_length=255, help_text="Display name for the page")
    background_type = models.CharField(
        max_length=20,
        choices=[
            ('color', 'Color'),
            ('image', 'Image'),
            ('gradient', 'Gradient'),
        ],
        default='color',
        help_text="Type of background to apply"
    )
    background_color = models.CharField(max_length=50, blank=True, null=True, help_text="Background color (hex code or CSS color name)")
    background_image = models.ImageField(upload_to='page-backgrounds/', blank=True, null=True, help_text="Background image for the page")
    background_gradient = models.CharField(max_length=255, blank=True, null=True, help_text="CSS gradient string (e.g., 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page_name']
        verbose_name = "Page Background Setting"
        verbose_name_plural = "Page Background Settings"

    def __str__(self):
        return f"{self.page_name} ({self.background_type})"