# Task Dashboard

A full-stack, secure task management application featuring a beautiful Kanban board and List view toggle functionality.

## Tech Stack

This project is separated into two main directories:

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **HTTP Client:** Axios (with automatic JWT token refresh interceptors)

### Backend
- **Framework:** Node.js with Express
- **Language:** TypeScript
- **Database ORM:** Prisma
- **Database:** PostgreSQL (Neon)
- **Validation:** Zod
- **Authentication:** JSON Web Tokens (JWT) + bcrypt (Secure password hashing)

## Features

- **Authentication:** Secure Register, Login, Logout with short-lived Access Tokens (15m) and long-lived Refresh Tokens (7d).
- **Task Management (CRUD):** Create, Read, Update, Delete, and quickly Toggle statuses.
- **Kanban Board:** Native HTML5 Drag and Drop Kanban Board with optimistic UI rendering.
- **List View:** Grid view organized by chronological order.
- **Organization:** Filter tasks by Status, and Search tasks directly by title.
- **Pagination:** Backend and frontend integrated pagination to load tasks efficiently.

## Local Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- npm or yarn

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd task-dashboard/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://<username>:<password>@<host>/<database>?sslmode=require"
   JWT_ACCESS_SECRET="your-super-secret-access-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   ```
4. Push the Prisma schema to the database to create tables:
   ```bash
   npx prisma db push
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(Server defaults to running on http://localhost:5000)*

### 3. Frontend Setup
1. Open a separate terminal and navigate to the `frontend` folder:
   ```bash
   cd task-dashboard/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**. Enjoy!
