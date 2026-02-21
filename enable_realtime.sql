-- Enable Supabase Realtime for all data tables
begin;
  -- Remove the tables from the publication just in case they are already there
  -- to avoid errors, though usually not needed if we check.
  -- A safer way is to just do `alter publication supabase_realtime add table ...`
  -- But if they are already added, it throws an error. We can do it step by step.
commit;

-- First, ensure the publication exists. Supabase creates it by default: `supabase_realtime`
-- We can add the tables to it.
alter publication supabase_realtime add table public.vehicles;
alter publication supabase_realtime add table public.drivers;
alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.maintenance_logs;
alter publication supabase_realtime add table public.fuel_logs;
