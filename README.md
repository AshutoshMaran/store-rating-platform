# StorePulse — FullStack Store Rating Platform

A full-stack web application that allows users to discover, evaluate, and submit ratings for registered stores. Built with role-based access control for **System Administrators**, **Normal Users**, and **Store Owners**, featuring secure HTTP-only cookie authentication and automatic token refresh.

---

## 🛠️ Tech Stack

* **Frontend**: React (v19), Vite, Tailwind CSS (v4), React Router (v7), React Hook Form, Axios, Lucide React
* **Backend**: Node.js (ES Modules), Express.js (v5), Prisma ORM (v6), PostgreSQL (`pg`), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser`, `cors`
* **Database**: PostgreSQL

---

## 📁 Repository Structure

```text
store/
├── backend/                  # Express + Prisma + PostgreSQL API
│   ├── prisma/
│   │   ├── schema.prisma     # Database models (User, Store, Rating)
│   │   ├── migrations/       # Prisma migration files
│   │   ├── config.js         # Prisma client instance
│   │   └── seed.js           # Database seed script
│   ├── src/
│   │   ├── app.js            # Express app & middleware configuration
│   │   ├── controllers/      # Route controllers (auth, user, admin, owner)
│   │   ├── middlewares/      # Role-based authorization middlewares
│   │   └── routes/           # Express API routers
│   ├── server.js             # Backend server entry point
│   ├── package.json
│   └── .env
└── frontend/                 # Vite + React + Tailwind CSS client
    ├── src/
    │   ├── api/              # Axios client and modular API functions
    │   ├── components/       # Reusable components (Navbar, Modals, Guards)
    │   ├── context/          # AuthContext (state & session management)
    │   ├── pages/            # Login, Register, User, Admin, Owner dashboards
    │   ├── App.jsx           # Routing & protected routes
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## ⚡ Quick Setup Guide

### 1. Prerequisites

Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (running on port `5432`)
* npm (comes with Node.js)

---

### 2. Database Setup

1. Start your PostgreSQL service.
2. Create the database named `store_rating`:
   ```bash
   # Using psql CLI
   psql -U postgres -c "CREATE DATABASE store_rating;"
   ```

---

### 3. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Configure environment variables in `.env` (create or verify `backend/.env`):
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/store_rating?schema=public"
   PORT=3000
   JWT_SECRET=your_jwt_secret_key_12345
   ```

3. Install backend dependencies:
   ```bash
   npm install
   ```

4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

5. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

6. Seed the database with default accounts and sample stores:
   ```bash
   node prisma/seed.js
   ```

7. Start the backend server:
   ```bash
   npm run dev
   # or
   node server.js
   ```
   *The backend will be running at:* **`http://localhost:3000`**

---

### 4. Frontend Setup

1. Open a new terminal window and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at:* **`http://localhost:5173`**

---

## 🔑 Default Seeded Accounts

The seed script creates initial accounts for testing each role:

| Role | Email | Password | Access / Purpose |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@gmail.com` | `000000` | Full administrative control, user/store management, stats |
| **Store Owner** | `owner@storerating.com` | `000000` | Access to managed stores, review breakdown & average rating |
| **Normal User** | `user@storerating.com` | `000000` | Browse stores, search, and submit/modify 1–5 star ratings |

---

## 🚀 Key Features & Capabilities

### 1. Unified Single Login & Role-Based Routing
* Single entry point at `/login` for all user roles.
* Based on the user's role (`ADMIN`, `USER`, `STORE_OWNER`), the frontend automatically redirects to their respective dashboard.

### 2. System Administrator (`/admin/dashboard`)
* **Live Dashboard Statistics**: Displays Total Users, Total Stores, and Total Submitted Ratings.
* **Store Management**: Add new stores (Name, Email, Address) and assign Store Owners.
* **User Management**: Add new users of any role (Admin, Normal User, Store Owner).
* **Filters & Search**: Real-time filtering by Name, Email, Address, and Role.
* **Sorting**: Column sorting (ascending & descending) on all store and user tables.
* **Store Owner Ratings**: Displays the store's average rating directly on Store Owner rows.

### 3. Normal User (`/user/dashboard`)
* **Registration**: Sign up with strict validation (Name: 20–60 chars, Address: max 400 chars, Password: 8–16 chars with uppercase & special character).
* **Store Directory**: Search stores by Name or Address in real-time.
* **Rating System**: Submit or modify existing ratings (1 to 5 stars) using an interactive star modal.
* **Password Management**: Update account password securely at any time.

### 4. Store Owner (`/owner/dashboard`)
* **Store Performance**: View overall average rating (stars + score) and total review count.
* **Customer Feedback Table**: Detailed list of users who submitted reviews (Customer Name, Email, Rating, Date).
* **Sorting & Filtering**: Sort customer reviews by name, rating, or submission date.

---

## 🔒 Authentication & Token Refresh Flow

The application uses a **Dual-Token Pattern** with secure **HTTP-Only Cookies**:

1. **Access Token**: Valid for **15 minutes** (stored in `userAccessToken`, `adminAccessToken`, or `storeOwnerAccessToken`).
2. **Refresh Token**: Valid for **1 day** (stored in `userRefreshToken`, `adminRefreshToken`, or `storeOwnerRefreshToken`).
3. **Automatic Refresh**:
   * All API requests are routed through `apiClient` (`frontend/src/api/api.client.js`).
   * When an access token expires, an Axios Response Interceptor intercepts the `401 Unauthorized` response.
   * It transparently calls `POST /api/auth/refresh` to obtain a new access token cookie using the HTTP-only refresh token.
   * The original API request is automatically retried without interrupting the user experience.

---

## 📡 API Reference Summary

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new normal user
* `POST /api/auth/login` — Login with credentials (sets HTTP-only cookies)
* `GET /api/auth/me` — Retrieve active session user
* `POST /api/auth/refresh` — Refresh expired access token
* `POST /api/auth/logout` — Clear auth cookies and end session
* `POST /api/auth/update-password` — Update user password

### User Routes (`/api/user`)
* `GET /api/user/get/allStore` — Fetch all stores with overall ratings & user's submitted rating
* `GET /api/user/get/store/:storeId` — Fetch specific store details
* `POST /api/user/rate/store/:storeId` — Submit or update store rating (1 to 5)
* `POST /api/user/reset/password` — Update user password

### Store Owner Routes (`/api/owner`)
* `GET /api/owner/dashboard` — Fetch store owner's managed store, average rating, and user review list

### Administrator Routes (`/api/admin`)
* `GET /api/admin/dashboard/stats` — Total counts of users, stores, and ratings
* `GET /api/admin/get/allUser` — List all users (includes store rating for store owners)
* `GET /api/admin/get/allStore` — List all stores with overall ratings and owners
* `POST /api/admin/add/user` — Add normal user
* `POST /api/admin/add/admin` — Add admin user
* `POST /api/admin/add/storeOwner` — Add store owner
* `POST /api/admin/add/store` — Add new store
* `POST /api/admin/assign/storeOwner/:storeId` — Assign a store owner to a store
