# Business Management System (Next.js + NestJS) — Project Overview

This is a free open source template you can use to initialized a business management system for your business. This is a monorepo project.
A full-stack business management platform for **inventory**, **financial tracking**, **task management (with Trello-style boards)**, **employees**, and **authentication**.

This document is intentionally **high-level**. It explains the **purpose**, **features**, **architecture**, and **how the codebase is organized**—without including schema definitions or code snippets.

---

## 1) Objectives

### What this system solves

Businesses often manage operations using spreadsheets, chat messages, and manual reporting. This system centralizes:

- Inventory tracking
- Financial tracking (expenses, sales, profit)
- Task planning and execution using boards
- Employee management and task assignment
- Reporting and filtering across all data

### High-level goals

- Easy-to-use admin experience (for owners/managers)
- Clear employee workflows (assigned tasks, deadlines, statuses)
- Reliable record-keeping (traceable changes and history where needed)
- Fast filtering and reporting for decision-making

---

## 2) Core Features

### A) Authentication & Access Control

- Secure login (password hashing)
- Role-based access control (RBAC)
  - Typical roles: **Admin**, **Manager**, **Employee**
- Protected routes on both frontend and backend

**Expected behavior**

- Only authorized users can access business data
- Admins can manage configuration (employees, categories, board columns, etc.)
- Employees can see assigned tasks and permitted modules

---

### B) Inventory Management

Inventory consists of two separate concepts:

1. **Product Catalog (“Items Selection”)**

- Master list of all products/items the business can track
- Used as a selection list when adding items to inventory

2. **Inventory Stock List**

- The operational list of what currently exists in inventory
- Contains product info + quantity + pricing value

**Key capabilities**

- Add items to inventory by selecting from the product catalog
- Edit inventory quantities and item pricing
- Auto-removal behavior when quantity hits 0 (or archive if configured)
- Search and filtering (name/SKU/category, date ranges for changes if supported)
- Optional: multi-location inventory (warehouse/store support)

**User experience goal**

- Adding inventory stock should be simple and fast
- Adding a brand-new product should be a separate flow (catalog management)

---

### C) Financial Tracking (Expenses, Sales, Profit)

Track business finances through structured transactions.

**Supported records**

- Expenses (e.g., supplies, rent, payroll)
- Sales / income
- Optional: other income streams

**Key capabilities**

- Filter by:
  - date range
  - category
  - transaction type
  - employee attribution (optional)
  - tags (optional)
- Summary metrics:
  - total expenses
  - total sales/income
  - profit (income - expenses)
- Charting:
  - revenue vs expense over time
  - category breakdown
  - profit trend over time

**UI goal**

- Fast reporting that’s understandable at a glance
- Filters persist per user session (nice-to-have)

---

### D) Task Management (Tasks + Subtasks Board)

Work is organized into:

- **Tasks** (high-level work items)
- **Subtasks** visualized as a Trello-style board

**Task features**

- Title, description
- Due date / end date
- Assign employees
- Status tracking

**Subtask board features**

- Drag & drop cards between columns
- Admins can create, rename, and reorder columns
- Cards contain:
  - title
  - description (optional)
  - due date (optional)
  - assignees (employees)
- Optional enhancements:
  - activity log per card
  - comments
  - attachments (future)

**UX goal**

- Managers can track progress via the board
- Employees can quickly identify what’s assigned and what’s due

---

### E) Employee Management

**Employee directory**

- View employees
- Track position/title and status (active/inactive)
- Used as the source of truth for task assignment

**Usage across the system**

- Assign employees to tasks and subtask cards
- Attribute finance entries to employees (optional)
- Filter tasks by employee

---

## 3) Tech Stack

### Backend

- NestJS
- TypeScript
- MongoDB + Mongoose
- bcrypt (password hashing)
- axios (HTTP client for external calls/integrations)

### Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- React Query (server state, caching, invalidation)
- Drag & drop library for boards (implementation detail in FE)

---

## 4) Architecture & Design Principles

### Multi-tenant by Organization

- Data is scoped per organization/company
- Users only access data belonging to their organization

### Separation of concerns

- Frontend focuses on UX, state, and presentation
- Backend focuses on data integrity, permissions, and business rules

### Consistency & traceability (recommended)

- Track important state changes (e.g., inventory adjustments, finance updates)
- Prefer “history-aware” operations for key modules

### Performance-minded filtering

- Filtering by date/category/etc. should be supported efficiently
- Backend endpoints designed to support chart aggregation and pagination

---

## 5) Backend Codebase Structure (NestJS)

A typical structure used in this project:

- `src/`
  - `auth/` (login, JWT, guards)
  - `users/` (user management related to auth)
  - `orgs/` (organization/company logic)
  - `employees/` (employee CRUD and lookups)
  - `products/` (catalog management)
  - `inventory/` (stock tracking + adjustments)
  - `finance/` (transactions + reporting endpoints)
  - `tasks/` (task CRUD + assignment)
  - `boards/` (columns/cards operations + drag/drop updates)
  - `common/` (shared utils, decorators, interceptors)
  - `config/` (env validation, app config)

**Common backend patterns**

- Controllers: request/response handling
- Services: business logic
- DTOs: validation and data contracts
- Guards: authentication and authorization
- Mongoose schemas/models: persistence layer

---

## 6) Frontend Codebase Structure (Next.js)

A typical structure used in this project:

- `app/` (routes/pages)
  - `login/`
  - `dashboard/`
  - `inventory/`
  - `products/`
  - `finance/`
  - `tasks/`
  - `employees/`
  - `settings/`
- `components/`
  - shared UI components
  - tables, modals, forms
  - board components (columns/cards)
- `features/` (domain-focused UI logic)
  - finance charts + filters
  - inventory flows
  - task/board interactions
- `lib/`
  - API client
  - auth helpers
  - React Query setup (query client, keys)
- `styles/` (Tailwind setup)
- `types/` (shared TS types/interfaces)

**Common frontend patterns**

- React Query for fetching/mutations
- Filter state synced with query params (recommended)
- Component-driven architecture for reuse
- Protected routes and role-based rendering

---

## 7) Key User Flows (End-to-End)

### Inventory

1. Create products in the product catalog (as needed)
2. Add a product into the inventory stock list
3. Update quantities as stock changes
4. Track current stock value and low-stock items (optional)

### Finance

1. Create categories (expense/income/sales)
2. Record transactions with dates and details
3. Filter and view summaries (profit, totals)
4. Use charts for trends and analysis

### Tasks + Board

1. Create a task with due date and description
2. Assign employees
3. Use the board to create subtasks/cards
4. Move cards across columns to reflect progress

### Employees

1. Create/manage employee profiles
2. Assign employees to tasks/cards
3. View employee-related workload (optional)

---

## 8) Recommended Enhancements (Optional, High Value)

These improvements make the project more “production-like” and impressive:

- **Activity/Audit trail** for sensitive operations (inventory and finance)
- **CSV import/export** (inventory items, product catalog, transactions)
- **Notifications** for due dates and low stock
- **Dashboard summary**: key KPIs across inventory, finance, and tasks
- **Soft-delete / archiving** for safer record management
- **Basic analytics**:
  - top-selling items (if sales tracking is expanded)
  - expense trends by category
  - employee workload distribution

---

## 9) Documentation Expectations

This repo should ideally include:

- Setup instructions (env vars, running FE/BE)
- Contribution guidelines
- Folder structure explanation
- Screenshot/GIF walkthrough of major flows
- API documentation (Swagger recommended for BE)

---

## 10) Non-Goals (for MVP)

To keep scope manageable, MVP can exclude:

- Payroll
- Full accounting features (invoicing, tax, COGS)
- Advanced inventory forecasting
- Complex approval workflows
- External integrations (QuickBooks, Shopify, etc.)

These can be added later once core flows are stable.
