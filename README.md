
# HRM Portal

HRM Portal is a team-built full-stack Human Resource Management platform with role-based dashboards, chatbot assistance, admin chat support, and notification workflows.

Current implementation note: this project uses PostgreSQL via Sequelize ORM (not MongoDB).

## Team Members

- Frontend: S Mohammad Irfan
- Frontend: Thahaseen G
- Backend: Arun Kumar Naik R
- Database: Lakshmi Moksha B
- Database: K Mohammad Sameer Sohail

## Project Overview

The application provides:

- Public landing page and authentication flow
- Admin, Manager, and Employee dashboards
- Chatbot widget for user assistance
- Admin chat support panel with response editing
- Notification system for chat and system updates
- HR modules such as attendance, leave, payroll, assets, offboarding, and policies

## Live Application Pages

- `/` - Landing page
- `/admin-dashboard` - Admin dashboard (includes Chat Support inbox)
- `/manager-dashboard` - Manager dashboard (chatbot + notifications)
- `/employee-dashboard` - Employee dashboard (chatbot + notifications)

## Tech Stack

- Backend: Node.js, Express.js, Sequelize
- Database: PostgreSQL
- Frontend: ReactJS, HTML, CSS, JavaScript
- Frontend module: React + Vite 
- Authentication: JWT
- AI integration: Groq API

## Repository Structure

- `server.js`: backend entry point and static file hosting
- `controllers/`: API and business logic
- `models/`: Sequelize models and associations
- `routes/`: API route definitions
- `chatbot/`: chatbot UI components
- `admin.js`, `manager.js`, `employee.js`: dashboard client logic
- `HRM-PORTAL/frontend/`: optional React frontend workspace

## Setup

## Prerequisites

- Node.js (LTS recommended)
- PostgreSQL instance

## Environment Variables

Create a `.env` file in project root and configure:

- `JWT_SECRET`
- `NODE_ENV`
- `GROQ_API_KEY` (preferred) or `GROQ_API`
- `PORT`
- `POSTGRES_URI`

Default fallback database URI in code:

`postgres://postgres:postgres@localhost:5432/hrm_portal`

Example PostgreSQL URI format:

`postgres://username:password@host:5432/database_name`

## Install Dependencies

```bash
npm install
```

## Run the Application

```bash
npm start
```

The backend serves the main application and dashboards.

Default server port is `5000` unless `PORT` is provided.

## Optional Seeder

To initialize sample/default data:

```bash
node seeder.js
```

Note: Seeder may reset data depending on sync mode in the script.

## Optional React Frontend

If working with the React frontend module:

```bash
cd HRM-PORTAL/frontend
npm install
npm run dev
```

## API Modules

- Authentication: `/api/v1/auth/*`
- Settings: `/api/v1/settings/*`
- Manager: `/api/v1/manager/*`
- Employee: `/api/v1/employee/*`
- Chat: `/api/chat`, `/api/v1/chat/*`, `/api/admin/*`
- Notifications: `/api/notifications/*`

## Chat and Notification Flow

- Users (public/employee/manager) chat through `/api/chat`
- Admin handles sessions and replies through `/api/v1/chat/*` and `/api/admin/*`
- Notification records are exposed through `/api/notifications/*`
- Employee/manager dashboards display notification badge and popup+sound alerts for unread items

## License

ISC
