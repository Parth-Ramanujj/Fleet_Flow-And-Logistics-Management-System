# FleetFlow: MVP → Production Implementation Plan
## Stack: React + Vite + Tailwind CSS v3 + Supabase

---

## 📊 Current State Analysis

### What Exists (MVP)
| Area | Status | Issues |
|---|---|---|
| React + Vite + Tailwind | ✅ Set up | Tailwind brand colors incomplete (only 4 shades: 50/100/500/900) |
| Routing (react-router-dom v7) | ✅ Working | No auth guard — any URL accessible without login |
| Layout + Sidebar | ✅ Working | No mobile hamburger menu; sidebar hidden on mobile |
| Login page | ✅ UI only | No real auth — just `navigate('/')` on submit |
| Dashboard | ✅ UI only | 100% hardcoded mock data |
| Vehicles registry | ✅ UI only | 100% hardcoded; no modal for Add/Edit; no retire toggle |
| Drivers page | ✅ UI only | 100% hardcoded; no Add/Edit modal |
| Trip Dispatcher | ✅ UI only | Local state only; vehicle capacity check is client-only |
| Maintenance Logs | ✅ UI only | Hardcoded table; form does nothing |
| Fuel/Expense Logs | ✅ UI only | Hardcoded table; form does nothing |
| Analytics | ✅ UI only | Hardcoded numbers; no charts |
| Global error/loading states | ❌ Missing | No skeletons, no toast notifications |
| RBAC | ❌ Missing | All users see all pages |
| Backend / DB | ❌ Missing | No Supabase, no data persistence |

---

## 🎯 Production Goals

1. **Real auth** via Supabase Auth with email/password + RBAC (Manager vs Dispatcher)
2. **Real database** — all pages read/write/delete from Supabase tables
3. **Real-time updates** — vehicle/driver status changes propagate live
4. **Business logic enforced** — cargo weight check, license validity, "In Shop" hides vehicle
5. **Professional UI/UX** — polished design system, toasts, skeletons, modals, responsive
6. **Analytics with charts** — recharts library for real visual reports

---

## 🗄️ Phase 1: Supabase Database Schema

### Tables to Create

#### `profiles` (extends Supabase auth.users)
```sql
id          uuid references auth.users primary key
full_name   text not null
role        text check (role in ('manager','dispatcher')) default 'dispatcher'
avatar_url  text
created_at  timestamptz default now()
```

#### `vehicles`
```sql
id           uuid primary key default gen_random_uuid()
name         text not null          -- "Ford Transit"
model        text                   -- optional sub-model
type         text check (type in ('Truck','Van','Bike')) not null
plate        text unique not null   -- "VAN-0921"
capacity_kg  numeric not null       -- max load in kg
odometer_km  numeric default 0
status       text check (status in ('available','on_trip','in_shop','retired')) default 'available'
roi_cost     numeric default 0
created_at   timestamptz default now()
```

#### `drivers`
```sql
id             uuid primary key default gen_random_uuid()
full_name      text not null
license_expiry date not null
license_type   text check (license_type in ('Truck','Van','Bike')) default 'Van'
duty_status    text check (duty_status in ('on_duty','off_duty','suspended')) default 'off_duty'
status         text check (status in ('available','on_trip')) default 'available'
safety_score   numeric default 100 check (safety_score >= 0 and safety_score <= 100)
phone          text
created_at     timestamptz default now()
```

#### `trips`
```sql
id              uuid primary key default gen_random_uuid()
ref_id          text unique not null    -- "TRP-0042" (auto-generated trigger)
vehicle_id      uuid references vehicles(id)
driver_id       uuid references drivers(id)
origin          text not null
destination     text not null
cargo_weight_kg numeric not null
status          text check (status in ('draft','dispatched','completed','cancelled')) default 'draft'
odometer_start  numeric
odometer_end    numeric
notes           text
created_by      uuid references auth.users(id)
created_at      timestamptz default now()
completed_at    timestamptz
```

#### `maintenance_logs`
```sql
id           uuid primary key default gen_random_uuid()
vehicle_id   uuid references vehicles(id) not null
date         date not null default current_date
description  text not null
cost         numeric not null default 0
status       text check (status in ('in_progress','completed')) default 'in_progress'
logged_by    uuid references auth.users(id)
created_at   timestamptz default now()
```

#### `fuel_logs`
```sql
id         uuid primary key default gen_random_uuid()
vehicle_id uuid references vehicles(id) not null
date       date not null default current_date
liters     numeric not null
cost       numeric not null
trip_id    uuid references trips(id)  -- optional link to a trip
logged_by  uuid references auth.users(id)
created_at timestamptz default now()
```

### Database Business Logic (Supabase Functions / Triggers)

1. **Trip ref_id generator**: Trigger on `trips` INSERT → sets `ref_id = 'TRP-' || LPAD(nextval('trip_seq')::text, 4, '0')`
2. **Dispatch trigger**: On `trips` UPDATE (status → 'dispatched') → set `vehicles.status = 'on_trip'`, `drivers.status = 'on_trip'`
3. **Completion trigger**: On `trips` UPDATE (status → 'completed') → set both entities back to 'available', update `odometer_end`
4. **Maintenance trigger**: On `maintenance_logs` INSERT (status = 'in_progress') → set `vehicles.status = 'in_shop'`
5. **Maintenance completion**: On `maintenance_logs` UPDATE (status → 'completed') → set `vehicles.status = 'available'`

### Row Level Security (RLS) Policies
- `profiles`: users can only read/update their own row
- `vehicles`, `drivers`, `trips`, `maintenance_logs`, `fuel_logs`: authenticated users can SELECT all; INSERT/UPDATE/DELETE requires role = 'manager' OR (role = 'dispatcher' for specific tables)

---

## 🎨 Phase 2: Design System Upgrade

### Color Palette (Extended brand tokens)
```js
// tailwind.config.js — complete brand color scale
brand: {
  50: '#f0f9ff',   100: '#e0f2fe',  200: '#bae6fd',
  300: '#7dd3fc',  400: '#38bdf8',  500: '#0ea5e9',
  600: '#0284c7',  700: '#0369a1',  800: '#075985',
  900: '#0c4a6e',  950: '#082f49',
}
```

### Typography (Google Fonts via index.html)
- **Inter** for UI text (already configured in Tailwind)
- Add `font-display: swap` for performance

### New CSS Utilities to Add to `index.css`
```css
.glass-panel-dark  /* dark glassmorphism for dashboard widgets */
.data-table        /* standardized table styling */
.form-input        /* standardized form input styling */
.btn-primary       /* gradient primary button */
.btn-secondary     /* ghost secondary button */
.btn-danger        /* red destructive button */
.skeleton          /* loading skeleton base animation */
.status-badge      /* enhanced status pills with dot indicator */
.sidebar-link      /* enhanced sidebar nav link */
```

### New Assets / Layout Features
- **Logo**: SVG truck icon inline in Sidebar + Login
- **Dark Sidebar Variant**: Change sidebar to dark navy (`#0f172a`) for premium feel
- **Topbar**: Add notification bell icon + real user avatar from `profiles` table
- **Mobile**: Sliding hamburger drawer sidebar for `< md` screens
- **Page transitions**: Keep framer-motion fade (already there, just refine)

---

## 🔌 Phase 3: Supabase Integration Architecture

### File Structure to Create
```
src/
├── lib/
│   └── supabase.js          ← Supabase client initialization
├── contexts/
│   ├── AuthContext.jsx      ← Auth state, login, logout, user profile + role
│   └── ToastContext.jsx     ← Global toast notification system
├── hooks/
│   ├── useVehicles.js       ← Custom hook: fetch, add, update, delete vehicles
│   ├── useDrivers.js        ← Custom hook for drivers
│   ├── useTrips.js          ← Custom hook for trips (with real-time sub)
│   ├── useMaintenance.js    ← Custom hook for maintenance logs
│   └── useFuel.js           ← Custom hook for fuel logs
├── components/
│   ├── Sidebar.jsx          ← Upgraded with dark theme + mobile drawer
│   ├── Modal.jsx            ← Generic reusable modal wrapper
│   ├── Skeleton.jsx         ← Loading skeleton components
│   ├── Toast.jsx            ← Toast notification component
│   ├── StatusBadge.jsx      ← Unified status pill with dot
│   ├── ConfirmDialog.jsx    ← Delete confirmation dialog
│   ├── EmptyState.jsx       ← Empty table/list state component
│   └── PageHeader.jsx       ← Consistent page title + action bar
├── pages/
│   ├── Login.jsx            ← Real Supabase auth
│   ├── Dashboard.jsx        ← Real KPI queries + alerts
│   ├── Vehicles.jsx         ← Full CRUD + modals + real-time
│   ├── Drivers.jsx          ← Full CRUD + modals + real-time
│   ├── Dispatcher.jsx       ← Full workflow + validation
│   ├── Maintenance.jsx      ← Full CRUD + vehicle status trigger
│   ├── Fuel.jsx             ← Full CRUD
│   └── Analytics.jsx        ← Real charts with recharts
└── layouts/
    └── Layout.jsx           ← Updated with real user profile, mobile
```

### Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🔐 Phase 4: Authentication & RBAC

### `AuthContext.jsx`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signOut()`
- On session, also fetch `profiles` table for `role`, `full_name`
- Expose: `{ user, profile, role, loading, login, logout }`

### `ProtectedRoute.jsx`
```jsx
// Wraps routes — redirects to /login if no session
// Optionally takes `requiredRole` prop for manager-only pages
```

### Login Flow
1. User enters email + password
2. Supabase Auth validates → returns session
3. Fetch `profiles` row → store role
4. Redirect to `/` (Dashboard)
5. All other pages check session via `useAuth()`

### RBAC Rules
| Page | Manager | Dispatcher |
|---|---|---|
| Dashboard | ✅ Full access | ✅ Read only |
| Vehicles | ✅ CRUD + Retire | 👁️ View only |
| Drivers | ✅ CRUD + Suspend | 👁️ View only |
| Trip Dispatcher | ✅ All actions | ✅ Create + Dispatch |
| Maintenance | ✅ CRUD | 👁️ View only |
| Fuel Logs | ✅ CRUD | ✅ Log fuel |
| Analytics | ✅ Full + Export | 👁️ View only |

---

## 🚗 Phase 5: Page-by-Page Production Upgrade

### 5.1 Dashboard (Command Center)
**Changes:**
- KPI cards pull live counts via Supabase: `SELECT count(*) FROM vehicles WHERE status='on_trip'`, etc.
- Fleet Utilization % = (on_trip + in_shop) / total * 100 (calculated client-side)
- Health Alerts section reads:
  - Drivers where `license_expiry < now() + interval '7 days'`
  - Vehicles where `status = 'in_shop'`
  - Trips in `dispatched` status for > 24 hours
- Add a real-time subscription on `vehicles` → KPIs update when dispatch happens

### 5.2 Vehicle Registry
**Changes:**
- Table driven by `useVehicles()` hook → real Supabase data
- **Add Vehicle Modal**: form with all fields → `INSERT INTO vehicles`
- **Edit Vehicle**: click row → pre-fills modal → `UPDATE`
- **Retire Toggle**: button changes status to 'retired' → confirms with `ConfirmDialog`
- **In-Shop indicator**: retired/in_shop rows get subtle row striping
- Status badge shows live pill with animated dot for `on_trip`

### 5.3 Driver Profiles
**Changes:**
- Cards driven by `useDrivers()` hook
- **Add Driver Modal**: name, phone, license_expiry, license_type
- **License Warning**: auto-computed — red if expired, amber if < 30 days
- **Suspend/Activate**: toggle button on card (manager only)
- Safety score progress bar animates on mount

### 5.4 Trip Dispatcher
**Changes:**
- Vehicle select: pulls only vehicles with `status = 'available'`
- Driver select: pulls only drivers with `duty_status = 'on_duty'` AND `status = 'available'` AND `license_expiry > now()`
- **Cargo validation**: client-side weight check + server-side via RLS constraint
- **Create Draft**: INSERT trip with status='draft' → toast success
- **Dispatch Now**: UPDATE trip status → 'dispatched' → trigger fires (vehicle + driver → 'on_trip')
- **Mark Completed**: UPDATE status → 'completed' + prompt for final odometer reading
- Timeline table: live real-time subscription → `supabase.channel('trips').on()`
- Route fields (origin, destination) added to form

### 5.5 Maintenance Logs
**Changes:**
- Form submits to Supabase: vehicle_id, description, cost, status, date
- **Auto-logic**: if status = 'in_progress' → vehicle becomes 'in_shop' (via DB trigger)
- Log table: sortable by date, filterable by vehicle
- Completion button on in_progress rows → UPDATE to 'completed' → vehicle returns to 'available'
- Cost summary card: total maintenance spend last 30 days

### 5.6 Fuel & Expense Logs
**Changes:**
- Form: vehicle_id, date, liters, cost → INSERT
- Auto-calculate km/L: if vehicle linked to a recent trip
- Cost widget: live SUM from Supabase query
- Table: sortable, vehicle filter
- Add optional trip_id linking (dropdown of recent completed trips)

### 5.7 Analytics & Reports
**Changes:**
- Install `recharts` library
- **Fleet Utilization Bar Chart**: vehicle status distribution (available/on_trip/in_shop) last 30 days
- **Fuel Spend Line Chart**: weekly fuel cost trend
- **Maintenance Cost Bar Chart**: cost per vehicle
- **Top Drivers Table**: sorted by safety_score DESC  
- **Cost-per-KM Widget**: total fuel + maintenance / total km traveled
- Export CSV: `json-to-csv` conversion of query results

---

## ✨ Phase 6: UI/UX Polish

### Loading States
- All data tables show `<Skeleton />` rows while fetching
- Dashboard KPI cards show pulsing skeleton while counting
- Submit buttons show spinner + disabled state on async operations

### Toast Notifications
- Success: green toast on CRUD operations ("Vehicle added successfully!")
- Error: red toast on failures (Supabase error messages)
- Warning: amber toast for validation failures
- Auto-dismiss after 4 seconds

### Modals
- Generic `<Modal>` component with backdrop blur
- Accessible (focus trap, ESC to close, aria-modal)
- Smooth open/close animation via framer-motion

### Responsive Layout
- Sidebar: visible on `md+`, hidden on mobile with hamburger toggle
- Mobile: stack all columns (Dispatcher form → full width, then timeline)
- Tables: horizontal scroll on mobile, key columns pinned

### Empty States
- Custom illustrated empty state when no data exists (e.g., no vehicles yet)
- Directs user to add first record via CTA button

---

## 📦 Phase 7: New Dependencies to Install

```bash
npm install @supabase/supabase-js recharts react-hot-toast date-fns
```

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client for auth + DB |
| `recharts` | Chart library for Analytics page |
| `react-hot-toast` | Elegant toast notifications |
| `date-fns` | Date formatting + license expiry calculations |

---

## 🗓️ Execution Order & Priority

| Phase | Work | Priority |
|---|---|---|
| 1 | Install deps + Supabase client setup + `.env` | 🔴 Critical |
| 2 | Design system upgrade (colors, CSS utilities, fonts) | 🔴 Critical |
| 3 | AuthContext + Login with real Supabase auth | 🔴 Critical |
| 4 | ProtectedRoute + RBAC layout | 🔴 Critical |
| 5 | Shared components (Modal, Toast, Skeleton, StatusBadge) | 🟠 High |
| 6 | Sidebar upgrade (dark theme, mobile drawer) | 🟠 High |
| 7 | Vehicles CRUD → Supabase | 🟠 High |
| 8 | Drivers CRUD → Supabase | 🟠 High |
| 9 | Trip Dispatcher → Supabase + validation | 🟠 High |
| 10 | Maintenance → Supabase | 🟡 Medium |
| 11 | Fuel → Supabase | 🟡 Medium |
| 12 | Dashboard → real KPI queries | 🟡 Medium |
| 13 | Analytics → recharts | 🟡 Medium |
| 14 | Polish: skeletons, error boundaries, mobile test | 🟢 Low |

---

## ⚡ Quick Wins (Can Do Immediately Without Supabase)

1. **Fix Tailwind brand color scale** — Add 600/700/800 shades (needed for hover states)
2. **Dark sidebar** — Change sidebar from white to dark navy
3. **Extend brand colors** in `tailwind.config.js`
4. **Add mobile hamburger menu** to Layout
5. **Convert mock data** to `useState` arrays so CRUD UI works before Supabase is wired

---

*This plan converts the FleetFlow MVP into a production-grade logistics management system with real-time data, authentication, RBAC, and professional UX patterns.*
