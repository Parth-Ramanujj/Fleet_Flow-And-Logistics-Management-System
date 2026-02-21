-- Add missing `trip_id` column to fuel logs
ALTER TABLE public.fuel_logs
ADD COLUMN IF NOT EXISTS trip_id uuid references public.trips(id) on delete set null;
