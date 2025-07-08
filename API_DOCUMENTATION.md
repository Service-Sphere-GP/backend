# 📚 Service Sphere - API Documentation

## 📋 Table of Contents
- [API Overview](#api-overview)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management](#user-management)
- [Service Management](#service-management)
- [Booking System](#booking-system)
- [Real-time Chat](#real-time-chat)
- [Feedback System](#feedback-system)
- [Category Management](#category-management)
- [Administrative APIs](#administrative-apis)
- [Error Handling](#error-handling)

## 🌐 API Overview

### Base Configuration
- **Base URL**: `http://localhost:3000/api/v1`
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token (JWT)
- **API Version**: v1

### Response Format (JSend Standard)
```json
{
  "status": "success|fail|error",
  "data": { /* response data */ },
  "message": "Optional message"
}
```

### Common Headers
```http
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
Accept: application/json
```

## 🔐 Authentication Endpoints

### Customer Registration
```http
POST /api/v1/auth/register/customer
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone_number": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id_here",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "role": "customer",
      "email_verified": false,
      "profile_image": "default_image_url"
    },
    "emailSent": true
  },
  "message": "Customer registered successfully. Please verify your email."
}
```

### Service Provider Registration
```http
POST /api/v1/auth/register/service-provider
```

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@business.com",
  "password": "SecurePassword123!",
  "phone_number": "+1234567890",
  "business_name": "Jane's Professional Services",
  "business_address": "123 Business Street, City, State 12345",
  "tax_id": "TAX123456789"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "provider_id_here",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@business.com",
      "role": "service_provider",
      "business_name": "Jane's Professional Services",
      "verification_status": "pending",
      "rating_average": 0
    },
    "emailSent": true
  }
}
```

### User Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "UserPassword123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "role": "customer",
      "email_verified": true
    },
    "tokens": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refresh_token": "refresh_token_here",
      "expires_in": 900
    }
  }
}
```

### Email Verification
```http
POST /api/v1/auth/verify-email
```

**Request Body:**
```json
{
  "userId": "user_id_here",
  "otp": "123456"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

### Password Reset Request
```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### Password Reset Confirmation
```http
PATCH /api/v1/auth/reset-password/:token
```

**Request Body:**
```json
{
  "newPassword": "NewSecurePassword123!"
}
```

### Logout
```http
POST /api/v1/auth/logout
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

## 👥 User Management

### Get All Customers (Admin Only)
```http
GET /api/v1/users/customers
Authorization: Bearer <admin_token>
```

### Get Customer by ID
```http
GET /api/v1/users/customers/:id
Authorization: Bearer <token>
```

### Update Customer Profile
```http
PATCH /api/v1/users/customers/:id
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Form Data:**
```
first_name: Updated Name
phone_number: +1987654321
profile_image: <file>
```

### Get All Service Providers
```http
GET /api/v1/users/service-providers
Authorization: Bearer <token>
```

### Get Service Provider by ID
```http
GET /api/v1/users/service-providers/:id
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "_id": "provider_id",
    "first_name": "Jane",
    "last_name": "Smith",
    "business_name": "Jane's Services",
    "verification_status": "approved",
    "rating_average": 4.8,
    "profile_image": "profile_image_url"
  }
}
```

## 🛍️ Service Management

### Get All Services
```http
GET /api/v1/services
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "service_id",
      "service_name": "Premium House Cleaning",
      "description": "Professional deep cleaning service",
      "base_price": 150.00,
      "status": "active",
      "service_provider": {
        "_id": "provider_id",
        "business_name": "Clean Pro Services",
        "rating_average": 4.9
      },
      "categories": [
        {
          "_id": "category_id",
          "name": "Cleaning"
        }
      ],
      "images": ["image1_url", "image2_url"],
      "service_attributes": {
        "duration": "3-4 hours",
        "equipment_included": true
      }
    }
  ]
}
```

### Get Service by ID
```http
GET /api/v1/services/:id
Authorization: Bearer <token>
```

### Create New Service (Service Provider Only)
```http
POST /api/v1/services
Content-Type: multipart/form-data
Authorization: Bearer <provider_token>
```

**Form Data:**
```
service_name: Premium House Cleaning
description: Professional deep cleaning service with eco-friendly products
base_price: 150.00
categories: ["cleaning_category_id", "home_services_category_id"]
service_attributes: {"duration": "3-4 hours", "equipment_included": true}
images: <file1>, <file2>
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "_id": "new_service_id",
    "service_name": "Premium House Cleaning",
    "description": "Professional deep cleaning service",
    "base_price": 150.00,
    "status": "active",
    "service_provider": "provider_id",
    "categories": ["category_id_1", "category_id_2"],
    "images": ["uploaded_image_url_1", "uploaded_image_url_2"],
    "creation_time": "2024-07-08T10:00:00.000Z"
  }
}
```

### Update Service
```http
PATCH /api/v1/services/:id
Content-Type: multipart/form-data
Authorization: Bearer <provider_token>
```

### Delete Service
```http
DELETE /api/v1/services/:id
Authorization: Bearer <provider_token>
```

### Get My Services (Provider Only)
```http
GET /api/v1/services/my-services
Authorization: Bearer <provider_token>
```

### Get Services by Provider ID
```http
GET /api/v1/services/provider/:providerId
Authorization: Bearer <token>
```

## 📅 Booking System

### Create Booking
```http
POST /api/v1/bookings/:serviceId
Authorization: Bearer <customer_token>
```

**Request Body:**
```json
{
  "preferred_date": "2024-07-15T10:00:00Z",
  "special_instructions": "Please use eco-friendly cleaning supplies"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "_id": "booking_id",
    "customer": "customer_id",
    "service": {
      "_id": "service_id",
      "service_name": "Premium House Cleaning",
      "service_provider": {
        "_id": "provider_id",
        "business_name": "Clean Pro Services"
      }
    },
    "status": "pending",
    "booking_date": "2024-07-15T10:00:00Z",
    "total_amount": 150.00,
    "created_at": "2024-07-08T12:00:00Z"
  }
}
```

### Get Customer Bookings
```http
GET /api/v1/bookings
Authorization: Bearer <customer_token>
```

### Get Provider Bookings
```http
GET /api/v1/bookings/provider
Authorization: Bearer <provider_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "booking_id",
      "customer": {
        "_id": "customer_id",
        "full_name": "John Doe",
        "email": "john@example.com",
        "profile_image": "customer_image_url"
      },
      "service": {
        "_id": "service_id",
        "service_name": "Premium House Cleaning"
      },
      "status": "confirmed",
      "booking_date": "2024-07-15T10:00:00Z",
      "total_amount": 150.00
    }
  ]
}
```

### Update Booking Status
```http
PATCH /api/v1/bookings/:id/status
Authorization: Bearer <provider_token>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Status Options:**
- `pending` - Initial booking state
- `confirmed` - Provider accepted booking
- `completed` - Service was delivered
- `cancelled` - Booking was cancelled

### Get Booking by ID
```http
GET /api/v1/bookings/:id
Authorization: Bearer <token>
```

## 💬 Real-time Chat

### WebSocket Connection
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Join booking-specific chat room
socket.emit('joinBookingRoom', {
  userId: 'user_id',
  bookingId: 'booking_id'
});

// Listen for new messages
socket.on('newMessage', (message) => {
  console.log('New message received:', message);
});

// Send message
socket.emit('sendMessage', {
  bookingId: 'booking_id',
  content: 'Hello, when can you start the service?'
});
```

### Get Chat History
```http
GET /api/v1/chat/history/:bookingId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "_id": "booking_id",
      "service": {
        "service_name": "House Cleaning"
      }
    },
    "messages": [
      {
        "_id": "message_id",
        "sender": {
          "_id": "user_id",
          "first_name": "John",
          "profile_image": "image_url"
        },
        "content": "Hello, when can you start?",
        "timestamp": "2024-07-08T12:30:00Z"
      }
    ]
  }
}
```

## ⭐ Feedback System

### Submit Feedback
```http
POST /api/v1/feedback
Authorization: Bearer <customer_token>
```

**Request Body:**
```json
{
  "service": "service_id",
  "booking": "booking_id",
  "rating": 5,
  "review_text": "Excellent service! Very professional and thorough cleaning."
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "_id": "feedback_id",
    "user": "customer_id",
    "service": "service_id",
    "booking": "booking_id",
    "rating": 5,
    "review_text": "Excellent service! Very professional and thorough cleaning.",
    "sentiment_score": 0.9,
    "sentiment_magnitude": 0.8,
    "created_at": "2024-07-08T15:00:00Z"
  }
}
```

### Get Service Feedback
```http
GET /api/v1/feedback/service/:serviceId
Authorization: Bearer <token>
```

### Get Provider Feedback
```http
GET /api/v1/feedback/provider/:providerId
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "feedback_id",
      "user": {
        "_id": "customer_id",
        "first_name": "John",
        "last_name": "Doe",
        "profile_image": "customer_image"
      },
      "service": {
        "_id": "service_id",
        "service_name": "Premium House Cleaning"
      },
      "rating": 5,
      "review_text": "Outstanding service quality!",
      "created_at": "2024-07-08T15:00:00Z"
    }
  ]
}
```

### Delete Feedback
```http
DELETE /api/v1/feedback/:id
Authorization: Bearer <token>
```

## 🏷️ Category Management

### Get All Categories
```http
GET /api/v1/categories
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "category_id_1",
      "name": "Cleaning Services"
    },
    {
      "_id": "category_id_2",
      "name": "Home Maintenance"
    },
    {
      "_id": "category_id_3",
      "name": "Garden & Landscaping"
    }
  ]
}
```

### Create Category (Admin Only)
```http
POST /api/v1/categories
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Pet Services"
}
```

### Update Category (Admin Only)
```http
PATCH /api/v1/categories/:id
Authorization: Bearer <admin_token>
```

### Delete Category (Admin Only)
```http
DELETE /api/v1/categories/:id
Authorization: Bearer <admin_token>
```

## 🔧 Administrative APIs

### Get Platform Statistics (Admin Only)
```http
GET /api/v1/admin/statistics
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "users": {
      "total_customers": 1250,
      "total_providers": 180,
      "verified_providers": 165,
      "new_registrations_this_month": 45
    },
    "bookings": {
      "total_bookings": 3420,
      "completed_bookings": 3100,
      "pending_bookings": 85,
      "bookings_this_month": 340
    },
    "services": {
      "total_services": 450,
      "active_services": 420,
      "most_popular_category": "Cleaning Services"
    },
    "revenue": {
      "total_platform_revenue": 125000.00,
      "revenue_this_month": 12500.00,
      "average_booking_value": 165.50
    }
  }
}
```

### Approve Service Provider (Admin Only)
```http
PATCH /api/v1/admin/providers/:id/verify
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "verification_status": "approved",
  "admin_notes": "All documents verified and approved"
}
```

## ❌ Error Handling

### Error Response Format
```json
{
  "status": "error",
  "message": "Detailed error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details",
    "timestamp": "2024-07-08T12:00:00Z"
  }
}
```

### Common HTTP Status Codes

#### Authentication Errors
- **401 Unauthorized**: Invalid or missing token
- **403 Forbidden**: Insufficient permissions
- **422 Unprocessable Entity**: Email not verified

#### Client Errors
- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resource (email exists)

#### Server Errors
- **500 Internal Server Error**: Unexpected server error
- **503 Service Unavailable**: External service unavailable

### Example Error Responses

#### Validation Error (400)
```json
{
  "status": "fail",
  "data": {
    "validation_errors": [
      {
        "field": "email",
        "message": "Email must be a valid email address"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters long"
      }
    ]
  }
}
```

#### Authentication Error (401)
```json
{
  "status": "error",
  "message": "Invalid or expired token",
  "error": {
    "code": "INVALID_TOKEN",
    "details": "Please login again to get a new token"
  }
}
```

#### Permission Error (403)
```json
{
  "status": "error",
  "message": "Insufficient permissions to access this resource",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "required_role": "service_provider",
    "user_role": "customer"
  }
}
```

#### Resource Not Found (404)
```json
{
  "status": "fail",
  "data": {
    "resource": "service",
    "id": "invalid_service_id",
    "message": "Service with ID 'invalid_service_id' not found"
  }
}
```

## 📊 Rate Limiting

### API Rate Limits
- **Authentication endpoints**: 5 requests per minute per IP
- **General API endpoints**: 100 requests per minute per user
- **File upload endpoints**: 10 requests per minute per user
- **WebSocket connections**: 1 connection per user per booking

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
```

---

This API documentation demonstrates:

- **RESTful Design**: Clean and intuitive API endpoints
- **Comprehensive Coverage**: All major platform features
- **Security Implementation**: Authentication and authorization
- **Real-world Complexity**: Production-ready API design
- **Error Handling**: Professional error management
- **Documentation Quality**: Enterprise-level documentation standards
