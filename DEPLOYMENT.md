# 🚀 Service Sphere - Deployment Guide

## 📋 Table of Contents
- [Deployment Overview](#deployment-overview)
- [Development Environment](#development-environment)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)

## 🌐 Deployment Overview

Service Sphere supports multiple deployment strategies, from local development to production-ready cloud deployments. This guide covers all deployment scenarios with step-by-step instructions.

### Deployment Options
- **Development**: Local development with hot reload
- **Docker**: Containerized deployment for consistency
- **Production**: Optimized production deployment
- **Cloud**: AWS, Google Cloud, or Azure deployment
- **Kubernetes**: Container orchestration for scalability

## 💻 Development Environment

### Prerequisites
```bash
# Node.js (v18+ recommended)
node --version  # Should be v18.0.0 or higher
npm --version   # Should be v8.0.0 or higher

# MongoDB (optional if using Docker)
mongod --version

# Git
git --version
```

### Local Development Setup

#### 1. Clone Repository
```bash
git clone git@github.com:Service-Sphere-GP/backend.git
cd backend
```

#### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Install development dependencies
npm install --include=dev
```

#### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.development.local

# Edit environment variables
nano .env.development.local
```

**Required Environment Variables:**
```env
# Database Configuration
DATABASE_URI=mongodb://localhost:27017/service-sphere-dev

# JWT Configuration
JWT_SECRET=your-super-secret-development-key-here
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d

# Email Configuration (for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-dev-email@gmail.com
SMTP_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Application Configuration
APP_PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3001
```

#### 4. Start Development Server
```bash
# Start with hot reload
npm run start:dev

# Start with debug mode
npm run start:debug

# Run tests during development
npm run test:watch
```

#### 5. Database Seeding (Optional)
```bash
# Seed with sample data
npm run seed

# Seed with minimal data
npm run seed:minimal
```

### Development Tools
```bash
# Code formatting
npm run format

# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Test coverage
npm run test:cov
```

## 🐳 Docker Deployment

### Docker Compose (Recommended for Development)

#### 1. Basic Docker Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    env_file:
      - .env.development.local
    depends_on:
      - mongodb
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run start:dev

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=service-sphere

volumes:
  mongo_data:
```

#### 2. Start Docker Environment
```bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v
```

#### 3. Docker Development Commands
```bash
# Execute commands in running container
docker-compose exec app npm run test
docker-compose exec app npm run seed

# Access MongoDB shell
docker-compose exec mongodb mongosh service-sphere

# Rebuild specific service
docker-compose build app
```

### Production Docker Setup

#### 1. Multi-stage Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "start:dev"]

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
```

#### 2. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production.local
    depends_on:
      - mongodb
      - redis
    restart: unless-stopped

  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./mongo-init:/docker-entrypoint-initdb.d
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  mongo_data:
  redis_data:
```

#### 3. Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production environment
docker-compose -f docker-compose.prod.yml up -d

# Scale application
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Health check
docker-compose -f docker-compose.prod.yml ps
```

## 🏭 Production Deployment

### Server Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 20GB minimum SSD
- **Network**: Stable internet connection
- **OS**: Ubuntu 20.04+ or CentOS 8+

### Manual Production Setup

#### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

#### 2. Application Deployment
```bash
# Clone repository
git clone git@github.com:Service-Sphere-GP/backend.git
cd backend

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Set up environment
cp .env.example .env.production.local
# Edit .env.production.local with production values
```

#### 3. PM2 Process Management
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'service-sphere-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
```

```bash
# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 startup
pm2 startup

# Monitor application
pm2 monit
```

#### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/service-sphere
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/service-sphere /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### 5. SSL Configuration with Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup
```bash
# Launch EC2 instance (t3.medium recommended)
# Security groups: HTTP (80), HTTPS (443), SSH (22), Custom (3000)

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Follow manual production setup above
```

#### 2. Amazon ECS Deployment
```json
{
  "family": "service-sphere-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "service-sphere-api",
      "image": "your-account.dkr.ecr.region.amazonaws.com/service-sphere:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/service-sphere",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### 3. MongoDB Atlas Integration
```env
# Use MongoDB Atlas for managed database
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/service-sphere?retryWrites=true&w=majority
```

### Google Cloud Platform Deployment

#### 1. Cloud Run Deployment
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/service-sphere', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/service-sphere']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
      - 'run'
      - 'deploy'
      - 'service-sphere-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/service-sphere'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
      - '--allow-unauthenticated'
```

```bash
# Deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml
```

### Azure Deployment

#### 1. Azure Container Instances
```bash
# Create resource group
az group create --name service-sphere-rg --location eastus

# Deploy container
az container create \
  --resource-group service-sphere-rg \
  --name service-sphere-api \
  --image your-registry/service-sphere:latest \
  --dns-name-label service-sphere \
  --ports 3000
```

## 🔧 Environment Configuration

### Environment Files Structure
```
.env.development.local    # Development environment
.env.test.local          # Testing environment
.env.staging.local       # Staging environment
.env.production.local    # Production environment
```

### Complete Environment Template
```env
# Application Configuration
NODE_ENV=production
APP_PORT=3000
CORS_ORIGIN=https://your-frontend-domain.com

# Database Configuration
DATABASE_URI=mongodb://localhost:27017/service-sphere
DATABASE_NAME=service-sphere

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRATION_TIME=15m
JWT_REFRESH_TOKEN_EXPIRATION_TIME=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Configuration
ADMIN_API_KEY=your-admin-api-key-for-creating-admin-users

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn-for-error-tracking

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Limits
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,webp
```

### Environment Validation
```typescript
// src/config/validation.schema.ts
import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  APP_PORT: Joi.number().default(3000),
  DATABASE_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().default('7d'),
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
});
```

## 🗄️ Database Setup

### MongoDB Configuration

#### 1. Local MongoDB Setup
```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database user
mongosh
```

```javascript
// MongoDB shell commands
use service-sphere

// Create application user
db.createUser({
  user: "service_sphere_user",
  pwd: "secure_password",
  roles: [
    { role: "readWrite", db: "service-sphere" }
  ]
})

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.services.createIndex({ service_provider: 1 })
db.services.createIndex({ categories: 1 })
db.bookings.createIndex({ customer: 1 })
db.bookings.createIndex({ service: 1 })
db.feedback.createIndex({ service: 1 })
```

#### 2. MongoDB Atlas (Cloud) Setup
```bash
# 1. Create MongoDB Atlas account
# 2. Create cluster
# 3. Configure network access (whitelist your IP)
# 4. Create database user
# 5. Get connection string
```

```env
# Atlas connection string
DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/service-sphere?retryWrites=true&w=majority
```

### Database Migration & Seeding

#### 1. Seed Scripts
```typescript
// src/seeds/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const usersService = app.get(UsersService);
  const categoriesService = app.get(CategoriesService);

  // Seed categories
  const categories = [
    'Cleaning Services',
    'Home Maintenance',
    'Garden & Landscaping',
    'Pet Services',
    'Tutoring & Education'
  ];

  for (const categoryName of categories) {
    await categoriesService.create(categoryName);
  }

  // Seed admin user
  await usersService.createAdmin({
    first_name: 'Admin',
    last_name: 'User',
    email: 'admin@servicespherem.com',
    password: 'AdminPassword123!'
  });

  console.log('Database seeded successfully');
  await app.close();
}

bootstrap();
```

```bash
# Run seed script
npm run seed
```

## 📊 Monitoring & Logging

### Application Monitoring

#### 1. Health Check Endpoint
```typescript
// src/app.controller.ts
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  };
}
```

#### 2. PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# CPU and memory usage
pm2 list

# Restart application
pm2 restart service-sphere-api

# View logs
pm2 logs service-sphere-api

# Reload application (zero-downtime)
pm2 reload service-sphere-api
```

#### 3. Nginx Monitoring
```bash
# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### Logging Configuration

#### 1. Winston Logger Setup
```typescript
// src/config/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
});
```

#### 2. Error Tracking with Sentry
```typescript
// src/main.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
}
```

## 🔒 Security Considerations

### Production Security Checklist

#### 1. Environment Security
```bash
# Set proper file permissions
chmod 600 .env.production.local

# Use environment variables, not files in production
export JWT_SECRET="your-secret-here"
```

#### 2. Database Security
```javascript
// MongoDB security
db.createUser({
  user: "service_sphere_user",
  pwd: "strong_random_password",
  roles: [{ role: "readWrite", db: "service-sphere" }]
})

// Enable authentication
# In /etc/mongod.conf
security:
  authorization: enabled
```

#### 3. Nginx Security Headers
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

# Hide Nginx version
server_tokens off;
```

#### 4. Firewall Configuration
```bash
# UFW firewall setup
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 27017  # MongoDB (restrict to app server IP in production)
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
pm2 logs service-sphere-api

# Check environment variables
pm2 env 0

# Restart application
pm2 restart service-sphere-api

# Check port availability
sudo netstat -tlnp | grep :3000
```

#### 2. Database Connection Issues
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/service-sphere"

# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### 3. Memory Issues
```bash
# Check memory usage
free -h

# Check application memory usage
pm2 monit

# Restart application if memory leak
pm2 restart service-sphere-api
```

#### 4. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Test certificate
openssl s_client -connect your-domain.com:443
```

### Performance Optimization

#### 1. Database Optimization
```javascript
// Add compound indexes
db.bookings.createIndex({ customer: 1, status: 1 })
db.services.createIndex({ service_provider: 1, status: 1 })

// Monitor slow queries
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)
```

#### 2. Application Optimization
```typescript
// Enable compression
app.use(compression());

// Connection pooling
MongooseModule.forRootAsync({
  useFactory: () => ({
    uri: process.env.DATABASE_URI,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }),
});
```

#### 3. Nginx Optimization
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Enable caching
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

This deployment guide demonstrates:

- **Multiple Deployment Strategies**: From development to production
- **Container Orchestration**: Docker and Kubernetes ready
- **Cloud Platform Support**: AWS, GCP, Azure deployment options
- **Production Best Practices**: Security, monitoring, optimization
- **Troubleshooting Skills**: Problem-solving and debugging
- **DevOps Knowledge**: Infrastructure as code and automation
