# ContextWeave

**Real-time temporal knowledge graph platform for decision intelligence.**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![Status: MVP](https://img.shields.io/badge/Status-MVP-green.svg)](#-quick-start)

---

## 🎯 What is ContextWeave?

ContextWeave helps teams make better decisions by capturing **why** decisions were made, not just **what** was decided.

### The Problem
- 47% of knowledge workers can't find needed information
- Organizations lose $31.5B annually to forgotten knowledge
- New employees need 200+ hours to become productive
- Developers spend 40% of time context-switching

### The Solution
ContextWeave automatically creates a **temporal knowledge graph** from meetings, documents, decisions, and code—providing context-aware intelligence in real-time.

---

## ✨ Key Features

- **Decision Tracking** - Capture decisions with rationale and context
- **Temporal Awareness** - Understand *when* and *why* decisions were made
- **Real-Time Updates** - WebSocket streaming of decision changes
- **User Approval System** - Admin panel for managing user access
- **Protected Routes** - User data isolation and security
- **Analytics Dashboard** - Metrics and insights on decision-making

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker & Docker Compose 2.20+
- Git

### Start Everything

```bash
# Clone repository
git clone https://github.com/yourusername/contextweave.git
cd contextweave

# Start all services
docker-compose up -d

# Wait for initialization
sleep 30

# Check health
curl http://localhost:8000/health
```

**Access the application:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/docs
- **Health Check:** http://localhost:8000/health

### Default Admin User

After startup, an admin user is automatically created:

```
Email: admin@contexweave.com
Username: admin
Password: admin123secure
```

⚠️ **Change the admin password in production!** Update `ADMIN_PASSWORD` in `.env`

---

## 🔑 Getting Started

### 1. Signup & Login

```bash
# Frontend: http://localhost:5173/signup
# Enter email, username, password
# Your account will be pending admin approval
```

### 2. Admin Approves Users

```bash
# Login as admin
# Go to Admin Panel (/admin)
# Approve pending users
```

### 3. Create Your First Decision

```bash
# After approval, login with your account
# Go to Dashboard
# Click "Create Decision"
# Add title, description, context
```

### 4. Track Events

```bash
# Add events to your decision
# Track progress, meetings, milestones
# See analytics in real-time
```

---

## 🏗️ Architecture

```
┌─────────────────────────────┐
│   Frontend (React 19)       │
│   - Login/Signup            │
│   - Dashboard               │
│   - Admin Panel             │
└────────────┬────────────────┘
             │
         REST API
         WebSocket
             │
┌────────────┴────────────────┐
│   Backend (FastAPI)         │
│   - Auth & Permissions      │
│   - Decision Management     │
│   - Analytics              │
│   - Admin Endpoints        │
└────────────┬────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│PostgreSQL   │Redis    │
│(Decisions) │(Cache)   │
└───────┘      └────┘
```

---

## 🛠️ Tech Stack

### Frontend
- React 19 + Vite
- React Router for navigation
- TailwindCSS for styling
- Axios for API calls

### Backend
- FastAPI (Python 3.11)
- PostgreSQL for data
- Redis for caching
- JWT for authentication
- Bcrypt for password hashing

### DevOps
- Docker & Docker Compose
- Automatic database initialization
- Auto-admin user creation

---

## 📁 Project Structure

```
contextweave/
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # Auth context
│   │   ├── services/         # API services
│   │   └── App.jsx
│   ├── Dockerfile              # Production (builds /dist)
│   ├── Dockerfile.dev          # ✨ Development (npm run dev)
│   ├── nginx.conf              # Production only
│   ├── src/
│   └── package.json
│
├── backend/
│   ├── core/
│   │   ├── models.py         # Database models (with User roles)
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── auth.py           # JWT & password functions
│   │   ├── database.py       # DB connection
│   │   └── init_db.py        # ✨ Auto-init script
│   │
│   ├── main.py               # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml        # All services
├── .env.example
└── README.md
```

---

## 🔐 Security Features

### Authentication
- JWT tokens (60-minute expiration)
- Bcrypt password hashing
- Protected routes with role-based access

### User Management
- Admin approval system for new users
- User status: `pending` → `approved` → `active`
- User roles: `admin`, `user`

### Data Protection
- TLS for all network traffic
- User data isolation (users see only their decisions)
- Environment variables for secrets (never committed)

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/signup         # Create account (pending approval)
POST   /api/auth/login          # Login (requires approval)
GET    /api/auth/me             # Get current user (requires token)
```

### Decisions (Protected)
```
POST   /api/decisions           # Create decision
GET    /api/decisions           # List your decisions
GET    /api/decisions/{id}      # Get specific decision
PUT    /api/decisions/{id}      # Update decision
DELETE /api/decisions/{id}      # Delete decision
```

### Events (Protected)
```
POST   /api/events              # Create event for decision
GET    /api/decisions/{id}/events    # Get events for decision
```

### Admin (Requires admin role)
```
GET    /api/admin/pending-users       # List pending approvals
POST   /api/admin/approve-user/{id}   # Approve user
POST   /api/admin/reject-user/{id}    # Reject user
GET    /api/admin/all-users          # List all users
```

### Analytics (Protected)
```
GET    /api/analytics/overview        # Dashboard stats
GET    /api/analytics/event-types     # Event distribution
GET    /api/analytics/timeline        # Timeline stats
```

---

## 🧪 Testing

### Test Signup Flow

```bash
# 1. Signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
# Response: {"access_token": "pending_approval", "token_type": "pending"}

# 2. Login as admin and approve
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@contexweave.com",
    "password": "admin123secure"
  }'
# Response: {"access_token": "eyJ0eXAi...", "token_type": "bearer"}

# 3. Approve the user
curl -X POST http://localhost:8000/api/admin/approve-user/2 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 4. User can now login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Decision Flow

```bash
# 1. Create decision
curl -X POST http://localhost:8000/api/decisions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Migrate to PostgreSQL",
    "description": "Better ACID guarantees"
  }'

# 2. List decisions
curl -X GET http://localhost:8000/api/decisions \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Create event
curl -X POST http://localhost:8000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "decision_id": 1,
    "event_type": "milestone",
    "source": "Meeting",
    "description": "Database migration completed"
  }'
```

---

## 🌳 Development Roadmap

### Phase 1-11 ✅ (Complete)
- User authentication & admin approval
- Decision CRUD operations
- Event tracking
- Analytics dashboard
- Protected routes & user isolation

### Phase 12 🔄 (Current: Frontend Auth)
- Frontend login/signup pages
- Auth context & token management
- Protected routes
- Admin panel

### Phase 13-15 🎯 (Coming Next)
- Comprehensive testing
- Deployment setup
- Performance optimization
- Production launch

---

## 📝 Environment Variables

Create `.env` file:

```env
# Database
DATABASE_URL=postgresql://contexweave:contexweave@db:5432/contexweave

# Redis
REDIS_URL=redis://redis:6379

# JWT
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60

# Admin Setup
ADMIN_PASSWORD=admin123secure

# Environment
ENVIRONMENT=development
DEBUG=True
```

---

## 🚀 Docker Compose Setup

**docker-compose.yml** automatically:
- ✅ Creates PostgreSQL database
- ✅ Starts Redis cache
- ✅ Builds & runs backend
- ✅ Builds & runs frontend
- ✅ Initializes database tables
- ✅ Creates admin user

No manual setup required!

---

## 🔧 Local Development

### Backend Only

```bash
cd backend
pip install -r requirements.txt
python -m core.init_db              # Initialize DB
uvicorn main:app --reload            # Start server
```

### Frontend Only

```bash
cd frontend
npm install
npm run dev                            # Start dev server
```

### With Docker

```bash
docker-compose up -d                 # Start all services
docker-compose logs -f backend       # Watch backend logs
docker-compose down                  # Stop all services
```

---

## 📞 Support

- **Documentation:** `/docs` folder
- **Issues:** GitHub Issues
- **Email:** contact@contexweave.com

---

## 🎓 Key Learnings

This project demonstrates:
- ✅ Full-stack authentication (JWT + Bcrypt)
- ✅ Role-based access control (admin approval)
- ✅ API design best practices (protected routes, user isolation)
- ✅ Database relationships (user → decisions → events)
- ✅ Real-time data (WebSocket ready)
- ✅ DevOps automation (Docker auto-init)
- ✅ Frontend-backend integration
- ✅ Enterprise patterns (user management, audit trails)

---

## 📈 Performance

Current targets:
- API response: **<500ms p95**
- Dashboard load: **<3s**
- WebSocket delivery: **<2s**
- Concurrent users: **1,000+**

---

## 📌 Status

- **Version:** 0.4.0
- **Phase:** MVP Development
- **Last Updated:** November 2025
- **Next:** Phase 13 Testing & Phase 14 Deployment

---

**Built with ❤️ to help teams make better decisions together.**

[⭐ Star this repo](#) • [👀 Watch for updates](#) • [💬 Discuss](#) • [📧 Contact us](mailto:contact@contexweave.com)
