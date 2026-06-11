# MHCS API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login | No |
| POST | `/auth/refresh` | Refresh access token | Cookie/Body |
| POST | `/auth/logout` | Logout | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| GET | `/auth/profile` | Get profile | Yes |
| PATCH | `/auth/profile` | Update profile | Yes |

### Register Body
```json
{
  "email": "student@university.edu",
  "password": "Password123!",
  "firstName": "Alex",
  "lastName": "Student",
  "role": "student",
  "studentId": "STU001"
}
```

## Assessments

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| POST | `/assessments` | Submit assessment (anonymous optional) | Optional |
| GET | `/assessments/history` | Student history | Student |
| GET | `/assessments/counsellor` | Review assessments | Counsellor, Admin |

### Submit Body
```json
{
  "type": "phq9",
  "answers": [0, 1, 2, 1, 0, 1, 2, 1, 0],
  "isAnonymous": true
}
```

**Risk Levels:** `low` (0-4), `moderate` (5-9), `high` (10-14), `critical` (15+)

## Moods

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/moods` | Log mood |
| GET | `/moods/history` | Mood history |
| GET | `/moods/analytics` | Trend analytics |

## Appointments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/appointments/counsellors` | List counsellors |
| POST | `/appointments/book` | Book appointment |
| GET | `/appointments/student` | Student appointments |
| GET | `/appointments/counsellor` | Counsellor appointments |
| PATCH | `/appointments/:id/approve` | Approve |
| PATCH | `/appointments/:id/reject` | Reject |
| PATCH | `/appointments/:id/cancel` | Cancel |
| PATCH | `/appointments/:id/complete` | Complete session |
| POST | `/appointments/availability` | Set availability |
| GET | `/appointments/availability/:counsellorId` | Get availability |

## Forums

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/forums` | List forums |
| POST | `/forums` | Create forum (admin) |
| GET | `/forums/:forumId/posts` | Get posts |
| POST | `/forums/posts` | Create post |
| POST | `/forums/posts/:id/like` | Like post |
| POST | `/forums/posts/:id/report` | Report post |
| PATCH | `/forums/posts/:id/moderate` | Moderate (admin) |

## Resources

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resources` | List (search, type filter) |
| POST | `/resources` | Create (admin) |
| PATCH | `/resources/:id` | Update (admin) |
| DELETE | `/resources/:id` | Delete (admin) |

## Notifications & Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| PATCH | `/notifications/:id/read` | Mark read |
| PATCH | `/notifications/read-all` | Mark all read |
| GET | `/alerts` | List alerts (counsellor) |
| PATCH | `/alerts/:id/resolve` | Resolve alert |

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Admin stats |
| GET | `/admin/users` | List users |
| PATCH | `/admin/users/:id` | Update user |
| DELETE | `/admin/users/:id` | Deactivate user |
| GET | `/admin/activity-logs` | Activity logs |
| GET | `/admin/student-dashboard` | Student dashboard data |
| GET | `/admin/counsellor-dashboard` | Counsellor dashboard data |

## Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chat/:roomId/history` | Chat history |

### Socket.io Events

- `chat:join` — Join room
- `chat:message` — Send message
- `chat:typing` — Typing indicator
- `notification` — Real-time notification

## AI Service (Port 8001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/v1/sentiment` | Sentiment analysis (placeholder) |
| POST | `/api/v1/risk-prediction` | Risk prediction (placeholder) |
| POST | `/api/v1/emotional-analytics` | Emotional trends (placeholder) |
| POST | `/api/v1/recommendations` | Resource recommendations (placeholder) |
| POST | `/api/v1/chatbot` | AI chatbot (placeholder) |

## Response Format

```json
{
  "success": true,
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Error Format

```json
{
  "success": false,
  "message": "Error description"
}
```
