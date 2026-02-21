-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked to Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'manager', 'dispatcher')) default 'dispatcher',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update their own profile."
  on profiles for update
  using ( auth.uid() = id );

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

create policy "Authenticated users can read vehicles"
  on vehicles for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert vehicles"
  on vehicles for insert
  to authenticated
  with check ( true );

create policy "Authenticated users can update vehicles"
  on vehicles for update
  to authenticated
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

create policy "Authenticated users can read drivers"
  on drivers for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert drivers"
  on drivers for insert
  to authenticated
  with check ( true );

create policy "Authenticated users can update drivers"
  on drivers for update
  to authenticated
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

create policy "Authenticated users can read trips"
  on trips for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert trips"
  on trips for insert
  to authenticated
  with check ( true );

create policy "Authenticated users can update trips"
  on trips for update
  to authenticated
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

create policy "Authenticated users can read maintenance logs"
  on maintenance_logs for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert maintenance logs"
  on maintenance_logs for insert
  to authenticated
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

create policy "Authenticated users can read fuel logs"
  on fuel_logs for select
  to authenticated
  using ( true );

create policy "Authenticated users can insert fuel logs"
  on fuel_logs for insert
  to authenticated
  with check ( true );

-- Handle automatic profile creation on user signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'manager');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
