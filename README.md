# PlanStack — Project Management System

A comprehensive, production-grade Project Management System built with React, Node.js, Express, and MySQL.

## Tech Stack

| Layer      | Technology                                                     |
|------------|----------------------------------------------------------------|
| Frontend   | React (Vite) + Tailwind CSS + Lucide React + Axios + React Router DOM |
| Backend    | Node.js + Express                                              |
| Database   | MySQL (Prisma ORM)                                             |
| Auth       | JWT (Stateless, Bearer Token) + Google OAuth 2.0               |
| Validation | Zod                                                            |
| Logging    | Morgan (HTTP request logger)                                   |

## Project Structure

```
project/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Database models & enums
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Prisma client instance
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── dashboard.controller.js
│   │   │   ├── project.controller.js
│   │   │   └── task.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── routes/
│   │   │   └── index.js
│   │   ├── validations/
│   │   │   ├── auth.validation.js
│   │   │   ├── project.validation.js
│   │   │   └── task.validation.js
│   │   └── server.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookOpenAnimation.jsx
│   │   │   ├── Layout.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── Spinner.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Tasks.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── DATABASE_SCHEMA.md
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)

### 1. Database Setup
Open MySQL CLI and create the database:
```sql
CREATE DATABASE project_management_db;
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/project_management_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
GOOGLE_CLIENT_ID="your-google-client-id"
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 3. Backend Setup
```bash
cd backend
npm install

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start the server
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Application
| Service         | URL                          |
|-----------------|------------------------------|
| Frontend        | http://localhost:5173         |
| Backend API     | http://localhost:5000/api     |
| Health Check    | http://localhost:5000/api/health |
| Prisma Studio   | http://localhost:5555 (via `npx prisma studio`) |

## API Documentation

### Authentication
| Method | Endpoint            | Auth     | Description           |
|--------|---------------------|----------|-----------------------|
| POST   | /api/auth/register  | Public   | Register new user     |
| POST   | /api/auth/login     | Public   | Login user            |
| POST   | /api/auth/logout    | Private  | Logout user           |
| POST   | /api/auth/google    | Public   | Google OAuth login    |
| GET    | /api/auth/me        | Private  | Get current user      |

### Dashboard
| Method | Endpoint        | Auth    | Description         |
|--------|-----------------|---------|---------------------|
| GET    | /api/dashboard  | Private | Get dashboard stats |

### Projects
| Method | Endpoint           | Auth    | Description         |
|--------|--------------------|---------|--------------------|
| GET    | /api/projects      | Private | List all projects (search, filter) |
| GET    | /api/projects/:id  | Private | Get project details |
| POST   | /api/projects      | Private | Create project      |
| PUT    | /api/projects/:id  | Private | Update project      |
| DELETE | /api/projects/:id  | Private | Delete project      |

### Tasks
| Method | Endpoint        | Auth    | Description         |
|--------|-----------------|---------|---------------------|
| GET    | /api/tasks      | Private | List all tasks (search, filter) |
| GET    | /api/tasks/:id  | Private | Get task details    |
| POST   | /api/tasks      | Private | Create task         |
| PUT    | /api/tasks/:id  | Private | Update task         |
| DELETE | /api/tasks/:id  | Private | Delete task         |

### Query Parameters

**GET /api/projects**
| Param  | Type   | Description              |
|--------|--------|--------------------------|
| search | string | Search by name/description |
| status | enum   | NOT_STARTED, IN_PROGRESS, COMPLETED |

**GET /api/tasks**
| Param     | Type   | Description              |
|-----------|--------|--------------------------|
| search    | string | Search by name/description |
| status    | enum   | PENDING, IN_PROGRESS, COMPLETED |
| priority  | enum   | LOW, MEDIUM, HIGH        |
| projectId | uuid   | Filter by project        |

## Security Features
- **JWT Authentication** — Stateless Bearer token auth
- **Google OAuth 2.0** — Social login via Google
- **Password Hashing** — bcryptjs with 12 salt rounds
- **Data Isolation** — Multi-tenant logic; users can only access their own data
- **Input Validation** — Zod schemas on every endpoint
- **Rate Limiting** — Auth routes protected against brute-force (20 req / 15 min)
- **SQL Injection Protection** — Prisma ORM parameterized queries
- **Request Logging** — Morgan HTTP logger for monitoring

## Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for the full ER diagram and table definitions.
