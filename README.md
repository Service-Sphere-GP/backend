# 🌟 Service Sphere - Professional Service Marketplace Platform

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat&logo=socketdotio&logoColor=white)](https://socket.io/)

> **A comprehensive service marketplace backend platform connecting customers with service providers through real-time communication, intelligent booking management, and sentiment-based feedback systems.**

## 🎯 Project Overview

Service Sphere is a sophisticated service marketplace backend built with **NestJS** and **TypeScript**, designed to connect customers with service providers seamlessly. The platform features role-based authentication, real-time chat, booking management, and AI-powered sentiment analysis for feedback.

### 🏆 Key Achievements

- **Clean Architecture**: Modular design with separation of concerns and domain-driven design
- **Real-time Communication**: WebSocket implementation for instant messaging between users
- **Security-First**: JWT authentication with refresh tokens and comprehensive role-based access control
- **Scalable Design**: Microservices-ready architecture with Docker containerization
- **AI Integration**: Sentiment analysis for customer feedback classification

## ✨ Core Features

### 🔐 Authentication & Authorization

- **Multi-role system**: Customers, Service Providers, and Admins with discriminator-based schemas
- **JWT-based authentication** with refresh token rotation and secure token management
- **Email verification** with OTP system (6-digit codes, 15-minute expiration)
- **Password reset** functionality with secure token generation and deep linking support
- **Role-based access control** (RBAC) for all endpoints with guard protection

### 👥 User Management

- **Customer profiles** with loyalty points and activity tracking
- **Service provider verification** system with business validation and tax ID verification
- **Admin panel** for comprehensive user management and platform oversight
- **Profile image management** with Cloudinary integration and automatic optimization
- **User status management** (active, suspended) with proper lifecycle handling

### 🛍️ Service Management

- **Service creation and management** by verified providers with rich metadata
- **Category-based organization** with dynamic categorization system
- **Image upload and management** for service listings with automatic optimization
- **Service search and filtering** capabilities across multiple criteria
- **Provider rating and review** system with sentiment analysis
- **Service attributes** for detailed service customization

### 📅 Booking System

- **Real-time booking management** with comprehensive status tracking
- **Automated notifications** for booking updates through WebSocket and email
- **Provider-customer communication** through secure platform chat
- **Booking history and analytics** with detailed lifecycle management
- **Status workflow**: pending → confirmed → completed/cancelled

### 💬 Real-time Communication

- **WebSocket-based chat system** for booking-specific conversations
- **Real-time message delivery** with Socket.IO and proper authentication
- **Secure chat access** tied to active bookings with user validation
- **Message history and persistence** with MongoDB storage
- **Real-time notifications** for instant user engagement

### 📊 Feedback & Analytics

- **AI-powered sentiment analysis** for automatic feedback classification
- **Rating and review system** with 1-5 star ratings and detailed comments
- **Service provider performance metrics** with aggregated statistics
- **Automated feedback categorization** (positive, negative, neutral)
- **Booking analytics** and provider performance tracking

### 📧 Email & Notification Services

- **Transactional email system** with Nodemailer and SMTP support
- **Custom email templates** with Handlebars template engine
- **Welcome emails, verification, and password reset** with deep linking
- **Real-time push notifications** through WebSocket connections
- **Notification management** with read/unread status tracking

### 🏗️ Technical Architecture

- **Clean Architecture** with dependency injection and modular design
- **MongoDB** with Mongoose ODM for robust data persistence
- **Cloudinary** integration for professional media management
- **Docker containerization** for consistent deployment environments
- **Global exception handling** with standardized JSend response format
- **Input validation** with class-validator and transformation pipes
- **Comprehensive logging** with Morgan middleware and custom loggers
- **Environment-based configuration** with Joi validation schemas

## 🚀 Technology Stack

### Backend Framework

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript development
- **Express** - Web application framework

### Database & Storage

- **MongoDB** - NoSQL database with Mongoose ODM
- **Cloudinary** - Cloud-based image and video management

### Authentication & Security

- **JWT** - JSON Web Tokens for stateless authentication with RS256 algorithm
- **bcrypt** - Password hashing with salt rounds (10)
- **Passport** - Authentication middleware with JWT strategy
- **OTP System** - 6-digit verification codes with 15-minute expiration
- **Role Guards** - Decorator-based role protection (@Roles)

### Real-time Communication

- **Socket.IO** - Real-time bidirectional event-based communication
- **WebSocket Gateway** - NestJS WebSocket implementation with authentication
- **Chat System** - Booking-specific messaging with message persistence
- **Real-time Notifications** - Instant push notifications for user actions

### Email & Notifications

- **Nodemailer** - SMTP email sending capabilities with template support
- **Handlebars** - Email template engine for dynamic content
- **Notification System** - In-app notifications with read/unread status
- **Push Notifications** - Real-time user engagement through WebSocket

### Development & Deployment

- **Docker** - Multi-stage containerization with optimized production builds
- **Jest** - Comprehensive testing framework with coverage reports
- **ESLint & Prettier** - Code quality and consistent formatting
- **Yarn** - Fast and reliable package management
- **Morgan** - HTTP request logging middleware

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **Yarn** package manager
- **MongoDB** 4.4+
- **Docker** & Docker Compose (optional)

### Environment Setup

1. **Clone the repository**

```bash
git clone https://github.com/Service-Sphere-GP/backend.git
cd backend
```

2. **Install dependencies**

```bash
yarn install
```

3. **Configure environment variables**

```bash
# Create environment file
cp .env.example .env.development.local

# Required environment variables:
MONGODB_URI=mongodb://localhost:27017/service-sphere-dev
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d

# Email configuration (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM_NAME="Service Sphere"
MAIL_FROM_ADDRESS=noreply@servicesphere.com

# Cloudinary configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional configurations
PORT=3000
CORS_ORIGIN=*
ADMIN_API_KEY=your-secure-admin-api-key
```

4. **Start the application**

**Development mode:**

```bash
yarn start:dev
```

**Production mode:**

```bash
yarn build
yarn start:prod
```

**With Docker:**

```bash
docker-compose up --build
```

5. **Verify installation**

```bash
# Check if server is running
curl http://localhost:3000/api/v1

# Create first admin user
curl -X POST http://localhost:3000/api/v1/auth/register/first-admin \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Admin",
    "last_name": "User",
    "email": "admin@example.com",
    "password": "AdminPassword123!",
    "confirm_password": "AdminPassword123!"
  }'
```

# Run tests

```bash
yarn run test
yarn run test:cov
```

### 🌐 API Access

- **Base URL**: `http://localhost:3000/api/v1`

## 📁 Project Structure

```
src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── auth/                   # Authentication & authorization
│   ├── auth.controller.ts  # Auth endpoints (register, login, etc.)
│   ├── auth.service.ts     # Authentication business logic
│   ├── guards/             # JWT and role-based guards
│   ├── strategies/         # Passport JWT strategy
│   ├── dto/                # Data transfer objects
│   └── schemas/            # Token schemas (refresh, reset)
├── users/                  # User management
│   ├── users.controller.ts # User CRUD operations
│   ├── users.service.ts    # User business logic
│   ├── schemas/            # User schemas with discriminators
│   │   ├── user.schema.ts      # Base user schema
│   │   ├── customer.schema.ts  # Customer-specific fields
│   │   ├── service-provider.schema.ts # Provider fields
│   │   └── admin.schema.ts     # Admin permissions
│   └── dto/                # User DTOs for validation
├── services/               # Service marketplace
│   ├── services.controller.ts # Service CRUD operations
│   ├── services.service.ts    # Service business logic
│   ├── schemas/            # Service data models
│   └── interfaces/         # Service type definitions
├── service-bookings/       # Booking management
│   ├── service-bookings.controller.ts # Booking endpoints
│   ├── service-bookings.service.ts   # Booking logic
│   └── schemas/            # Booking data models
├── chat/                   # Real-time communication
│   ├── chat.gateway.ts     # WebSocket gateway
│   ├── chat.service.ts     # Chat business logic
│   ├── guards/             # WebSocket JWT authentication
│   └── schemas/            # Message schemas
├── feedback/               # Review & rating system
│   ├── feedback.controller.ts     # Feedback endpoints
│   ├── feedback.service.ts       # Review logic
│   ├── sentiment-analysis.service.ts # AI sentiment analysis
│   └── schemas/            # Feedback data models
├── notifications/          # Notification system
│   ├── notifications.controller.ts # Notification endpoints
│   ├── notifications.service.ts   # Notification logic
│   └── schemas/            # Notification schemas
├── categories/             # Service categorization
│   ├── categories.controller.ts # Category management
│   ├── categories.service.ts    # Category logic
│   └── schemas/            # Category schemas
├── mail/                   # Email services
│   ├── mail.service.ts     # Email sending logic
│   ├── mail.module.ts      # Email configuration
│   └── templates/          # Handlebars email templates
├── advice/                 # Advisory system
│   ├── advice.controller.ts # Advice endpoints
│   ├── advice.service.ts    # Advisory logic
│   └── schemas/            # Advice schemas
├── config/                 # Configuration management
│   ├── app.config.ts       # Application settings
│   ├── database.config.ts  # MongoDB configuration
│   ├── mail.config.ts      # SMTP settings
│   └── validation.schema.ts # Joi validation schemas
└── common/                 # Shared utilities
    ├── decorators/         # Custom decorators (@Roles, @CurrentUser)
    ├── filters/            # Exception filters (JSend format)
    ├── guards/             # Custom guards
    ├── interceptors/       # Response interceptors
    └── middleware/         # Custom middleware
```

## 🚢 Deployment

### Docker Production Setup

```bash
# Production build
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up --scale app=3
```

### Environment Variables

```env
# Database
DATABASE_URI=mongodb://localhost:27017/service-sphere

# JWT Configuration
JWT_SECRET=your-super-secret-key
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d

# Email Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application
APP_PORT=3000
NODE_ENV=production
```

## 📈 Performance Features

- **Connection pooling** for database optimization
- **Image optimization** with Cloudinary transformations
- **Caching strategies** for frequently accessed data
- **Rate limiting** for API protection
- **Request logging** for monitoring and debugging

## 🔒 Security Implementation

- **Input validation** and sanitization
- **SQL injection** prevention with parameterized queries
- **XSS protection** with helmet middleware
- **CORS configuration** for cross-origin requests
- **Rate limiting** to prevent abuse
- **Secure headers** implementation

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/v1/auth/register/customer
POST /api/v1/auth/register/service-provider
POST /api/v1/auth/register/first-admin
POST /api/v1/auth/register/admin
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/verify-email/:userId
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
PATCH /api/v1/auth/reset-password/:token
GET /api/v1/auth/verification-status/:email
```

### User Management

```
GET /api/v1/users/customers
GET /api/v1/users/customers/:id
PATCH /api/v1/users/customers/:id
DELETE /api/v1/users/customers/:id
GET /api/v1/users/service-providers
GET /api/v1/users/service-providers/:id
PATCH /api/v1/users/service-providers/:id
DELETE /api/v1/users/service-providers/:id
GET /api/v1/users/admins
POST /api/v1/users/admins
GET /api/v1/users/:id
```

### Service Management

```
GET /api/v1/services
POST /api/v1/services
GET /api/v1/services/:id
PATCH /api/v1/services/:id
DELETE /api/v1/services/:id
GET /api/v1/services/my-services
GET /api/v1/services/provider/:providerId
GET /api/v1/services/categories
```

### Booking System

```
POST /api/v1/bookings/:serviceId
GET /api/v1/bookings
GET /api/v1/bookings/provider
PATCH /api/v1/bookings/:id/status
GET /api/v1/bookings/:id
```

### Real-time Chat (WebSocket)

```
WebSocket Events:
- joinRoom
- sendMessage
- subscribeToNotifications
- newMessage (incoming)
- messageDelivered (status)
```

### Feedback System

```
GET /api/v1/feedback/service/:serviceId
GET /api/v1/feedback/provider/:providerId
POST /api/v1/feedback
DELETE /api/v1/feedback/:id
```

### Notifications

```
GET /api/v1/notifications
GET /api/v1/notifications/unread
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all
DELETE /api/v1/notifications/:id
```

### Categories

```
GET /api/v1/categories
POST /api/v1/categories (Admin only)
PATCH /api/v1/categories/:id (Admin only)
DELETE /api/v1/categories/:id (Admin only)
```

## 👨‍💻 Development Highlights

### Design Patterns Implemented

- **Repository Pattern** for data access abstraction
- **Dependency Injection** for loose coupling
- **Observer Pattern** for event-driven notifications
- **Strategy Pattern** for multiple authentication methods
- **Factory Pattern** for service creation

### Best Practices Applied

- **SOLID Principles** in class design
- **Clean Code** principles throughout
- **Error handling** with custom exception filters
- **Logging** for debugging and monitoring
- **Code documentation** and type safety

## 🤝 Contributing

This project demonstrates enterprise-level backend development practices and is suitable for:

- **Portfolio demonstration**
- **Technical interviews**
- **Learning NestJS and TypeScript**
- **Understanding microservices architecture**

## 📄 License

This project is developed as part of a graduation project and is available for educational and portfolio purposes.

---

## 🎓 Academic Project Information

**Project Type**: Graduation Project  
**Framework**: NestJS with TypeScript  
**Database**: MongoDB  
**Architecture**: Microservices-ready monolith

### Skills Demonstrated

- Advanced TypeScript and NestJS development
- RESTful API design and implementation
- Real-time communication with WebSockets
- Database design and optimization
- Authentication and authorization systems
- Cloud services integration
- Docker containerization

---

**⭐ Star this repository if you find it helpful for your learning journey!**

## Running the Application in Development Mode (Without Docker)

If you prefer to run the application without Docker for development purposes, follow these steps:

### Install Dependencies

Ensure you have **Yarn** installed, then install the project dependencies:

```bash
yarn install
```

### Run MongoDB Locally

Start a local instance of MongoDB or adjust the `MONGODB_URI` in `.env.development.local` to point to an accessible MongoDB instance.

### Start the Application

Run the application in watch mode:

```bash
yarn start:dev
```

The application will start on `http://localhost:3000`.
