from apps.crm.models import CustomerMeasurement, Customer
from apps.joborder.models import JobOrder
from django.db.models import Sum
from decimal import Decimal


def update_customer_balance(customer):
    """
    Update customer balance by summing all active job orders' balance_amount for that customer.
    """
    total_balance = JobOrder.objects.filter(
        customer=customer,
        is_active=True
    ).aggregate(
        total=Sum('balance_amount')
    )['total'] or Decimal('0')
    
    customer.balance = total_balance
    customer.save(update_fields=['balance'])


def update_customer_points(customer):
    """
    Update customer points based on 1% of total amount from all active job orders.
    Points are calculated as: sum of all job orders' total_amount * 0.01 (rounded to integer)
    """
    total_amount = JobOrder.objects.filter(
        customer=customer,
        is_active=True
    ).aggregate(
        total=Sum('total_amount')
    )['total'] or Decimal('0')
    
    # Calculate 1% of total amount and convert to integer points
    points = int(float(total_amount) * 0.01)
    
    customer.points = points
    customer.save(update_fields=['points'])


def sync_customer_measurements(job_order):
    """
    Sync job order measurements to customer measurements.
    For each material in job order measurements, create or update customer measurement.
    Ensures one measurement per customer-material combination.
    """
    customer = job_order.customer
    job_order_measurements = job_order.jobordermeasurement_set.filter(is_active=True)
    
    for job_measurement in job_order_measurements:
        material = job_measurement.material
        
        # Get or create customer measurement for this customer-material combination
        customer_measurement, created = CustomerMeasurement.objects.get_or_create(
            customer=customer,
            material=material,
            defaults={
                'thool': job_measurement.thool,
                'kethet': job_measurement.kethet,
                'thool_kum': job_measurement.thool_kum,
                'ardh_f_kum': job_measurement.ardh_f_kum,
                'jamba': job_measurement.jamba,
                'ragab': job_measurement.ragab,
                'note1': job_measurement.note1,
                'note2': job_measurement.note2,
                'note3': job_measurement.note3,
                'note4': job_measurement.note4,
            }
        )
        
        # If it already exists, update it
        if not created:
            customer_measurement.thool = job_measurement.thool
            customer_measurement.kethet = job_measurement.kethet
            customer_measurement.thool_kum = job_measurement.thool_kum
            customer_measurement.ardh_f_kum = job_measurement.ardh_f_kum
            customer_measurement.jamba = job_measurement.jamba
            customer_measurement.ragab = job_measurement.ragab
            customer_measurement.note1 = job_measurement.note1
            customer_measurement.note2 = job_measurement.note2
            customer_measurement.note3 = job_measurement.note3
            customer_measurement.note4 = job_measurement.note4
            customer_measurement.is_active = True
            customer_measurement.save()
