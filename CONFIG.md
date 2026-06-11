# MHCS Configuration Guide

This document describes all environment variables used in the Mental Health Care System (MHCS) monorepo.

## Database Configuration

### MONGODB_URI
- **Type:** String (URL)
- **Default:** `mongodb://localhost:27017/mhcs`
- **Description:** MongoDB connection string. Supports authentication and replica sets.
- **Development:** Use local MongoDB or Docker service
- **Production:** Use managed MongoDB Atlas or enterprise instance
- **Example (Local):** `mongodb://localhost:27017/mhcs`
- **Example (Atlas):** `mongodb+srv://user:password@cluster.mongodb.net/mhcs?retryWrites=true&w=majority`

## Authentication

### JWT_SECRET
- **Type:** String
- **Required:** Yes
- **Description:** Secret key for signing JWT access tokens. Must be a strong random string.
- **Length:** Minimum 32 characters recommended
- **Security:** Change from default in all non-development environments
- **Example:** Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### JWT_REFRESH_SECRET
- **Type:** String
- **Required:** Yes
- **Description:** Secret key for signing JWT refresh tokens. Must be different from JWT_SECRET.
- **Length:** Minimum 32 characters recommended
- **Security:** Change from default in all non-development environments
- **Example:** Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### JWT_EXPIRES_IN
- **Type:** String
- **Default:** `15m`
- **Description:** Access token expiration time. Uses vercel/ms format.
- **Recommended:** `15m` for development, `5m` for production
- **Format:** `<number><unit>` where unit is `s`, `m`, `h`, `d`

### JWT_REFRESH_EXPIRES_IN
- **Type:** String
- **Default:** `7d`
- **Description:** Refresh token expiration time.
- **Recommended:** `7d` for development, `30d` for production

## Server Configuration

### NODE_ENV
- **Type:** Enum: `development`, `staging`, `production`
- **Default:** `development`
- **Description:** Application environment. Affects logging level, error handling, and security settings.
- **Development:** Enables verbose logging and dev error pages
- **Production:** Minimal logging, strict error handling, security headers enabled

### PORT
- **Type:** Number
- **Default:** `5000`
- **Description:** Backend server port
- **Note:** In Docker, this should remain 5000 (port mapping handled by docker-compose)

### CLIENT_URL
- **Type:** String (URL)
- **Default:** `http://localhost:5173`
- **Description:** Frontend client URL for CORS configuration
- **Development:** `http://localhost:5173` (Vite default)
- **Production:** Set to your production domain, e.g., `https://app.mhcs.com`

### AI_SERVICE_URL
- **Type:** String (URL)
- **Default:** `http://localhost:8001`
- **Description:** AI service endpoint for backend communication
- **Development:** `http://localhost:8001`
- **Docker:** `http://ai-service:8001`

## Security

### COOKIE_SECURE
- **Type:** Boolean (string: `true`/`false`)
- **Default:** `false`
- **Description:** Whether to only send cookies over HTTPS
- **Development:** `false`
- **Production:** `true` (requires HTTPS)

### SESSION_TIMEOUT_MS
- **Type:** Number (milliseconds)
- **Default:** `900000` (15 minutes)
- **Description:** Session expiration timeout
- **Example:** `1800000` = 30 minutes

## Rate Limiting

### RATE_LIMIT_WINDOW_MS
- **Type:** Number (milliseconds)
- **Default:** `900000` (15 minutes)
- **Description:** Time window for rate limiting calculations
- **Example:** `60000` = 1 minute window

### RATE_LIMIT_MAX
- **Type:** Number
- **Default:** `100`
- **Description:** Maximum requests per window per IP
- **Development:** `100` or higher for testing
- **Production:** `100` for standard APIs, adjust based on load

## AI Service

### AI_SERVICE_PORT
- **Type:** Number
- **Default:** `8001`
- **Description:** Port where FastAPI AI service runs
- **Note:** Managed by Python/FastAPI, not Node.js

## Logging

### LOG_LEVEL
- **Type:** Enum: `debug`, `info`, `warn`, `error`
- **Default:** `info`
- **Description:** Minimum logging level
- **Development:** `debug` for detailed logging
- **Production:** `info` or `warn` to reduce log volume

## Docker-Specific Variables

### MONGO_ROOT_USER
- **Type:** String
- **Default:** `admin`
- **Description:** MongoDB root username for Docker
- **Note:** Only used in docker-compose setup

### MONGO_ROOT_PASSWORD
- **Type:** String
- **Default:** `changeme`
- **Description:** MongoDB root password for Docker
- **Security:** Change in production docker-compose usage

## Setup Instructions

### Development
1. Copy `.env.example` to `.env.local`
2. Update values for local development
3. Generate secure JWT secrets for non-development use

### Production
1. Use `.env.example` as template
2. Generate strong random values for all secrets
3. Use managed services (MongoDB Atlas, etc.) instead of local databases
4. Set `NODE_ENV=production`
5. Set `COOKIE_SECURE=true`
6. Use HTTPS for `CLIENT_URL`
7. Minimize `LOG_LEVEL` to reduce storage
8. Store secrets in environment variables, not in files

### Docker Deployment
1. Create `.env.local` with required variables
2. Run `docker-compose up -d`
3. Verify services: `docker-compose ps`
4. Check logs: `docker-compose logs -f service_name`

## Security Checklist

- [ ] Changed all default JWT secrets
- [ ] Using strong random strings (32+ chars)
- [ ] Set NODE_ENV appropriately
- [ ] COOKIE_SECURE=true for production
- [ ] CLIENT_URL matches production domain
- [ ] Database credentials are strong
- [ ] No secrets committed to git
- [ ] Using .env.local (git-ignored)
- [ ] All environment variables documented
- [ ] Rate limiting configured appropriately
