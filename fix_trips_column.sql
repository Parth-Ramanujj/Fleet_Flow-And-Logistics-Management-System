-- Fix missing columns for trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS estimated_fuel_cost numeric(10, 2) default 0;
