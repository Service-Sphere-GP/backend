# 🏗️ Service Sphere - System Architecture

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Architecture Patterns](#architecture-patterns)
- [Module Structure](#module-structure)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Real-time Communication](#real-time-communication)
- [Database Design](#database-design)
- [Deployment Architecture](#deployment-architecture)

## 🌐 System Overview

Service Sphere follows a **modular monolith architecture** with clear separation of concerns, designed to be easily scalable into microservices when needed. The system is built using **Domain-Driven Design (DDD)** principles with clean architecture patterns.

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Mobile App] --> B[API Gateway]
        C[Web App] --> B
        D[Admin Panel] --> B
    end
    
    subgraph "Application Layer"
        B --> E[Authentication Service]
        B --> F[User Management]
        B --> G[Service Management]
        B --> H[Booking System]
        B --> I[Chat Service]
        B --> J[Notification Service]
    end
    
    subgraph "Infrastructure Layer"
        E --> K[(MongoDB)]
        F --> K
        G --> K
        H --> K
        I --> K
        J --> L[Email Service]
        G --> M[Cloudinary]
        I --> N[WebSocket Gateway]
    end
```

## 🔧 Architecture Patterns

### 1. Modular Monolith
- **Bounded Contexts**: Each module represents a distinct business domain
- **Loose Coupling**: Modules interact through well-defined interfaces
- **Independent Development**: Teams can work on different modules simultaneously
- **Migration Ready**: Easy transition to microservices architecture

### 2. Dependency Injection Pattern
```typescript
@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(ServiceBookings.name) private bookingModel: Model<ServiceBookings>,
    private readonly servicesService: ServicesService,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
  ) {}
}
```

### 3. Repository Pattern
- Abstract data access layer
- Centralized query logic
- Easy testing with mock repositories
- Database-agnostic business logic

### 4. Observer Pattern (Event-Driven)
```typescript
// Booking status changes trigger notifications
async updateBookingStatus(bookingId: string, status: string) {
  const updatedBooking = await booking.save();
  
  // Emit event for notification service
  await this.notificationService.sendBookingStatusUpdate(/* ... */);
}
```

## 🏢 Module Structure

### Core Modules

#### 1. Authentication Module (`auth/`)
```
auth/
├── auth.controller.ts      # Auth endpoints
├── auth.service.ts         # Authentication logic
├── auth.module.ts          # Module configuration
├── strategies/             # Passport strategies
├── guards/                 # Route guards
├── decorators/             # Custom decorators
├── dto/                    # Data transfer objects
└── interfaces/             # Type definitions
```

**Responsibilities:**
- User registration and login
- JWT token management
- Email verification
- Password reset functionality
- Role-based access control

#### 2. User Management Module (`users/`)
```
users/
├── users.controller.ts     # User CRUD operations
├── users.service.ts        # User business logic
├── user.module.ts          # Module configuration
├── dto/                    # User DTOs
├── interfaces/             # User interfaces
└── schemas/                # Database schemas
    ├── user.schema.ts
    └── service-provider.schema.ts
```

**Responsibilities:**
- User profile management
- Service provider verification
- Admin user management
- Profile image handling

#### 3. Service Management Module (`services/`)
```
services/
├── services.controller.ts  # Service endpoints
├── services.service.ts     # Service business logic
├── services.module.ts      # Module configuration
├── dto/                    # Service DTOs
├── interfaces/             # Service interfaces
└── schemas/                # Service database schema
```

**Responsibilities:**
- Service listing creation
- Service categorization
- Image upload and management
- Service search and filtering

#### 4. Booking System Module (`service-bookings/`)
```
service-bookings/
├── service-bookings.controller.ts
├── service-bookings.service.ts
├── service-bookings.module.ts
├── dto/
└── schemas/
```

**Responsibilities:**
- Booking creation and management
- Status tracking
- Provider-customer booking coordination
- Booking analytics

#### 5. Real-time Chat Module (`chat/`)
```
chat/
├── chat.gateway.ts         # WebSocket gateway
├── chat.service.ts         # Chat business logic
├── chat.module.ts          # Module configuration
├── dto/                    # Chat DTOs
├── guards/                 # WebSocket guards
└── schemas/                # Chat message schema
```

**Responsibilities:**
- Real-time messaging
- Message persistence
- Chat access control
- Online status management

#### 6. Feedback System Module (`feedback/`)
```
feedback/
├── feedback.controller.ts
├── feedback.service.ts
├── sentiment-analysis.service.ts
├── feedback.module.ts
├── dto/
└── schemas/
```

**Responsibilities:**
- Review and rating management
- Sentiment analysis
- Feedback categorization
- Provider rating calculation

## 🔄 Data Flow

### 1. Authentication Flow
```mermaid
sequenceDiagram
    participant Client
    participant AuthController
    participant AuthService
    participant UserService
    participant Database
    participant EmailService

    Client->>AuthController: POST /auth/register
    AuthController->>AuthService: registerUser(userData)
    AuthService->>UserService: createUser(userData)
    UserService->>Database: save(user)
    AuthService->>EmailService: sendVerificationEmail(user)
    AuthService->>Client: { user, message }
```

### 2. Service Booking Flow
```mermaid
sequenceDiagram
    participant Customer
    participant BookingController
    participant BookingService
    participant ServiceService
    participant NotificationService
    participant Provider

    Customer->>BookingController: POST /bookings/:serviceId
    BookingController->>BookingService: createBooking(serviceId, customerId)
    BookingService->>ServiceService: getServiceById(serviceId)
    BookingService->>Database: save(booking)
    BookingService->>NotificationService: notifyProvider(booking)
    NotificationService->>Provider: New booking notification
```

### 3. Real-time Chat Flow
```mermaid
sequenceDiagram
    participant User
    participant ChatGateway
    participant ChatService
    participant Database
    participant RecipientUser

    User->>ChatGateway: sendMessage(bookingId, message)
    ChatGateway->>ChatService: validateAccess(userId, bookingId)
    ChatService->>ChatService: createMessage(senderId, bookingId, content)
    ChatService->>Database: save(message)
    ChatService->>ChatGateway: message saved
    ChatGateway->>RecipientUser: emit('newMessage', message)
```

## 🔐 Security Architecture

### Authentication & Authorization Layers

```mermaid
graph TD
    A[Request] --> B[CORS Middleware]
    B --> C[Rate Limiting]
    C --> D[JWT Validation]
    D --> E[Role-based Access Control]
    E --> F[Route Handler]
    F --> G[Input Validation]
    G --> H[Business Logic]
```

### Security Features Implemented

1. **JWT Authentication**
   - Access tokens (15 minutes)
   - Refresh tokens (7 days)
   - Token rotation on refresh

2. **Role-Based Access Control (RBAC)**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   @Roles('admin', 'service_provider')
   async createService() { /* ... */ }
   ```

3. **Input Validation**
   ```typescript
   @IsEmail()
   @IsNotEmpty()
   email: string;
   
   @MinLength(8)
   @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
   password: string;
   ```

4. **Data Sanitization**
   - XSS prevention
   - SQL injection protection
   - File upload validation

## 🔄 Real-time Communication

### WebSocket Architecture

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @SubscribeMessage('joinBookingRoom')
  async handleJoinRoom(client: Socket, payload: JoinRoomDto) {
    // Validate user access to booking
    const { booking } = await this.chatService.validateUserAccess(
      payload.userId,
      payload.bookingId,
    );
    
    // Join room for real-time updates
    client.join(`booking-${payload.bookingId}`);
  }
}
```

### Real-time Features
- **Chat messaging** between customers and providers
- **Booking status updates** in real-time
- **Online status** indicators
- **Typing indicators** for enhanced UX

## 💾 Database Design

### MongoDB Schema Design

#### User Collection
```typescript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  first_name: String,
  last_name: String,
  role: Enum['customer', 'service_provider', 'admin'],
  profile_image: String,
  email_verified: Boolean,
  created_at: Date,
  
  // Service Provider specific fields
  business_name?: String,
  business_address?: String,
  tax_id?: String,
  verification_status?: Enum['pending', 'approved', 'rejected'],
  rating_average?: Number
}
```

#### Service Collection
```typescript
{
  _id: ObjectId,
  service_name: String,
  description: String,
  base_price: Number,
  status: Enum['active', 'inactive'],
  service_provider: ObjectId (ref: User),
  categories: [ObjectId] (ref: Category),
  images: [String],
  service_attributes: Object,
  creation_time: Date
}
```

#### Booking Collection
```typescript
{
  _id: ObjectId,
  customer: ObjectId (ref: User),
  service: ObjectId (ref: Service),
  status: Enum['pending', 'confirmed', 'completed', 'cancelled'],
  booking_date: Date,
  total_amount: Number,
  created_at: Date,
  updated_at: Date
}
```

### Indexing Strategy
```javascript
// User indices
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Service indices
db.services.createIndex({ service_provider: 1 })
db.services.createIndex({ categories: 1 })
db.services.createIndex({ status: 1 })

// Booking indices
db.bookings.createIndex({ customer: 1 })
db.bookings.createIndex({ service: 1 })
db.bookings.createIndex({ status: 1 })
```

## 🚀 Deployment Architecture

### Container Architecture
```dockerfile
# Multi-stage build for production optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### Docker Compose Setup
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - redis
    
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
```

### Production Considerations

1. **Horizontal Scaling**
   - Load balancer configuration
   - Session management with Redis
   - Database connection pooling

2. **Monitoring & Logging**
   - Application performance monitoring
   - Error tracking and alerting
   - Request/response logging

3. **Security Hardening**
   - Environment variable management
   - SSL/TLS configuration
   - Network security groups

4. **Backup & Recovery**
   - Automated database backups
   - Disaster recovery procedures
   - Data retention policies

## 📊 Performance Optimization

### Caching Strategy
- **Redis** for session storage and temporary data
- **MongoDB** query optimization with proper indexing
- **Cloudinary** for image optimization and CDN delivery

### Database Optimization
- Connection pooling for database connections
- Aggregation pipelines for complex queries
- Proper indexing strategy for frequently accessed data

### API Optimization
- Response compression with gzip
- Request/response caching where appropriate
- Pagination for large datasets
- Rate limiting to prevent abuse

---

This architecture documentation demonstrates enterprise-level system design and implementation skills, showcasing:

- **Scalable Architecture Design**
- **Security Best Practices**
- **Real-time System Implementation**
- **Database Design & Optimization**
- **Modern Development Practices**
- **Production-Ready Deployment**
