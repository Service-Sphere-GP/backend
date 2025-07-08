# 🌟 Service Sphere - Professional Service Marketplace Platform

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

> **A comprehensive full-stack service marketplace platform connecting customers with service providers through real-time communication, booking management, and intelligent feedback systems.**

## 🎯 Project Overview

Service Sphere is a sophisticated service marketplace backend built with **NestJS** and **TypeScript**, designed to connect customers with service providers seamlessly. The platform features role-based authentication, real-time chat, booking management, and AI-powered sentiment analysis for feedback.

### 🏆 Key Achievements
- **Clean Architecture**: Modular design with separation of concerns
- **Real-time Communication**: WebSocket implementation for instant messaging
- **Security-First**: JWT authentication with refresh tokens and role-based access control
- **Scalable Design**: Microservices-ready architecture with Docker containerization
- **Test Coverage**: Comprehensive testing with Jest (coverage reports available)

## ✨ Core Features

### 🔐 Authentication & Authorization
- **Multi-role system**: Customers, Service Providers, and Admins
- **JWT-based authentication** with refresh token rotation
- **Email verification** with OTP system
- **Password reset** functionality with secure token generation
- **Role-based access control** (RBAC) for endpoints

### 👥 User Management
- **Customer profiles** with image upload capabilities
- **Service provider verification** system with business validation
- **Admin panel** for user management and platform oversight
- **Profile image management** with Cloudinary integration

### 🛍️ Service Management
- **Service creation and management** by providers
- **Category-based organization** with dynamic categorization
- **Image upload and management** for service listings
- **Service search and filtering** capabilities
- **Provider rating and review** system

### 📅 Booking System
- **Real-time booking management** with status tracking
- **Automated notifications** for booking updates
- **Provider-customer communication** through platform
- **Booking history and analytics**

### 💬 Real-time Communication
- **WebSocket-based chat system** for booking-specific conversations
- **Real-time message delivery** with Socket.IO
- **Secure chat access** tied to active bookings
- **Message history and persistence**

### 📊 Feedback & Analytics
- **AI-powered sentiment analysis** for customer feedback
- **Rating and review system** with detailed feedback
- **Service provider performance metrics**
- **Automated feedback categorization**

### 📧 Email Services
- **Transactional email system** with Nodemailer
- **Custom email templates** with Handlebars
- **Welcome emails, verification, and password reset**
- **Booking confirmation and status updates**

### 🏗️ Technical Architecture
- **Clean Architecture** with dependency injection
- **MongoDB** with Mongoose ODM for data persistence
- **Cloudinary** integration for media management
- **Docker containerization** for deployment
- **Global exception handling** with standardized responses
- **Input validation** with class-validator
- **Logging and monitoring** with Morgan

## 🚀 Technology Stack

### Backend Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript development
- **Express** - Web application framework

### Database & Storage
- **MongoDB** - NoSQL database with Mongoose ODM
- **Cloudinary** - Cloud-based image and video management

### Authentication & Security
- **JWT** - JSON Web Tokens for stateless authentication
- **bcrypt** - Password hashing
- **Passport** - Authentication middleware

### Real-time Communication
- **Socket.IO** - Real-time bidirectional event-based communication
- **WebSocket Gateway** - NestJS WebSocket implementation

### Email & Notifications
- **Nodemailer** - Email sending capabilities
- **Handlebars** - Email template engine

### Development & Deployment
- **Docker** - Containerization platform
- **Jest** - Testing framework
- **ESLint & Prettier** - Code quality and formatting

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16+ recommended)
- Docker & Docker Compose
- MongoDB (or use Docker setup)

### Installation & Setup

1. **Clone the Repository**
```bash
git clone git@github.com:Service-Sphere-GP/backend.git
cd backend
```

2. **Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.development.local
# Configure your environment variables
```

3. **Docker Deployment (Recommended)**
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d
```

4. **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test
npm run test:cov
```

### 🌐 API Access
- **Base URL**: `http://localhost:3000/api/v1`
- **Documentation**: Available through Swagger/OpenAPI (if configured)

## 📁 Project Structure

```
src/
├── auth/              # Authentication & authorization
├── users/             # User management (customers, providers, admins)
├── services/          # Service listings and management
├── service-bookings/  # Booking system and workflow
├── chat/              # Real-time messaging system
├── feedback/          # Review and rating system
├── notifications/     # Push notification system
├── mail/              # Email service and templates
├── categories/        # Service categorization
├── advice/            # Advisory system
├── config/            # Application configuration
├── common/            # Shared utilities and decorators
└── main.ts           # Application entry point
```

## 🧪 Testing & Quality

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
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
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
PATCH /api/v1/auth/reset-password/:token
```

### Service Management
```
GET /api/v1/services
POST /api/v1/services
GET /api/v1/services/:id
PATCH /api/v1/services/:id
DELETE /api/v1/services/:id
GET /api/v1/services/provider/:providerId
```

### Booking System
```
POST /api/v1/bookings/:serviceId
GET /api/v1/bookings
GET /api/v1/bookings/provider
PATCH /api/v1/bookings/:id/status
GET /api/v1/bookings/:id
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
**Development Period**: [Your timeline]  
**Team Size**: [Team size if applicable]

### Skills Demonstrated
- Advanced TypeScript and NestJS development
- RESTful API design and implementation
- Real-time communication with WebSockets
- Database design and optimization
- Authentication and authorization systems
- Cloud services integration
- Docker containerization
- Test-driven development

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
