# ERP System — Claude Code Guide

## Project Overview

Full-featured multi-tenant ERP built with **Laravel 13 + Inertia.js v2 + React 19 + TypeScript + Tailwind CSS v3**.

The ERP application lives entirely under `erp/`. The repo root contains a legacy React Create App project — ignore it for ERP work.

## Quick Start

```bash
cd erp
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
# In another terminal:
php artisan serve
```

## Architecture

### Stack

- **Backend**: Laravel 13, PHP 8.3, SQLite (dev/test), MySQL (prod)
- **Frontend**: Inertia.js v2, React 19, TypeScript, Tailwind CSS v3
- **Auth**: Laravel Sanctum (API tokens) + Spatie Roles/Permissions
- **Queue**: Database queue (`QUEUE_CONNECTION=database`)
- **WebSockets**: Laravel Reverb + Laravel Echo
- **PDF**: barryvdh/laravel-dompdf
- **Excel**: maatwebsite/excel v3.1
- **Testing**: Pest v3

### Module Structure (35 modules)

All modules live under `app/Modules/{Name}/`:

```
app/Modules/
├── Core/           # Tenant model, BelongsToTenant trait
├── Finance/        # Invoices, Bills, Contacts, Chart of Accounts
├── Inventory/      # Products, Warehouses, Stock Movements, Transfers
├── HR/             # Employees, Leave, Payroll
├── CRM/            # Leads, Opportunities, Activities
├── PM/             # Projects, Tasks, Milestones
├── Purchase/       # Purchase Orders, RFQs, Vendors
├── Accounting/     # Journal Entries, General Ledger
├── Manufacturing/  # BOMs, Work Orders, Quality
├── Maintenance/    # Assets, Work Orders
├── Subscriptions/  # Plans, Subscriptions
├── LiveChat/       # Channels, Sessions, Messages
├── Discuss/        # Channels, Messages
├── HelpDesk/       # Tickets, SLAs
├── KnowledgeBase/  # Articles
├── Survey/         # Surveys, Questions, Responses
├── Timesheets/     # Entries
├── Expenses/       # Claims
├── Fleet/          # Vehicles, Trips
├── Recruitment/    # Job Postings, Applications
├── Training/       # Programs, Enrollments
├── Events/         # Events, Registrations
├── Subcontracting/ # Contracts
├── FieldService/   # Work Orders
├── Rental/         # Items, Bookings
├── POS/            # Sessions, Orders
└── ...
```

### Multi-Tenancy Pattern

Every module model uses the `BelongsToTenant` trait (`app/Traits/BelongsToTenant.php`):

- Global scope auto-filters by `tenant_id`
- Observer auto-sets `tenant_id` on create
- Always call `app()->instance('tenant', $tenant)` in tests to set the active tenant

### API Structure

All REST endpoints at `/api/v1/*`. Base controller: `app/Http/Controllers/Api/V1/ApiController.php`.

- `success($data)` — 200 with `{data: ...}`
- `error($msg, $code)` — error response
- `paginated($paginator)` — paginated response

Auth: Bearer token via `withToken($token)` in tests.

### Tenant Detection in Controllers

```php
$tenantId = app()->has('tenant') ? app('tenant')->id : $request->user()->tenant_id;
```

### Broadcasting (WebSockets)

Events in `app/Events/` implement `ShouldBroadcast`. Channels in `routes/channels.php`.

- Live Chat: `private-chat-session.{id}` → `.NewChatMessage`
- Discuss: `private-discuss-channel.{id}` → `.NewDiscussMessage`
- Notifications: `private-tenant.{id}` → `.ErpNotification`

Frontend hook: `useEchoPrivateChannel(channelName, event, handler)` in `resources/js/Hooks/useEchoChannel.ts`.

### Key Conventions

- Migrations always start with `Schema::dropIfExists('table')` before `Schema::create`
- Event auto-discovery: Laravel 13 discovers listeners automatically — no manual EventServiceProvider needed
- Use `broadcast(new Event())->toOthers()` to exclude the sender from WebSocket events
- Rate limiting: 60 req/min on `/api/v1/*`, 10 req/min on auth endpoints
- Audit logging: `LogsActivity` trait auto-logs created/updated/deleted on key models
- Security headers: `SecurityHeaders` middleware appended globally

## Testing

```bash
cd erp
php artisan test                          # Run all tests
php artisan test --filter "FinanceTest"   # Filter by name
php artisan test tests/Feature/Finance/   # Run a directory
```

All tests use SQLite in-memory (`DB_CONNECTION=sqlite DB_DATABASE=:memory:`). `tests/Pest.php` applies `RefreshDatabase` globally.

Test pattern:

```php
beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
    $this->tenant = Tenant::create(['name' => 'Test Co', 'slug' => 'test-co']);
    $this->user   = User::factory()->create(['tenant_id' => $this->tenant->id]);
    $this->user->assignRole('super-admin');
    $this->token  = $this->user->createToken('test')->plainTextToken;
    app()->instance('tenant', $this->tenant);
});
```

## Development Phases Completed

| Phase | Description                                                       | Status |
| ----- | ----------------------------------------------------------------- | ------ |
| 1–8   | Core modules, models, migrations, seeders, Inertia pages          | ✅     |
| 9     | REST API — 200+ endpoints across 40 modules                       | ✅     |
| 10    | Demo data seeders for all 35 modules                              | ✅     |
| 11    | WebSockets — Laravel Reverb + Echo                                | ✅     |
| 12    | Queue jobs — invoice, low stock, payroll, bulk import             | ✅     |
| 13    | Mail notifications — invoice, low stock, payroll, approval        | ✅     |
| 14    | PDF generation — invoices, purchase orders, payslips              | ✅     |
| 15    | Import/Export — CSV/XLSX for products, contacts, invoices         | ✅     |
| 16    | Dashboard analytics — module stats + activity feed                | ✅     |
| 17    | Tenant isolation tests — 22 cross-tenant security tests           | ✅     |
| 18    | API rate limiting (60/min) + security headers                     | ✅     |
| 19    | Global search — 7 modules, frontend component                     | ✅     |
| 20    | Audit log — migration, trait, observer, API endpoint              | ✅     |
| 21    | GitHub Actions CI/CD — PHP tests + TS check + ESLint              | ✅     |
| 22    | Reports API — financial/inventory/HR + CLAUDE.md                  | ✅     |
| 23    | In-app notifications — DB model, API, frontend bell               | ✅     |
| 24    | Scheduled Report Delivery — ReportSchedule model + job + mail     | ✅     |
| 25    | Health Checks & Metrics — /api/v1/health + /api/v1/metrics        | ✅     |
| 26    | Dashboard Widgets — per-user customizable widget layout           | ✅     |
| 27    | Email Template Management — CRUD + variable preview               | ✅     |
| 28    | Tenant Feature Flags — per-tenant feature toggle system           | ✅     |
| 29    | User Preferences — timezone, locale, UI density, etc.             | ✅     |
| 30    | Activity Feed API — filterable event stream from audit logs       | ✅     |
| 31    | Unified Calendar API — tasks, leaves, events, invoices            | ✅     |
| 32    | Financial Forecasting — revenue + cash-flow projections           | ✅     |
| 33    | Smart Alert Rules — threshold monitoring + notifications          | ✅     |
| 34    | Budget Management REST API — CRUD + activate + variance           | ✅     |
| 35    | Customer Credit Limits — per-contact limits, hold, check API      | ✅     |
| 36    | Product Variants REST API — attributes, variants, matrix view     | ✅     |
| 37    | Webhook Management REST API — CRUD, delivery log, ping, HMAC      | ✅     |
| 38    | API Token Management — named tokens with abilities and expiry     | ✅     |
| 39    | Inventory Reorder Suggestions — deficit calc + urgency levels     | ✅     |
| 40    | HR Leave Balance API — allocation, team view, year filters        | ✅     |
| 41    | CRM Pipeline Analytics — funnel, win rate, velocity, leaderboard  | ✅     |
| 42    | Project Time Tracking API — log hours, project summaries by user  | ✅     |
| 43    | Expense Claim Workflow API — submit, approve, reject, paid states | ✅     |

## File Locations Reference

| Concern               | Path                                    |
| --------------------- | --------------------------------------- |
| Module models         | `app/Modules/{Name}/Models/`            |
| API controllers       | `app/Http/Controllers/Api/V1/`          |
| Inertia pages         | `resources/js/Pages/`                   |
| Shared components     | `resources/js/Components/`              |
| Layouts               | `resources/js/Layouts/AppLayout.tsx`    |
| Routes (web)          | `routes/web.php`                        |
| Routes (api)          | `routes/api.php`                        |
| Broadcasting channels | `routes/channels.php`                   |
| Migrations            | `database/migrations/`                  |
| Seeders               | `database/seeders/`                     |
| Jobs                  | `app/Jobs/`                             |
| Mail                  | `app/Mail/` + `resources/views/emails/` |
| Events                | `app/Events/`                           |
| Traits                | `app/Traits/`                           |
| Services              | `app/Services/`                         |
| Tests                 | `tests/Feature/`                        |
