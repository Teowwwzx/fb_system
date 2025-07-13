# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application called "FB System" for managing agents, sub-accounts, games, and commissions. It consists of a React frontend and Node.js/Express backend with PostgreSQL database.

## Architecture

- **Frontend**: React 19 application using Ant Design components, React Router for navigation
- **Backend**: Express.js server with RESTful API endpoints
- **Database**: PostgreSQL 16 with connection pooling
- **Infrastructure**: Docker Compose for local development

## Key Development Commands

### Database Setup
```bash
# Start PostgreSQL database
docker-compose up -d

# Database runs on localhost:5433 (mapped from container port 5432)
```

### Backend Development
```bash
cd backend
npm install
npm start  # Starts server on http://localhost:5001
```

### Frontend Development
```bash
cd frontend
npm install
npm start  # Starts dev server on http://localhost:3000
npm run build  # Production build
npm test  # Run tests
```

## Database Configuration

- **Connection**: PostgreSQL database connection configured via `DATABASE_URL` environment variable
- **Auto-initialization**: Database tables and seed data are automatically created on server startup
- **Default credentials**: 
  - Admin user: `admin` / `password123`
  - Agent users: `agent1`, `agent2` / `password123`

## Code Architecture

### Backend Structure
- **Entry point**: `backend/server.js` - Express server setup and middleware
- **Database**: 
  - `backend/db.js` - PostgreSQL connection pool
  - `backend/db_setup.js` - Table creation and data seeding
- **Routes**: `backend/routes/` - API endpoint definitions organized by feature
- **Controllers**: `backend/controllers/` - Business logic for handling requests

### Frontend Structure
- **Entry point**: `frontend/src/App.js` - Main application with routing
- **Layout**: Uses Ant Design Layout with collapsible sidebar navigation
- **Pages**: `frontend/src/pages/` - Individual page components
- **Authentication**: Protected routes using `ProtectedRoute` component
- **API Proxy**: Development proxy configured in `setupProxy.js` routes `/api` to backend

### Key Features
- **Authentication system** with role-based access (admin, agent_manager, viewer)
- **Agent management** - CRUD operations for agents
- **Sub-account management** - Create and manage sub-accounts
- **Game management** - Manage game configurations and balances
- **Activity logging** - Track user actions and system events
- **Commission tracking** - Calculate and track agent commissions
- **Reporting** - Sales reports and analytics

### API Endpoints
- Authentication: `/api/login`, `/api/register`
- Agents: `/api/agents/*` - Full CRUD for agent management
- Data: `/api/data/*` - Various data endpoints for dashboard

### Database Schema
Key tables: `users`, `roles`, `activity_logs`, `games`, `commissions`, `sub_accounts`
- Users linked to roles for permission management
- Activity logs track all user operations
- Games store configuration and balance data
- Commissions track agent earnings

## Development Notes

- **CORS**: Currently configured to allow all origins (`origin: '*'`) - restrict in production
- **Password hashing**: Uses bcrypt for secure password storage
- **Environment variables**: Database connection configured via `.env` file
- **Auto-seeding**: Database initializes with default admin and test agent accounts
- **Proxy setup**: Frontend development server proxies API calls to backend