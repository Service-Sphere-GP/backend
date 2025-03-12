# Admin User Creation Guide

This document explains how to create admin users in your application.

## Creating the First Admin User

When your application is first deployed and there are no admin users in the system, you can create the first admin user using the following endpoint:

```
POST /auth/register/first-admin
```

Example request body:

```json
{
  "first_name": "Admin",
  "last_name": "User",
  "email": "admin@example.com",
  "password": "securePassword123",
  "confirm_password": "securePassword123",
  "permissions": ["manage_users", "manage_services", "manage_all"]
}
```

This endpoint will only work when there are no existing admin users in the system. Once the first admin is created, this endpoint will return a 403 error.

## Creating Additional Admin Users

After the first admin is created, there are two ways to create additional admin users:

### 1. Using the API Key Authentication

You can create additional admin users by using the following endpoint with an API key:

```
POST /auth/register/admin
```

This endpoint requires an API key to be provided in the `x-api-key` header. The API key should be set in the `ADMIN_API_KEY` environment variable.

Example request:

```bash
curl -X POST \
  http://your-api.com/auth/register/admin \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: your-api-key-here' \
  -d '{
    "first_name": "Another",
    "last_name": "Admin",
    "email": "another.admin@example.com",
    "password": "securePassword456",
    "confirm_password": "securePassword456",
    "permissions": ["manage_users", "manage_services"]
  }'
```

### 2. Using Admin Authentication

Existing admin users can create new admin users through the admin interface using the following endpoint:

```
POST /users/admins
```

This endpoint requires JWT authentication with an admin role.

Example request:

```bash
curl -X POST \
  http://your-api.com/users/admins \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-admin-jwt-token' \
  -d '{
    "first_name": "New",
    "last_name": "Admin",
    "email": "new.admin@example.com",
    "password": "securePassword789",
    "confirm_password": "securePassword789",
    "permissions": ["manage_users"]
  }'
```

## Security Considerations

- Set a strong, unique value for the `ADMIN_API_KEY` environment variable
- Keep your API key secure and only share it with authorized personnel
- Use HTTPS for all API requests to prevent interception of sensitive data
- Regularly rotate your API key for enhanced security
- Consider implementing IP whitelisting for admin creation endpoints
- Monitor admin creation activities for any suspicious behavior

## Environment Variables

Make sure to set the following environment variables:

- `ADMIN_API_KEY`: A secure random string used for API key authentication

Example:

```bash
# Linux/macOS
export ADMIN_API_KEY="your-secure-random-api-key"

# Windows
set ADMIN_API_KEY=your-secure-random-api-key
```

You can generate a secure random API key using a command like:

```bash
# Linux/macOS
openssl rand -hex 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
``` 