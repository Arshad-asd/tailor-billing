from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from apps.crm.models import Customer
from apps.materials.models import Material
from .models import JobOrder, jobOrderItem, jobOrderMeasurement

User = get_user_model()


class JobOrderAPITestCase(APITestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            email='test@example.com',
            name='Test User',
            password='testpass123'
        )
        
        # Create test customer
        self.customer = Customer.objects.create(
            customer_id='CUST001',
            name='John Doe',
            phone='+1234567890',
            balance=0.00
        )
        
        # Create test material
        self.material = Material.objects.create(
            name='Test Material',
            price=100.00,
            thool=145.00,
            kethet=43.00,
            thool_kum=61.00,
            ardh_f_kum=17.00,
            jamba=9.00,
            ragab=12.00
        )
        
        # Authenticate user
        self.client.force_authenticate(user=self.user)
    
    def test_create_job_order_with_existing_customer(self):
        """Test creating job order with existing customer"""
        url = reverse('joborder-list')
        data = {
            'customer_id': self.customer.id,
            'status': 'pending',
            'delivery_date': '2024-01-15T10:00:00Z',
            'total_amount': 150.00,
            'advance_amount': 50.00,
            'remarks': 'Test order',
            'job_order_items': [
                {
                    'material': self.material.id,
                    'quantity': 1,
                    'fees': 150.00
                }
            ],
            'job_order_measurements': [
                {
                    'material': self.material.id,
                    'thool': 145.00,
                    'kethet': 43.00,
                    'thool_kum': 61.00,
                    'ardh_f_kum': 17.00,
                    'jamba': 9.00,
                    'ragab': 12.00
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify job order was created
        job_order = JobOrder.objects.get(id=response.data['id'])
        self.assertEqual(job_order.customer, self.customer)
        self.assertEqual(job_order.status, 'pending')
        self.assertEqual(job_order.total_amount, 150.00)
        self.assertEqual(job_order.balance_amount, 100.00)
        
        # Verify job order items were created
        self.assertEqual(job_order.joborderitem_set.count(), 1)
        item = job_order.joborderitem_set.first()
        self.assertEqual(item.material, self.material)
        self.assertEqual(item.quantity, 1)
        self.assertEqual(item.fees, 150.00)
        self.assertEqual(item.total_amount, 150.00)
        
        # Verify measurements were created
        self.assertEqual(job_order.jobordermeasurement_set.count(), 1)
        measurement = job_order.jobordermeasurement_set.first()
        self.assertEqual(measurement.material, self.material)
        self.assertEqual(measurement.thool, 145.00)
    
    def test_create_job_order_with_new_customer(self):
        """Test creating job order with new customer"""
        url = reverse('joborder-list')
        data = {
            'customer_data': {
                'customer_id': 'CUST002',
                'name': 'Jane Doe',
                'phone': '+1234567891',
                'balance': 0.00
            },
            'status': 'pending',
            'delivery_date': '2024-01-15T10:00:00Z',
            'total_amount': 200.00,
            'advance_amount': 100.00,
            'remarks': 'Test order with new customer',
            'job_order_items': [
                {
                    'material': self.material.id,
                    'quantity': 2,
                    'fees': 100.00
                }
            ]
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify new customer was created
        new_customer = Customer.objects.get(customer_id='CUST002')
        self.assertEqual(new_customer.name, 'Jane Doe')
        
        # Verify job order was created with new customer
        job_order = JobOrder.objects.get(id=response.data['id'])
        self.assertEqual(job_order.customer, new_customer)
        self.assertEqual(job_order.balance_amount, 100.00)
    
    def test_list_job_orders(self):
        """Test listing job orders"""
        # Create a job order
        job_order = JobOrder.objects.create(
            job_order_number='JO-0001',
            customer=self.customer,
            status='pending',
            delivery_date='2024-01-15T10:00:00Z',
            total_amount=150.00,
            advance_amount=50.00,
            balance_amount=100.00
        )
        
        url = reverse('joborder-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['job_order_number'], 'JO-0001')
    
    def test_update_job_order_status(self):
        """Test updating job order status"""
        job_order = JobOrder.objects.create(
            job_order_number='JO-0001',
            customer=self.customer,
            status='pending',
            delivery_date='2024-01-15T10:00:00Z',
            total_amount=150.00,
            advance_amount=50.00,
            balance_amount=100.00
        )
        
        url = reverse('joborder-update-status', kwargs={'pk': job_order.id})
        data = {'status': 'completed'}
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify status was updated
        job_order.refresh_from_db()
        self.assertEqual(job_order.status, 'completed')
    
    def test_get_job_order_stats(self):
        """Test getting job order statistics"""
        # Create job orders with different statuses
        JobOrder.objects.create(
            job_order_number='JO-0001',
            customer=self.customer,
            status='pending',
            delivery_date='2024-01-15T10:00:00Z',
            total_amount=100.00,
            advance_amount=50.00,
            balance_amount=50.00
        )
        
        JobOrder.objects.create(
            job_order_number='JO-0002',
            customer=self.customer,
            status='completed',
            delivery_date='2024-01-15T10:00:00Z',
            total_amount=200.00,
            advance_amount=100.00,
            balance_amount=100.00
        )
        
        url = reverse('joborder-stats')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        stats = response.data
        self.assertEqual(stats['total_orders'], 2)
        self.assertEqual(stats['pending'], 1)
        self.assertEqual(stats['completed'], 1)
        self.assertEqual(stats['total_revenue'], 300.00)
        self.assertEqual(stats['total_balance'], 150.00)