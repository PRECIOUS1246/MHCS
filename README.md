# MHCS — Mental Health Care System

A production-ready, full-stack mental health platform for university students. Built with React, Node.js, MongoDB, and a FastAPI AI microservice placeholder for future analytics integration.

## Features

- **Authentication** — JWT + refresh tokens, RBAC, secure cookies
- **Anonymous Self-Assessment** — PHQ-9 & GAD-7 with risk scoring and counsellor alerts
- **Mood Tracking** — Daily logging, emoji selection, trend charts
- **Real-Time Peer Chat** — Socket.io with typing indicators and anonymous nicknames
- **Anonymous Forums** — Categories, likes, reporting, moderation
- **Appointment Booking** — Student booking, counsellor approval, schedule management
- **Resources** — Articles, guides, emergency contacts (admin-managed)
- **Notifications & Alerts** — Real-time alerts for high-risk assessments
- **Role Dashboards** — Student, Counsellor, and Admin views
- **Dark/Light Mode** — Accessible, calming UI with glassmorphism

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, Tailwind, Zustand, Framer Motion, Recharts, Socket.io |
| Backend | Node.js, Express, TypeScript, Mongoose, JWT, Helmet, Rate Limiting |
| Database | MongoDB |
| AI Service | FastAPI (placeholder routes) |
| DevOps | Docker, GitHub Actions CI/CD |

## Project Structure

```
/client          React frontend (Vite)
/server          Express API + Socket.io
/ai-service      FastAPI microservice
/docs            API documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB 7+
- Python 3.11+ (for AI service)

### Setup

```bash
# Clone and install
npm install
cd server && npm install
cd ../client && npm install

# Environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Seed demo data
cd server && npm run seed

# Start all services (from root)
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5000/api |
| AI Service | http://localhost:8001 |

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@university.edu | Password123! |
| Counsellor | counsellor@university.edu | Password123! |
| Student | student@university.edu | Password123! |

## Docker

```bash
docker-compose up -d
```

## Testing

```bash
npm test                    # All tests
cd server && npm test       # Backend unit tests
cd client && npm test       # Frontend tests
cd ai-service && python -m pytest
```

## API Documentation

See [docs/API.md](docs/API.md) for full endpoint reference.

## Security

- bcrypt password hashing
- JWT access + refresh token rotation
- Helmet, CORS, rate limiting, mongo sanitization
- RBAC on all protected routes
- Sensitive mental health data never exposed without authentication

## License

MIT — For educational and university deployment purposes.
