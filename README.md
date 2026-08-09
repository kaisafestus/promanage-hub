# ProManage Hub

# Enterprise Property Management System — Complete Build Prompt

## Overview
Build a stunning, modern, multi-tenant **Property Management System (PMS)** with **four distinct user portals** — **Landlord**, **Tenant**, **Vendor**, and **Admin** — backed by a NestJS 11 API (Prisma + PostgreSQL), a Next.js 16 App Router frontend (React 19 + Material UI 9 + Zustand + Axios), JWT authentication, and single-Vercel deployment. Kenya-focused (KES currency, +254 phone validation, MPESA payments).

## Architecture
- **Monorepo**: pnpm workspaces (`apps/api`, `apps/web`, `packages/*`), Turbo for parallel builds
- **Backend**: NestJS 11 + TypeScript + Prisma ORM + PostgreSQL + Swagger docs
- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + MUI 9 + Zustand + Axios
- **Deployment**: Single Vercel project — `vercel.json` with `@vercel/static-build` (web) + `@vercel/node` (API serverless function), routes `/api/v1/*` → API handler
- **Local dev**: Docker PostgreSQL on localhost:5432, API on port 3001, web on port 3000

## Design System
- **Colors**: Dark navy sidebar (#0d1b4b, #162054, #1a2560), indigo accent (#3b3fd8), cyan active (#00e5ff), success green (#2e7d32), warning orange (#f57c00), error red (#d32f2f)
- **Typography**: Inter/Roboto, h4/h5/h6 bold, body2/caption for labels
- **Brand**: "PropertyMS" logo in sidebar
- **Currency**: KES with `en-KE` locale, 2 decimal places
- **Buttons**: textTransform: 'none', fontWeight: 600, indigo background (#3b3fd8)
- **Cards**: Subtle shadow (0 1px 3px rgba(0,0,0,0.08)), borderRadius: 8
- **Layout**: Desktop permanent sidebar (250px), mobile temporary drawer, fixed TopBar (64px), main content scrolled below
- **All pages**: `'use client'` (Client Components)
- **Phone format**: E.164 (+254712345678)

## Database Schema (Prisma — `prisma/schema.prisma`)

### Enums
UserRole { ADMIN LANDLORD TENANT VENDOR APPLICANT } UserStatus { PENDING ACTIVE SUSPENDED ARCHIVED } OrganizationStatus { ACTIVE SUSPENDED } InvoiceStatus { DRAFT SENT PAID PARTIAL OVERDUE CANCELLED UNCOLLECTIBLE } PaymentStatus { PENDING CONFIRMED PAID PARTIAL FAILED REFUNDED OVERDUE } PaymentMethod { BANK_TRANSFER CREDIT_CARD DEBIT_CARD_M_PESA ACH CASH OTHER } MaintenancePriority { LOW MEDIUM HIGH EMERGENCY } MaintenanceStatus { OPEN ASSIGNED IN_PROGRESS WAITING_PARTS COMPLETED CANCELLED } DocumentCategory { LEASE_AGREEMENT RECEIPT INVOICE CONTRACT MAINTENANCE_RECORD PHOTO OTHER } InvitationStatus { PENDING ACCEPTED EXPIRED REVOKED } NotificationType { SYSTEM MESSAGE PAYMENT MAINTENANCE REMINDER } UnitStatus { AVAILABLE UNDER_APPLICATION RESERVED OCCUPIED NOTICE MAINTENANCE } LeaseStatus { DRAFT ACTIVE EXPIRED TERMINATED }


### Models
- **User**: id(cuid), orgId(FK), email(unique), firstName, lastName, phone?, emailVerified, role(UserRole), status(UserStatus), passwordHash, failedLoginAttempts, lockedUntil, lastLogin, createdAt, updatedAt
- **Organization**: id, name, email?, phone?, website?, logo?, status, automaticPublishing, createdAt, updatedAt → users[], properties[]
- **Property**: id, orgId(FK), name, code(unique-per-org), description?, addressLine1, addressLine2?, city, county, postalCode?, propertyType?, active, createdAt, updatedAt → units[], images[], invoices[], maintenanceRequests[], expenses[]
- **Unit**: id, propertyId(FK), unitNumber, floor?, bedrooms, bathrooms, sizeSqFt?, monthlyRent, securityDeposit, vacant, status(UnitStatus), createdAt, updatedAt → invoices[], maintenanceRequests[]
- **Tenant**: id, userId(unique), propertyId?, unitId?, leaseStartDate?, createdAt, updatedAt — links User + Property + Unit
- **Vendor**: id, userId(unique), companyName, phone?, email?, specialization?, createdAt, updatedAt
- **Invitation**: id, orgId(FK), email, role(UserRole), firstName?, lastName?, phone?, token(unique), status(InvitationStatus), invitedById, acceptedAt?, expiresAt, createdAt, updatedAt
- **Lease**: id, tenantId(FK), propertyId(FK), unitId(FK), startDate, endDate, monthlyRent, securityDeposit, rentDueDay, status(LeaseStatus), createdAt, updatedAt
- **Invoice**: id, invoiceNumber(unique), tenantId(FK), propertyId(FK), unitId(FK), issueDate, dueDate, amount, totalAmount, description, status(InvoiceStatus), createdAt, updatedAt → payments[]
- **Payment**: id, invoiceId(FK), tenantId(FK), propertyId(FK), unitId(FK), amount, method(PaymentMethod), reference?, status(PaymentStatus), notes?, paidAt, createdAt, updatedAt
- **MaintenanceRequest**: id, propertyId(FK), unitId?, tenantId?, vendorId?, title, description, category?, priority, status, scheduledDate?, completedDate?, cost?, notes?, createdAt, updatedAt
- **Expense**: id, propertyId(FK), vendorId?, category, description, amount, date, receipt?, createdAt, updatedAt
- **Document**: id, name, url, category(DocumentCategory), fileType, size, description?, entityId, entityType, uploadedById, createdAt, updatedAt
- **Notification**: id, userId(FK), type(NotificationType), title, message, isRead, data?(Json), createdAt, updatedAt
- **UserSession**: id, userId(FK), token(unique), expiresAt, createdAt
- **AuditLog**: id, userId(FK), action, entity, entityId, metadata?(Json), createdAt
- **PropertyImage**: id, propertyId(FK), url, caption?, isPrimary, createdAt, updatedAt

## Backend API (NestJS 11)

### Core (`src/main.ts`)
- Global prefix `api` + URI versioning `v1` → all routes are `/api/v1/...`
- Global `ValidationPipe` (whitelist, transform, forbidNonWhitelisted)
- CORS from `CORS_ORIGINS` env var (comma-separated list)
- Swagger at `/api/docs` with Bearer JWT auth, persistAuthorization
- `LoggingInterceptor` on all routes
- `HttpExceptionFilter` — returns `{ success: false, statusCode, timestamp, path, message }`
- `@nestjs/throttler`: default 60 req/60s globally, auth endpoints 5/60s
- `APP_GUARD` for `ThrottlerGuard` and `PermissionsGuard`

### Auth (`api/v1/auth/`)
- Guards: `JwtAuthGuard` (passport-jwt from `Authorization: Bearer`), `RolesGuard`, `PermissionsGuard`
- Decorators: `@CurrentUser()`, `@Roles(...)`, `@Permissions(...)`
- `POST /register` — Register landlord: creates Organization + User(_landlord_). Password min 8 chars, must match confirmPassword. Rate limit 3/60s. Returns `{ user, accessToken, refreshToken }`.
- `POST /login` — Email + password. Checks lock: 5 failed attempts → 15-min lockout. Resets on success. Updates `lastLogin`. Rate limit 5/60s.
- `POST /refresh` — Refresh access token (7-day, single-use rotation via UserSession). Rate limit 10/60s.
- `POST /logout` — Requires JWT. Deletes all user sessions.
- `GET /me` — Requires JWT. Returns user + permissions.
- JWT: HS256, access=15min, refresh=random 40-byte hex (stored in DB)
- Passwords: bcrypt 12 rounds

### Users (`api/v1/users/`) — LANDLORD only
- `GET /` — All users in org (from JWT)
- `GET /:id` — Single user (no password)
- `POST /` — Create user with hashed password, role assignment
- `PATCH /:id` — Update user
- `DELETE /:id` — Delete user

### Organizations (`api/v1/organizations/`)
- `GET /current` — Current org details
- `PATCH /current` — LANDLORD only. Update name, email, phone

### Properties (`api/v1/properties/`) — LANDLORD writes, all read
- `GET /` — All properties in org (with units count)
- `GET /:id` — Single property (with units)
- `POST /` — Create property (name, code, address, city, county, postalCode, active)
- `PATCH /:id` — Update
- `DELETE /:id` — Delete
- Validation: code unique per organization

### Units (`api/v1/units/`) — LANDLORD writes, all read
- `GET /` — All units in org (with property)
- `GET /:id` — Single unit (with property)
- `GET /property/:propertyId` — Units by property
- `POST /` — Create (propertyId, unitNumber, floor, bedrooms, bathrooms, sizeSqFt, monthlyRent, securityDeposit, vacant)
- `PATCH /:id` — Update
- `DELETE /:id` — Delete

### Tenants (`api/v1/tenants/`) — LANDLORD writes, all read
- `GET /` — All tenants in org (with user, property, unit)
- `GET /:id` — Single tenant
- `GET /user/:userId` — By user ID
- `POST /` — Create tenant (creates User with role TENANT, password=Password123)
- `PATCH /:id` — Update tenant + linked user info
- `DELETE /:id` — Delete

### Vendors (`api/v1/vendors/`) — LANDLORD writes, all read
- `GET /` — All vendors in org
- `GET /user/:userId` — By user ID
- `GET /:id` — Single vendor
- `POST /` — Create (links to existing user)
- `PATCH /:id` — Update
- `DELETE /:id` — Delete

### Invitations (`api/v1/invitations/`)
- `GET /token/:token` — Public. Validate token, check expiry (7 days), check org status
- `POST /accept` — Public. Accept invitation, create user (password min 8), creates Tenant or Vendor profile based on role
- `POST /` — LANDLORD only. Create invitation (email, role=TENANT|VENDOR, firstName, lastName, phone). 7-day expiry. Reject if user exists or pending invite exists.
- `GET /` — LANDLORD only. List invitations for org
- `POST /:id/revoke` — LANDLORD only. Set status to REVOKED
- `DELETE /:id` — LANDLORD only. Delete invitation

### Maintenance (`api/v1/maintenance/`)
- `GET /` — All in org (with property, unit, tenant, vendor)
- `GET /:id` — Single
- `GET /property/:propertyId` — By property
- `GET /vendor/:vendorId` — By vendor
- `GET /status/:status` — By status
- `POST /` — Create (propertyId, unitId?, tenantId?, vendorId?, title, description, category?, priority, status, scheduledDate?, cost?)
- `PATCH /:id` — Update. If status=COMPLETED, auto-set completedDate
- `DELETE /:id` — Delete
- Validation: property must exist, status transitions valid

### Financial (`api/v1/financial/`)
- **Invoices**:
  - `GET /invoices` — All in org (with tenant, property, unit, payments)
  - `GET /invoices/tenant/:tenantId` — By tenant
  - `GET /invoices/:id` — Single
  - `POST /invoices` — LANDLORD only (tenantId, propertyId, unitId, invoiceNumber, dueDate, amount, description, status=DRAFT) Sets `totalAmount=amount`
  - `PATCH /invoices/:id` — Update
  - `DELETE /invoices/:id` — Delete
- **Payments**:
  - `GET /payments` — All in org
  - `GET /payments/tenant/:tenantId` — By tenant
  - `GET /payments/:id` — Single
  - `POST /payments` — LANDLORD only (invoiceId, tenantId, propertyId, unitId, amount, method, reference?, status, paidAt auto-set if status=PAID). Auto-updates invoice status after payment creation.
  - `PATCH /payments/:id` — Update + auto-update invoice status
  - `DELETE /payments/:id` — Delete + auto-update invoice status
- **Invoice status logic**: totalPaid >= totalAmount → PAID; paid > 0 but < total → PARTIAL; dueDate passed and unpaid → OVERDUE; pending → SENT
- DTO validation: amount > 0, method from enum, status from enum

### Documents (`api/v1/documents/`)
- `GET /` — All in org (with uploader)
- `GET /entity?entityId=X&entityType=Y` — By entity
- `GET /category/:category` — By category
- `GET /:id` — Single
- `POST /` — LANDLORD only (name, url, category, fileType, size, description?, entityId, entityType, uploadedById)
- `PATCH /:id` — Update
- `DELETE /:id` — Delete

### Notifications (`api/v1/notifications/`)
- `GET /` — All in org
- `GET /user/:userId` — By user
- `GET /user/:userId/unread` — Unread only
- `GET /:id` — Single
- `POST /` — Create (userId, title, message, isRead=false)
- `PATCH /:id` — Update title/message/isRead
- `PATCH /:id/read` — Mark as read
- `DELETE /:id` — Delete

### Reports (`api/v1/reports/`)
- `GET /dashboard` — Returns: properties{total, units, occupied, vacancyRate}, tenants{total}, maintenance{open}, financial{totalRevenue, outstandingAmount, collectionRate}
- `GET /financial?startDate=X&endDate=Y` — Period financial report with invoices detail and summary
- `GET /maintenance?startDate=X&endDate=Y` — Period maintenance report with byStatus breakdown and totalCost
- `GET /occupancy` — Per-property occupancy breakdown

### Admin (`api/v1/admin/`)
- `GET /stats` — System-wide stats: total users, properties, tenants, vendors + 5 recent users
- `GET /growth` — User growth by date (aggregates by signup date)
- `GET /health` — System health: status, uptime, timestamp, database status

### Health (`api/v1/health/`)
- `GET /` — Database connectivity check (SELECT 1)

### Tenant Portal (`api/v1/tenant-portal/`)
- `GET /dashboard` — Personalized data: tenant profile, user info, outstanding balance, totalPaidThisYear, maintenance counts (open/inProgress/completed), nextDueInvoice, recentPayments(5), recentNotifications(5), recentDocuments(5), recentMaintenance(5)
- `GET /lease` — Tenant's lease details: tenant profile, lease info derived from latest invoice (startDate, endDate+1yr, monthlyRent, securityDeposit=2×rent, dueDate, status=ACTIVE), property, unit
- `GET /payments` — Tenant's invoices(all with payments) + payments history + totalPaid + outstandingBalance
- `GET /maintenance` — Tenant's maintenance requests + counts (open, inProgress, completed)
- `POST /maintenance` — Create maintenance request (requires active lease, auto-fills property/unit from lease)
- `GET /documents` — Documents linked to tenant/property/unit
- `GET /notices` — All notifications for user
- `GET /messages` — Alias of notices
- `GET /profile` — User profile + tenant profile + unit + property + lease info
- `PATCH /profile` — Update phone only

### Repository Pattern
Every module: `Module → Controller → Service → Repository`
- Repository: Prisma calls, includes relations, handles pagination
- Service: Business logic, error mapping (Prisma P2002→duplicate, P2003→not found), cross-module orchestration
- Controller: Routes, DTO validation, `@Roles()`/`@ApiBearerAuth()` decorators, Swagger docs

## Frontend (Next.js 16 App Router)

### Project Structure
apps/web/ app/ (auth)/ layout.tsx — Centered auth layout login/page.tsx — Login form signup/page.tsx — Landlord registration accept-invitation/page.tsx — Token-validated invitation acceptance (dashboard)/ layout.tsx — Dashboard layout (TopBar + Sidebar + AuthGuard + main) dashboard/page.tsx — Landlord dashboard with stats properties/page.tsx — Properties list + CRUD properties/[id]/page.tsx — Property detail (future) units/page.tsx — Units list units/add/page.tsx — Add unit form tenants/page.tsx — Tenants list + CRUD tenants/add/page.tsx — Add tenant form invitations/page.tsx — Invitations list + invite form invoices/page.tsx — Invoices with filter panel + bulk actions payments/page.tsx — Payments with filter panel + record payment dialog maintenance/page.tsx — Maintenance requests organization/page.tsx — Org settings settings/page.tsx — App settings documents/page.tsx — Document management (tenant)/ layout.tsx — Tenant layout (different sidebar) tenant-dashboard/page.tsx — Tenant home my-lease/page.tsx — Lease details my-payments/page.tsx — Payment history tenant-maintenance/page.tsx — Submit & track maintenance tenant-documents/page.tsx — Available documents tenant-messages/page.tsx — Messages tenant-notices/page.tsx — Notices tenant-profile/page.tsx — Profile view/edit tenant-settings/page.tsx — Settings (vendor)/ layout.tsx — Vendor layout vendor-dashboard/page.tsx — Vendor home vendor-maintenance/page.tsx — Maintenance requests assigned vendor-payments/page.tsx — Payments received layout.tsx — Root layout (ThemeRegistry + globals.css) page.tsx — Role-based redirect components/ Sidebar.tsx — Collapsible dark navy navigation TopBar.tsx — Fixed app bar AuthGuard.tsx — Client-side auth protection ThemeRegistry.tsx — MUI theme lib/ api.ts — Axios instance with interceptors auth-store.ts — Zustand store next.config.js — transpilePackages + turbopak tsconfig.json globals.css


### Landlord Portal Pages (Detailed)

#### Dashboard (`/dashboard`)
- Hero card: navy gradient, "LANDLORD DASHBOARD" title, tagline "Stay on top of your portfolio...", "New property" button → `/properties`, "Review maintenance" button → `/maintenance`
- 4 stat cards (Grid xs=12 sm=6 lg=3): Properties (with unit count subtitle), Tenants (with vacancy rate), Revenue (KES + collection rate), Open Maintenance (with outstanding balance)
- Left (lg=8): Occupancy overview card (progress bar, occupied/vacant/collection rate)
- Right (lg=4): Quick actions card (View properties, Manage tenants, Open invoices, Handle maintenance)
- Left (md=6): Recent activity card (placeholder text list)
- Right (md=6): Financial snapshot card (outstanding balance, open maintenance, occupancy target 95%)
- Full-width: "Landlord priorities" card with 4 colored metric boxes (occupancy rate, rent collected, outstanding balance, open maintenance)

#### Properties (`/properties`)
- Toolbar: "Add Property" button, "Add Unit" button → `/units/add`
- Summary card: 3 columns (Total Properties, Total Units, Total Vacancies) with dividers
- Search field (240px, with SearchIcon)
- Table: Checkbox column, Property Name (clickable link), Number of Units, City, Managers, MPESA Paybill, Water Rate(KES), Options (dropdown: Edit, View units, Add unit, Delete)
- Pagination: 10 per page, prev/next, page indicator
- Add/Edit dialog: Name, Code, Description (multiline), Address, City, County, Postal Code

#### Units (`/units`, `/units/add`)
- Units table: Checkbox, Unit Number, Property (clickable), Bedrooms, Bathrooms, Size, Monthly Rent, Security Deposit, Status badge, Vacant toggle, Options
- Add unit form: Property dropdown (loads units), Unit Number, Floor, Bedrooms, Bathrooms, Size Sq Ft, Monthly Rent, Security Deposit, Vacant checkbox
- Status labels: AVAILABLE (green), RESERVED (orange), OCCUPIED (blue), MAINTENANCE (red)

#### Tenants (`/tenants`, `/tenants/add`)
- Table: Checkbox, Tenant Name (clickable), Email, Phone, Property, Unit, Lease Status, Balance, Actions
- Columns: Name, Email, Phone, Property, Unit, Lease Expiry, Monthly Rent, Balance (red if >0), Last Payment Date, Actions (Edit, Send Message, Delete)
- Status badges: ACTIVE, EXPIRED, TERMINATED
- Add tenant form: First Name, Last Name, Email, Phone, Property dropdown, Unit dropdown, Lease Start, Lease End, Monthly Rent, Security Deposit

#### Invitations (`/invitations`)
- "Invite User" button (primary indigo)
- Filter bar: Status dropdown (All/Pending/Accepted/Expired/Revoked), Search
- Summary card: 4 metrics (Total Invites, Pending, Accepted, Expired/Revoked)
- Table: Checkbox, Email, Role badge, First Name, Last Name, Phone, Invited By, Status chip, Created Date, Accepted Date, Expires Date, Actions (Revoke/Delete/View)
- Invite form: Email, Role (Tenant/Vendor dropdown), First Name, Last Name, Phone, Message template selector
- Status chips: PENDING (yellow), ACCEPTED (green), EXPIRED (orange), REVOKED (red)
- Resend button for pending invitations

#### Invoices (`/invoices`)
- Left sidebar: comprehensive filter panel (240px wide) — Search, Date (from/to), Property dropdown, Invoice Item (rent/water/electricity/other), Invoice Status checkboxes (draft, void, open, partial, paid, uncollectible, credit-note)
- Main: Toolbar with "Add Invoice" button (indigo), "More Options" dropdown (Generate Bulk Invoices, New Bulk Add Invoices, Generate Rent Invoices, Generate Other Recurring Bills Invoices, Generate Penalty Invoices, Generate Custom Penalty Invoices)
- Summary card: Total amount (KES)
- Action bar: "Send Invoices" button, Delete button, Download button
- Table: Checkbox, Date, Invoice ID/Number (short), Tenant, Item (auto-detected from description), Property (Unit), Status chip, Amount (KES, right-aligned), Options dropdown (Edit, Send invoice, Record payment, Download PDF, Delete)
- Add/Edit dialog: Tenant dropdown, Property (auto from tenant), Unit (auto), Invoice Number, Issue Date, Due Date, Amount, Status dropdown, Description

#### Payments (`/payments`)
- Left filter panel: Search, Date range, Amount (min/max), Payment status (confirmed/drafted), Payment source (mpesa/copilot/bank statement/manual), Property filter, "Unassigned payments" section
- Toolbar: "Record Payment" button, "Upload Bank Statement" button
- Summary card: Total amount (KES)
- Action bar: "Send Receipt(s)" button, Delete button, Download button
- Table: Checkbox, Date, Payment ID (short), Tenant, Property (Unit), Status chip (colored: CONFIRMED=green, PAID=green, PENDING=amber, FAILED=red, REFUNDED=blue, DRAFT=gray), Amount (KES), Options dropdown (View details, Send receipt, Edit, Delete)
- Record payment dialog: Invoice selector (unpaid only), Amount, Payment Method dropdown (BANK_TRANSFER, CREDIT_CARD, DEBIT_CARD, M_PESA, ACH, CASH, OTHER), Reference, Notes

#### Maintenance (`/maintenance`)
- Toolbar: "Add Maintenance" button
- Summary card: 2 columns (Open Requests, In Progress Requests) side by side
- Filter panel (240px): Property dropdown, Status checkboxes (open, in progress, closed)
- Table: Short Summary (clickable title link), Property Name, Unit ID/Name, Status, Category (auto-detected), Expense (inline "Create Expense" button), Date, Options dropdown (Edit, Mark in progress, Mark closed, Assign vendor, Delete)
- Add/Edit dialog: Property dropdown, Unit dropdown, Tenant dropdown, Vendor dropdown, Title, Description (multiline), Category dropdown, Priority (LOW/MEDIUM/HIGH/EMERGENCY), Status (OPEN/ASSIGNED/IN_PROGRESS/WAITING_PARTS/COMPLETED/CANCELLED), Cost (KES), Scheduled Date

#### Organization (`/organization`)
- Card: Organization Details — Name, Email, Phone text fields
- Status badge display
- "Save Changes" button

#### Settings (`/settings`)
- General settings card with form fields

#### Documents (`/documents`)
- Document list with category filtering
- Upload functionality

### Tenant Portal Pages (`/tenant/`)
- **Tenant Dashboard**: Welcome card with tenant name, 2-column stats (Outstanding Balance, Lease Status), quick action cards, recent activity list, lease summary card
- **My Lease** (`/tenant/my-lease`): Full lease details card (tenant info, property/unit, lease terms: start/end dates, monthly rent, security deposit, rent due day, lease status), lease history timeline (if applicable), "Pay Rent" button
- **My Payments** (`/tenant/my-payments`): Payment history table (date, invoice number, amount, status, method, balance), summary card (total paid, outstanding balance, next payment due), "Make Payment" button
- **Tenant Maintenance** (`/tenant/tenant-maintenance`): My requests table (title, property/unit, status, priority, created date, last updated, cost if completed), "New Request" button, submit form (title, description, category, priority, attach photo), request detail view
- **Tenant Documents** (`/tenant/tenant-documents`): Documents available to tenant (leases, receipts, notices), filter by category, preview/download
- **Tenant Messages** (`/tenant/tenant-messages`): Conversation list with property manager, send message form
- **Tenant Notices** (`/tenant/tenant-notices`): Notice board (system notices, payment reminders, maintenance updates), read/unread state
- **Tenant Profile** (`/tenant/tenant-profile`): Profile view (name, email, phone, lease info, unit address, emergency contact), edit phone
- **Tenant Settings** (`/tenant/tenant-settings`): Password change, notification preferences, payment method management

### Vendor Portal Pages (`/vendor/`)
- **Vendor Dashboard**: Welcome card with vendor name + company, assigned maintenance requests summary (open, in progress, completed), payments received this month, performance metrics
- **Vendor Maintenance** (`/vendor/vendor-maintenance`): Assigned maintenance requests table (title, property/unit, tenant, status, priority, due date, actions: Update Status, Add Note, Mark Complete), request detail view
- **Vendor Payments** (`/vendor/vendor-payments`): Payments received table (date, amount, invoice, property, status, method), summary card (total received this month, pending payments)

### Admin Portal Pages (`/admin/`)
- **Admin Dashboard**: System overview stats (total users, properties, tenants, vendors, active leases), user growth chart, system health status, recent activity log
- **All Users**: User management table (all users across orgs), filter by role/org, suspend/activate, reset password
- **All Properties**: Properties across all organizations
- **Reports**: System-wide financial report, maintenance report, occupancy report
- **Audit Logs**: Full audit trail with filters (entity, action, date range, user)

### Shared Components & Features

#### `lib/api.ts`
- Axios instance, baseURL = `NEXT_PUBLIC_API_URL`
- Request interceptor: attach `Bearer accessToken` from localStorage (only on browser)
- Response interceptor: on 401, if not retried, call `/auth/refresh` with refreshToken, retry original request. On failure, clear localStorage and redirect to `/login`
- All error messages propagated to UI

#### `lib/auth-store.ts` (Zustand)
- State: `user`, `isAuthenticated`, `isLoading`
- `login(email, password)` → POST `/auth/login`, store tokens, set user
- `register(data)` → POST `/auth/register`, store tokens, set user
- `logout()` → POST `/auth/logout`, clear tokens, set unauthenticated
- `loadUser()` → GET `/auth/me` if token exists, set user or clear

#### `components/Sidebar.tsx`
- Dark navy permanent drawer (md) + temporary (mobile)
- Brand: "PropertyMS" with role indicator
- Collapsible sections (default open: Financials, Property/Unit)
- Role-aware: TENANT sees tenant-specific items, VENDOR sees vendor items, LANDLORD sees all
- Items: Dashboard, Financials (Invoices, Payments, Expenses), Tenants, Property/Unit (Properties, Units, Utilities, Maintenance, Property Grouping), Reports (Statements, Insights), Communication, Settings (General, Backup, Alerts, Account Info, Documents, Custom Message Templates, Team, Billing, MPESA Transactions, Audit Trail)

#### `components/TopBar.tsx`
- Fixed AppBar (light theme, border-bottom)
- Mobile menu button (hidden on md+)
- Notifications icon with badge
- Account avatar with dropdown: Profile, Logout

#### `components/AuthGuard.tsx`
- Client component, wraps protected routes
- On mount: if not authenticated, call `loadUser()`. If still not authenticated after load, redirect to `/login`
- Shows `CircularProgress` spinner while loading

#### `components/ThemeRegistry.tsx`
- MUI v9 theme with indigo primary, purple secondary, default background, Inter/Roboto typography
- CssBaseline
- Button styles: textTransform none, fontWeight 600
- Card styles: subtle shadow

#### Root `layout.tsx`
- ThemeRegistry wrapper, CssBaseline, html/body height 100%

#### Root `page.tsx`
- Role-based redirect: loading spinner → check auth → TENANT → `/tenant/tenant-dashboard`, VENDOR → `/vendor/vendor-dashboard`, LANDLORD/ADMIN → `/dashboard`, unauthenticated → `/login`

### Styling Guidelines (for ALL pages)
- Use MUI Grid 2 (`size` prop), Card, Box, Typography
- Indigo accent (#3b3fd8) for active states and primary buttons
- KES currency: `{value.toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
- Consistent 8px grid spacing (`gap: 2` for section gaps, `gap: 1.5`, `gap: 1`)
- Table size="small", sticky header, hover rows, alternate row striping
- Filter panels: 240px width, light border, collapsible sections
- Action buttons: primary (indigo bg), secondary (outlined border)
- Status chips: colored by status (green=active/paid/confirmed, yellow=pending/draft, red=error/overdue/failed, blue=info/refunded)
- Form dialogs with proper validation, error alerts, success alerts
- Responsive: mobile drawer for sidebar, grid reflows from lg=3 columns to xs=12

## Environment Variables
Backend (.env / .env.example)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/property_management?schema=public" PORT=3000 NODE_ENV=development JWT_ACCESS_SECRET=<64-char-random-hex> JWT_REFRESH_SECRET=<64-char-random-hex> JWT_ACCESS_EXPIRES_IN=15m JWT_REFRESH_EXPIRES_IN=7d CORS_ORIGINS=http://localhost:3000,http://localhost:3001

Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1


## Deployment (Vercel — single project, both frontend + API)
- `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "apps/web/.next" }
    },
    {
      "src": "apps/api/src/vercel.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
Build command: pnpm build (includes prisma generate && turbo run build)
vercel.ts — API serverless entry: bootstraps NestJS app, configures CORS/pipes/guards, exports handler(req, res) for @vercel/node
Root directory in Vercel: repo root (build from root package.json)
Required Vercel Environment Variables: DATABASE_URL (hosted PostgreSQL: Neon/Supabase), JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CORS_ORIGINS (your Vercel domain)
Frontend env: NEXT_PUBLIC_API_URL not needed (API served from same domain via /api/v1 routes)
Development Setup
docker-compose.yml: PostgreSQL 16, port 5432, user postgres/postgres, db property_management
Root package.json: workspaces, turbo, prisma as devDeps
apps/api/package.json: nest CLI, @prisma/client, all NestJS packages
apps/web/package.json: next, react, @mui/material, @mui/icons-material, axios, zustand
apps/api/tsconfig.json: extends packages/typescript-config, NodeNext, experimentalDecorators, emitDecoratorMetadata
apps/web/tsconfig.json: Next.js TypeScript config
turborepo pipeline: build runs prisma generate + nest build + next build in parallel
Quality Requirements
Full TypeScript types, strict mode
Swagger docs on every endpoint with proper descriptions and response types
Input validation on all DTOs with class-validator
Prisma error code mapping to user-friendly HTTP responses
Responsive design: desktop sidebar permanent, mobile temporary drawer
Loading spinners on all async operations
Form validation with real-time error display
Keyboard navigation support
Professional, modern UI matching high-end SaaS design patterns
KES currency formatting throughout
Kenya phone number validation (+E.164 format)
All four portals (Landlord, Tenant, Vendor, Admin) with role-based access control

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/27aa6f42-1c36-4d37-bf2b-90929101a948).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
