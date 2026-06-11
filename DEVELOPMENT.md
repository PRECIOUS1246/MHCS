# MHCS Development Guide

## Prerequisites

- **Node.js:** 20.x LTS or higher
- **pnpm:** 8.0.0 or higher (install globally: `npm install -g pnpm`)
- **Docker & Docker Compose:** For containerized development
- **MongoDB:** Local instance or Docker service
- **Python:** 3.9+ (for AI service development)

## Initial Setup

### 1. Install Dependencies

Using pnpm workspaces:

```bash
pnpm install
```

This will install dependencies for all workspace packages (client and server).

### 2. Environment Configuration

Copy the example configuration and update for your environment:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local development values. See [CONFIG.md](./CONFIG.md) for detailed variable documentation.

### 3. MongoDB Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# macOS: brew install mongodb-community
# Ubuntu: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
# Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/

# Start MongoDB
mongod
```

#### Option B: Docker Container
```bash
# Start MongoDB in Docker
docker run -d \
  --name mhcs-mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongo:7
```

#### Option C: Docker Compose (Recommended)
```bash
# Start all services (MongoDB, backend, AI service, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Development Workflows

### Running All Services

```bash
# Start all services concurrently (Node.js services only)
pnpm dev

# In separate terminals:
pnpm dev:server    # Start backend on http://localhost:5000
pnpm dev:client    # Start frontend on http://localhost:5173
pnpm dev:ai        # Start AI service on http://localhost:8001
```

### Running Individual Services

#### Backend (Server)

```bash
# Install dependencies
pnpm --filter server install

# Development with hot reload
pnpm dev:server

# Build
pnpm build:server

# Run tests
pnpm test:server

# Lint
pnpm lint:server

# Type check
pnpm type-check --filter server
```

#### Frontend (Client)

```bash
# Install dependencies
pnpm --filter client install

# Development with hot reload (Vite)
pnpm dev:client

# Build
pnpm build:client

# Preview production build
pnpm --filter client run preview

# Tests
pnpm test:client

# Lint
pnpm lint:client

# Type check
pnpm type-check --filter client
```

#### AI Service

```bash
# Navigate to AI service directory
cd ai-service

# Install Python dependencies
pip install -r requirements.txt

# Run development server with auto-reload
python -m uvicorn main:app --reload --port 8001

# Run tests
pytest

# Or use the npm script
pnpm dev:ai
```

## Code Quality

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
pnpm lint:server
pnpm lint:client

# Fix linting issues automatically
pnpm lint -- --fix
```

### Formatting

```bash
# Check formatting
pnpm format:check

# Format all files
pnpm format

# This applies Prettier configuration from .prettierrc
```

### Type Checking

```bash
# Type check all packages
pnpm type-check

# Type check specific package
pnpm type-check --filter server
pnpm type-check --filter client
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run server tests
pnpm test:server

# Run client tests
pnpm test:client

# Run tests in watch mode (configured per package)
pnpm test -- --watch
```

## Building for Production

### Build All Services

```bash
# Build frontend and backend
pnpm build

# Individual builds
pnpm build:server
pnpm build:client
```

### Build Docker Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build server
docker-compose build client

# Build with no cache
docker-compose build --no-cache
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f service_name

# Stop services
docker-compose down

# Remove volumes (data loss!)
docker-compose down -v
```

## Workspace Configuration

This is a pnpm monorepo with the following structure:

```
mhcs/
├── server/              # Node.js/Express backend
├── client/              # React/Vite frontend
├── ai-service/          # Python/FastAPI AI service
├── package.json         # Root workspace config
├── pnpm-workspace.yaml  # pnpm configuration
├── .npmrc              # npm registry config
├── tsconfig.json       # Root TypeScript config
├── .eslintrc.json      # ESLint config
├── .prettierrc          # Prettier config
└── docker-compose.yml  # Local development containers
```

### Running Commands in Workspaces

```bash
# Run script in all packages
pnpm -r run <script>

# Run script in specific package
pnpm --filter server run <script>

# Run scripts in parallel
pnpm -r --parallel run dev

# Install package in specific workspace
pnpm --filter server add lodash
pnpm --filter server add -D @types/node

# Remove package from workspace
pnpm --filter server remove lodash
```

## Debugging

### Backend Debugging

#### VS Code
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "program": "${workspaceFolder}/server/dist/index.js",
      "restart": true,
      "runtimeArgs": ["-r", "ts-node/register"],
      "console": "integratedTerminal"
    }
  ]
}
```

#### Chrome DevTools
```bash
node --inspect-brk dist/index.js
```

### Frontend Debugging

Use React Developer Tools and Vue/Svelte extensions in your browser. Vite includes source maps for development.

### Database Debugging

```bash
# Connect to MongoDB shell
mongosh localhost:27017/mhcs

# Or using Docker
docker exec -it mhcs-mongodb mongosh
```

## Common Issues

### Port Already in Use
```bash
# Find and kill process on port
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

### Node Modules Issues
```bash
# Clean reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Or per workspace
pnpm --filter server install
```

### Docker Issues
```bash
# Remove containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh localhost:27017

# Verify connection string in .env.local
# Format: mongodb://[username]:[password]@host:port/database
```

## Git Workflow

### Branches
- `main` - Production ready
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fixes

### Pre-commit Hooks (with husky)

Automatic linting and formatting runs before commit:
```bash
# Staged files are automatically linted
git add .
git commit -m "Your message"
```

## Performance Optimization

### Frontend
- Monitor bundle size: `pnpm --filter client run build`
- Use React DevTools Profiler
- Implement code splitting and lazy loading

### Backend
- Monitor memory usage
- Check database query performance
- Use Winston logging for production diagnostics

### Database
- Create indexes for frequently queried fields
- Monitor slow query logs
- Implement connection pooling

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [pnpm Documentation](https://pnpm.io/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For issues or questions:
1. Check existing documentation in `docs/`
2. Review error logs carefully
3. Check GitHub issues
4. Consult team lead
