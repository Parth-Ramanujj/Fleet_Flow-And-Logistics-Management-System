-- Fix missing columns for vehicles table
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS odometer_km numeric default 0,
ADD COLUMN IF NOT EXISTS roi_cost numeric default 0;

-- Update the status check to also allow 'retired' vehicles
ALTER TABLE public.vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_status_check CHECK (status in ('available', 'on_trip', 'in_shop', 'retired'));
