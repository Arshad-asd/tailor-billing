# Authentication API Documentation

This document describes the authentication endpoints for the Tailor Billing system.

## Base URL
All API endpoints are prefixed with `/api/`

## Authentication Endpoints

### 1. User Signup
**Endpoint:** `POST /api/auth/signup/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "role": "staff",
    "password": "securepassword123",
    "confirm_password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "1234567890",
        "role": "staff",
        "is_active": true,
        "date_joined": "2024-01-01T12:00:00Z"
    },
    "tokens": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### 2. User Login
**Endpoint:** `POST /api/auth/login/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "1234567890",
        "role": "staff",
        "is_active": true,
        "date_joined": "2024-01-01T12:00:00Z"
    },
    "tokens": {
        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
}
```

### 3. Token Refresh
**Endpoint:** `POST /api/auth/refresh/`

**Request Body:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 4. User Logout
**Endpoint:** `POST /api/auth/logout/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200 OK):**
```json
{
    "message": "Logout successful"
}
```

## User Management Endpoints

### 5. Get All Users
**Endpoint:** `GET /api/users/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "1234567890",
        "role": "staff",
        "is_active": true,
        "date_joined": "2024-01-01T12:00:00Z"
    }
]
```

### 6. Get User Details
**Endpoint:** `GET /api/users/{id}/`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "role": "staff",
    "is_active": true,
    "date_joined": "2024-01-01T12:00:00Z"
}
```

## Error Responses

### Validation Errors (400 Bad Request)
```json
{
    "email": ["A user with this email already exists."],
    "password": ["This password is too short. It must contain at least 8 characters."],
    "non_field_errors": ["Passwords don't match."]
}
```

### Authentication Errors (401 Unauthorized)
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### Invalid Credentials (400 Bad Request)
```json
{
    "non_field_errors": ["Invalid email or password."]
}
```

## Role Options
- `admin`: Administrator with full access
- `staff`: General staff member
- `tailor`: Tailor with specific permissions
- `cashier`: Cashier with billing permissions

## Testing the API

You can test these endpoints using curl or any API client like Postman:

### Signup Example:
```bash
curl -X POST http://localhost:8000/api/auth/signup/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "1234567890",
    "role": "staff",
    "password": "testpass123",
    "confirm_password": "testpass123"
  }'
```

### Login Example:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'
```

### Protected Endpoint Example:
```bash
curl -X GET http://localhost:8000/api/users/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
``` 