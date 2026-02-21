-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Custom Auth)
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  password text not null,
  full_name text not null,
  role text check (role in ('admin', 'manager', 'dispatcher', 'safety', 'finance')) default 'manager',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for users
alter table public.users enable row level security;

-- Policies for users
create policy "Public access to select users"
  on users for select
  using ( true );

create policy "Public access to insert users"
  on users for insert
  with check ( true );

create policy "Public access to update users"
  on users for update
  using ( true );

-- 2. Vehicles Table
create table public.vehicles (
  id uuid default uuid_generate_v4() primary key,
  plate text not null unique,
  name text not null,
  type text not null,
  capacity_kg integer not null,
  status text check (status in ('available', 'on_trip', 'in_shop')) default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.vehicles enable row level security;

create policy "Public access to read vehicles"
  on vehicles for select
  using ( true );

create policy "Public access to insert vehicles"
  on vehicles for insert
  with check ( true );

create policy "Public access to update vehicles"
  on vehicles for update
  using ( true );

-- 3. Drivers Table
create table public.drivers (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  license_type text not null,
  license_expiry date not null,
  phone text,
  safety_score integer check (safety_score between 0 and 100) default 100,
  duty_status text check (duty_status in ('on_duty', 'off_duty')) default 'off_duty',
  status text check (status in ('available', 'on_trip', 'suspended')) default 'available',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.drivers enable row level security;

create policy "Public access to read drivers"
  on drivers for select
  using ( true );

create policy "Public access to insert drivers"
  on drivers for insert
  with check ( true );

create policy "Public access to update drivers"
  on drivers for update
  using ( true );

-- 4. Trips Table
create table public.trips (
  id uuid default uuid_generate_v4() primary key,
  ref_id text not null unique,
  vehicle_id uuid references public.vehicles(id) on delete restrict,
  driver_id uuid references public.drivers(id) on delete restrict,
  origin text not null,
  destination text not null,
  cargo_weight_kg integer not null,
  status text check (status in ('draft', 'dispatched', 'completed', 'cancelled')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.trips enable row level security;

create policy "Public access to read trips"
  on trips for select
  using ( true );

create policy "Public access to insert trips"
  on trips for insert
  with check ( true );

create policy "Public access to update trips"
  on trips for update
  using ( true );

-- 5. Maintenance Logs Table
create table public.maintenance_logs (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  date date not null,
  description text not null,
  cost numeric(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.maintenance_logs enable row level security;

create policy "Public access to read maintenance logs"
  on maintenance_logs for select
  using ( true );

create policy "Public access to insert maintenance logs"
  on maintenance_logs for insert
  with check ( true );

-- 6. Fuel Logs Table
create table public.fuel_logs (
  id uuid default uuid_generate_v4() primary key,
  vehicle_id uuid references public.vehicles(id) on delete cascade,
  date date not null,
  gallons numeric(10, 2) not null,
  cost numeric(10, 2) not null,
  station text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.fuel_logs enable row level security;

create policy "Public access to read fuel logs"
  on fuel_logs for select
  using ( true );

create policy "Public access to insert fuel logs"
  on fuel_logs for insert
  with check ( true );
