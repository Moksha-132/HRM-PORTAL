# Database Section Explanation

## 1) Database Technology Used
- The project backend currently uses PostgreSQL through Sequelize ORM.
- Connection is configured in config/db.js.
- Active connection source:
  - process.env.POSTGRES_URI, or fallback:
  - postgres://postgres:postgres@localhost:5432/hrm_portal

## 2) How Database Connection Is Added
- In server startup, the backend loads environment variables using dotenv.
- Then connectDB() is called from config/db.js.
- connectDB() runs sequelize.authenticate() to verify PostgreSQL connectivity.

## 3) How Tables Are Added/Updated
- All Sequelize models are imported by models/index.js.
- Model relationships (foreign keys and associations) are also defined in models/index.js.
- During server boot, sequelize.sync({ alter: true }) is executed in server.js.
- This means:
  - Existing tables are adjusted to match model structure.
  - Missing tables/columns are created when required.

## 4) Main Data Areas (Models)
- Core/Admin: SuperAdmin, Company, Subscription, Transaction, Settings models, Notification, ChatMessage.
- HR Domain: Department, Employee, Attendance, Leave, Asset, Payroll, Expense, Appreciation, CompanyPolicy, Offboarding, Payslip, Holiday.

## 5) How Initial Data Is Added
- Seeder file: seeder.js
- Seeder flow:
  - Authenticates to database.
  - Runs sequelize.sync({ force: true }).
  - Inserts default records (Super Admin, Manager, Employee, settings, pricing, companies).
- Important behavior:
  - force: true drops existing tables first, then recreates them.

## 6) Optional Manual Sync Script
- sync-db.js imports models and runs sequelize.sync({ alter: true }) to align DB schema with model changes.

## 7) Environment Variables Related To DB
- POSTGRES_URI: Full PostgreSQL connection string.
- NODE_ENV: Runtime mode (development/production), used in app startup behavior and logs.

## 8) Practical Notes
- Frontend calls backend APIs; frontend itself does not connect directly to database.
- Database writes/reads happen through backend controllers and Sequelize models.
