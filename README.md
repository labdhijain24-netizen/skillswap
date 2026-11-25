 HEAD
# SkillSwap 🔄

> **Teach what you know. Learn what you want.**  
> A full-stack peer-to-peer skill exchange platform built with React, Node.js/Express, Tailwind CSS, and Supabase PostgreSQL.

---

## 🏛️ Project Architecture & Folder Structure

SkillSwap is architected as a clean, decoupled monorepo separating client concerns from backend API services.

```text
skillswap/
├── backend/                        # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                 # Environment and Database configuration
│   │   │   ├── db.js               # Supabase PostgreSQL client initialization
│   │   │   └── env.js              # Centralized environment variables validation
│   │   ├── controllers/            # HTTP Request handlers (inputs, formatting)
│   │   │   └── healthController.js # Health check & system diagnostics handler
│   │   ├── middleware/             # Express middlewares
│   │   │   └── errorHandler.js     # Centralized error and 404 handler
│   │   ├── routes/                 # Express route definitions
│   │   │   ├── healthRoutes.js     # /api/health routes
│   │   │   └── index.js            # Master API router
│   │   ├── services/               # Core business logic & database queries
│   │   │   └── healthService.js    # System health diagnostics service
│   │   ├── utils/                  # Helper utilities
│   │   │   └── apiResponse.js      # Standard JSON response formatters
│   │   ├── app.js                  # Express application setup (CORS, JSON, routes)
│   │   └── server.js               # HTTP server entry point (port listener)
│   ├── .env                        # Local backend environment variables
│   ├── .env.example                # Example backend environment variables template
│   └── package.json                # Backend dependencies and scripts
│
├── frontend/                       # React 18 + Vite SPA
│   ├── public/                     # Static browser assets
│   ├── src/
│   │   ├── assets/                 # Images, SVGs, static media
│   │   ├── components/             # Reusable UI components
│   │   │   ├── common/             # Navbar, Footer, Buttons, Badges
│   │   │   └── status/             # BackendStatusCard, ArchitectureOverview
│   │   ├── pages/                  # Page-level containers (HomePage, etc.)
│   │   │   └── HomePage.jsx        # Landing & architecture status dashboard
│   │   ├── services/               # Network & external clients
│   │   │   ├── api.js              # Axios instance with base URL & interceptors
│   │   │   ├── healthService.js    # Health check endpoint caller
│   │   │   └── supabaseClient.js   # Supabase client for client-side Auth
│   │   ├── App.jsx                 # Top-level React layout component
│   │   ├── index.css               # Tailwind CSS directives & global styling
│   │   └── main.jsx                # React root hydration entry point
│   ├── index.html                  # HTML entry point with Google Fonts
│   ├── postcss.config.js           # PostCSS configuration for Tailwind
│   ├── tailwind.config.js          # Tailwind CSS theme configuration
│   ├── vite.config.js              # Vite bundler configuration
│   ├── .env                        # Local frontend environment variables
│   ├── .env.example                # Example frontend environment variables template
│   └── package.json                # Frontend dependencies and scripts
│
├── .gitignore                      # Git ignore patterns for Node, Vite, env
├── package.json                    # Root workspace scripts to run both servers
└── README.md                       # Complete documentation & setup instructions
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18 + Vite** | Fast, modern component-based UI with instant Hot Module Replacement (HMR). |
| **Styling** | **Tailwind CSS** | Utility-first CSS framework for clean, responsive design. |
| **Animation & Icons** | **Framer Motion + Lucide React** | Fluid UI transitions and modern icon set. |
| **Backend Framework** | **Node.js + Express.js** | Modular REST API with structured controllers, services, and middlewares. |
| **Database & Auth** | **Supabase (PostgreSQL)** | Relational database with Row-Level Security (RLS) and built-in Authentication. |
| **HTTP Client** | **Axios** | Promised-based HTTP requests with interceptors. |
| **Orchestration** | **Concurrently** | Runs both backend and frontend development servers concurrently in one terminal. |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x, v20.x, or v22+)
- **npm** (v9+ or v10+)

### 1. Install Dependencies
You can install all dependencies for root, backend, and frontend with a single command from the root directory:

```bash
npm run install:all
```

*Or install individually:*
```bash
# Root dependencies
npm install

# Backend dependencies
cd backend && npm install && cd ..

# Frontend dependencies
cd frontend && npm install && cd ..
```

---

### 2. Configure Environment Variables

Both `backend` and `frontend` contain `.env.example` templates and pre-populated default `.env` files for local development.

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Optional: Add your real Supabase credentials when ready
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api

# Optional: Add your real Supabase credentials when ready
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> 💡 **Note**: The app will run out-of-the-box even before you supply Supabase credentials. A non-blocking status indicator will show that Supabase is ready to be configured.

---

### 3. Run the Development Servers

From the root directory, run:

```bash
npm run dev
```

This starts:
- 🛰️ **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- ⚡ **Frontend Client**: [http://localhost:5173](http://localhost:5173)

You can also run them independently in separate terminal tabs if preferred:
```bash
# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend
```

---

## 🔍 Verifying Communication

1. Open your browser and navigate to **[http://localhost:5173](http://localhost:5173)**.
2. The homepage features a live **Backend Communication Status Card**.
3. It performs a real-time request to `http://localhost:5000/api/health`.
4. You will see a green checkmark badge confirming:
   - Status: `online`
   - Real-time server uptime in seconds
   - Environment: `development`
   - Database readiness
5. Clicking the **"Ping Backend"** button triggers fresh communication between React and Express.

---

## 🗺️ Next Systematic Milestones

Now that the architecture and communication pipeline are verified:
- **Phase 2**: Define Supabase PostgreSQL schema (`users`, `skills`, `swap_requests`, `reviews`) and implement user authentication.
- **Phase 3**: Implement Skill Listings (Teach & Learn skills) with search, filter, and intelligent bilateral match algorithms.
- **Phase 4**: Implement Skill Swap requests, acceptance workflows, and interactive messaging / session scheduler.

