# Tailor Billing API Documentation

This document describes the complete API structure for the Tailor Billing system.

## Base URL
All API endpoints are prefixed with `/api/`

## Authentication Endpoints

### User Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/auth/me/` - Get current user
- `POST /api/auth/forgot-password/` - Forgot password
- `POST /api/auth/reset-password/` - Reset password

### User Management
- `GET /api/users/` - List all users
- `POST /api/users/` - Create user
- `GET /api/users/{id}/` - Get user details
- `PUT /api/users/{id}/` - Update user
- `DELETE /api/users/{id}/` - Delete user

## Job Orders API

### Job Orders
- `GET /api/job-orders/job-orders/` - List all job orders
- `POST /api/job-orders/job-orders/` - Create job order
- `GET /api/job-orders/job-orders/{id}/` - Get job order details
- `PUT /api/job-orders/job-orders/{id}/` - Update job order
- `DELETE /api/job-orders/job-orders/{id}/` - Delete job order
- `PATCH /api/job-orders/job-orders/{id}/status/` - Update job order status
- `POST /api/job-orders/job-orders/{id}/assign/` - Assign job order to tailor
- `POST /api/job-orders/job-orders/{id}/complete/` - Complete job order

### Measurements
- `GET /api/job-orders/measurements/` - List all measurements
- `POST /api/job-orders/measurements/` - Create measurement
- `GET /api/job-orders/measurements/{id}/` - Get measurement details
- `PUT /api/job-orders/measurements/{id}/` - Update measurement
- `DELETE /api/job-orders/measurements/{id}/` - Delete measurement
- `PATCH /api/job-orders/measurements/{id}/update/` - Update measurement

### Dashboard & Reports
- `GET /api/job-orders/dashboard/stats/` - Get dashboard statistics
- `GET /api/job-orders/reports/job-orders/` - Get job order reports

## Inventory API

### Inventory
- `GET /api/inventory/inventory/` - List all inventory items
- `POST /api/inventory/inventory/` - Create inventory item
- `GET /api/inventory/inventory/{id}/` - Get inventory item details
- `PUT /api/inventory/inventory/{id}/` - Update inventory item
- `DELETE /api/inventory/inventory/{id}/` - Delete inventory item
- `PATCH /api/inventory/inventory/{id}/adjust/` - Adjust inventory quantity
- `GET /api/inventory/inventory/{id}/low-stock/` - Check low stock alert

### Materials
- `GET /api/inventory/materials/` - List all materials
- `POST /api/inventory/materials/` - Create material
- `GET /api/inventory/materials/{id}/` - Get material details
- `PUT /api/inventory/materials/{id}/` - Update material
- `DELETE /api/inventory/materials/{id}/` - Delete material
- `GET /api/inventory/materials/{id}/usage/` - Get material usage

### Categories
- `GET /api/inventory/categories/` - List all categories
- `POST /api/inventory/categories/` - Create category
- `GET /api/inventory/categories/{id}/` - Get category details
- `PUT /api/inventory/categories/{id}/` - Update category
- `DELETE /api/inventory/categories/{id}/` - Delete category

### Reports
- `GET /api/inventory/reports/inventory/` - Get inventory report
- `GET /api/inventory/reports/materials/` - Get material report

## Transactions API

### Transactions
- `GET /api/transactions/transactions/` - List all transactions
- `POST /api/transactions/transactions/` - Create transaction
- `GET /api/transactions/transactions/{id}/` - Get transaction details
- `PUT /api/transactions/transactions/{id}/` - Update transaction
- `DELETE /api/transactions/transactions/{id}/` - Delete transaction
- `PATCH /api/transactions/transactions/{id}/status/` - Update transaction status
- `GET /api/transactions/transactions/{id}/receipt/` - Generate receipt

### Sales
- `GET /api/transactions/sales/` - List all sales
- `POST /api/transactions/sales/` - Create sale
- `GET /api/transactions/sales/{id}/` - Get sale details
- `PUT /api/transactions/sales/{id}/` - Update sale
- `DELETE /api/transactions/sales/{id}/` - Delete sale
- `POST /api/transactions/sales/{id}/complete/` - Complete sale
- `POST /api/transactions/sales/{id}/refund/` - Refund sale

### Purchases
- `GET /api/transactions/purchases/` - List all purchases
- `POST /api/transactions/purchases/` - Create purchase
- `GET /api/transactions/purchases/{id}/` - Get purchase details
- `PUT /api/transactions/purchases/{id}/` - Update purchase
- `DELETE /api/transactions/purchases/{id}/` - Delete purchase
- `POST /api/transactions/purchases/{id}/approve/` - Approve purchase
- `POST /api/transactions/purchases/{id}/receive/` - Receive purchase

### Reports
- `GET /api/transactions/reports/sales/` - Get sales report
- `GET /api/transactions/reports/purchases/` - Get purchase report
- `GET /api/transactions/reports/revenue/` - Get revenue report

## Services API

### Services
- `GET /api/services/services/` - List all services
- `POST /api/services/services/` - Create service
- `GET /api/services/services/{id}/` - Get service details
- `PUT /api/services/services/{id}/` - Update service
- `DELETE /api/services/services/{id}/` - Delete service
- `PATCH /api/services/services/{id}/pricing/` - Update service pricing
- `PATCH /api/services/services/{id}/availability/` - Update service availability

### Customers
- `GET /api/services/customers/` - List all customers
- `POST /api/services/customers/` - Create customer
- `GET /api/services/customers/{id}/` - Get customer details
- `PUT /api/services/customers/{id}/` - Update customer
- `DELETE /api/services/customers/{id}/` - Delete customer
- `GET /api/services/customers/{id}/history/` - Get customer history
- `GET /api/services/customers/{id}/preferences/` - Get customer preferences

### Reports
- `GET /api/services/reports/services/` - Get service report
- `GET /api/services/reports/customers/` - Get customer report

## Request/Response Examples

### Authentication

**Signup:**
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tailor@example.com",
    "name": "John Tailor",
    "phone": "1234567890",
    "role": "tailor",
    "password": "securepass123",
    "confirm_password": "securepass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tailor@example.com",
    "password": "securepass123"
  }'
```

### Job Orders

**Create Job Order:**
```bash
curl -X POST http://localhost:8000/api/job-orders/job-orders/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "service_type": "suit",
    "description": "Blue suit with alterations",
    "due_date": "2024-02-15",
    "estimated_cost": 150.00
  }'
```

**Update Job Order Status:**
```bash
curl -X PATCH http://localhost:8000/api/job-orders/job-orders/1/status/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Inventory

**Create Inventory Item:**
```bash
curl -X POST http://localhost:8000/api/inventory/inventory/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Blue Fabric",
    "category": "fabric",
    "quantity": 10,
    "unit": "meters",
    "cost_per_unit": 25.00
  }'
```

### Transactions

**Create Sale:**
```bash
curl -X POST http://localhost:8000/api/transactions/sales/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "job_order_id": 1,
    "amount": 150.00,
    "payment_method": "cash"
  }'
```

## Error Responses

### Validation Errors (400 Bad Request)
```json
{
  "field_name": ["Error message"],
  "non_field_errors": ["General error message"]
}
```

### Authentication Errors (401 Unauthorized)
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Not Found Errors (404 Not Found)
```json
{
  "detail": "Not found."
}
```

## Role-Based Access

- **admin**: Full access to all endpoints
- **tailor**: Access to job orders, measurements, and assigned tasks
- **cashier**: Access to transactions, sales, and customer data
- **staff**: Limited access to view-only endpoints

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20)

Response format:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Search

Most list endpoints support filtering and search:
- `search`: Text search across relevant fields
- `status`: Filter by status
- `date_from`: Filter by start date
- `date_to`: Filter by end date

Example:
```bash
GET /api/job-orders/job-orders/?search=blue&status=pending&date_from=2024-01-01
``` 