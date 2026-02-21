-- ==========================================
-- DUMMY DATA FOR FLEETFLOW (Indian Context)
-- ==========================================

-- 1. Insert Users
-- Passwords are in plain text as per your current AuthContext implementation
INSERT INTO public.users (id, email, password, full_name, role) VALUES
('b19c2f68-7c5c-4820-9cb5-ef5202888711', 'rahul.manager@fleetflow.in', 'password123', 'Rahul Sharma', 'manager'),
('b19c2f68-7c5c-4820-9cb5-ef5202888712', 'priya.dispatcher@fleetflow.in', 'password123', 'Priya Singh', 'dispatcher'),
('b19c2f68-7c5c-4820-9cb5-ef5202888713', 'amit.safety@fleetflow.in', 'password123', 'Amit Patel', 'safety'),
('b19c2f68-7c5c-4820-9cb5-ef5202888714', 'neha.finance@fleetflow.in', 'password123', 'Neha Gupta', 'finance');

-- 2. Insert Vehicles
INSERT INTO public.vehicles (id, plate, name, type, capacity_kg, status) VALUES
('a19c2f68-7c5c-4820-9cb5-ef5202888721', 'MH 12 AB 1234', 'Tata Ace Gold', 'Light Commercial', 750, 'available'),
('a19c2f68-7c5c-4820-9cb5-ef5202888722', 'DL 01 CD 5678', 'Ashok Leyland Dost', 'Light Commercial', 1250, 'on_trip'),
('a19c2f68-7c5c-4820-9cb5-ef5202888723', 'KA 03 EF 9012', 'Tata Signa 2823.K', 'Heavy Commercial', 28000, 'available'),
('a19c2f68-7c5c-4820-9cb5-ef5202888724', 'GJ 05 GH 3456', 'Mahindra Bolero Pik-Up', 'Pickup', 1700, 'in_shop'),
('a19c2f68-7c5c-4820-9cb5-ef5202888725', 'UP 16 IJ 7890', 'Eicher Pro 2049', 'Medium Commercial', 4900, 'available');

-- 3. Insert Drivers
INSERT INTO public.drivers (id, full_name, license_type, license_expiry, phone, safety_score, duty_status, status) VALUES
('c19c2f68-7c5c-4820-9cb5-ef5202888731', 'Rajesh Kumar', 'Heavy Motor Vehicle', '2028-10-15', '+91 9876543210', 95, 'on_duty', 'available'),
('c19c2f68-7c5c-4820-9cb5-ef5202888732', 'Suresh Verma', 'Light Motor Vehicle', '2026-05-20', '+91 8765432109', 88, 'on_duty', 'on_trip'),
('c19c2f68-7c5c-4820-9cb5-ef5202888733', 'Vikram Singh', 'Heavy Motor Vehicle', '2027-01-10', '+91 7654321098', 100, 'off_duty', 'available'),
('c19c2f68-7c5c-4820-9cb5-ef5202888734', 'Manoj Desai', 'Light Motor Vehicle', '2025-12-05', '+91 6543210987', 72, 'on_duty', 'available'),
('c19c2f68-7c5c-4820-9cb5-ef5202888735', 'Arjun Reddy', 'Medium Motor Vehicle', '2029-08-30', '+91 5432109876', 91, 'off_duty', 'suspended');

-- 4. Insert Trips
INSERT INTO public.trips (id, ref_id, vehicle_id, driver_id, origin, destination, cargo_weight_kg, status) VALUES
('d19c2f68-7c5c-4820-9cb5-ef5202888741', 'TRP-1001', 'a19c2f68-7c5c-4820-9cb5-ef5202888722', 'c19c2f68-7c5c-4820-9cb5-ef5202888732', 'Mumbai, MH', 'Pune, MH', 1000, 'dispatched'),
('d19c2f68-7c5c-4820-9cb5-ef5202888742', 'TRP-1002', 'a19c2f68-7c5c-4820-9cb5-ef5202888723', 'c19c2f68-7c5c-4820-9cb5-ef5202888731', 'Delhi, DL', 'Jaipur, RJ', 15000, 'completed'),
('d19c2f68-7c5c-4820-9cb5-ef5202888743', 'TRP-1003', 'a19c2f68-7c5c-4820-9cb5-ef5202888721', 'c19c2f68-7c5c-4820-9cb5-ef5202888734', 'Bengaluru, KA', 'Mysuru, KA', 500, 'draft');

-- 5. Insert Maintenance Logs
INSERT INTO public.maintenance_logs (id, vehicle_id, date, description, cost) VALUES
(uuid_generate_v4(), 'a19c2f68-7c5c-4820-9cb5-ef5202888721', '2024-05-10', 'Routine Oil Change and Filter Replacement', 2500.00),
(uuid_generate_v4(), 'a19c2f68-7c5c-4820-9cb5-ef5202888723', '2024-05-15', 'Brake Pad Replacement (Front & Rear)', 12500.00),
(uuid_generate_v4(), 'a19c2f68-7c5c-4820-9cb5-ef5202888724', '2024-05-20', 'Engine Overhaul & Servicing', 45000.00);

-- 6. Insert Fuel Logs
INSERT INTO public.fuel_logs (id, vehicle_id, date, gallons, cost, station) VALUES
(uuid_generate_v4(), 'a19c2f68-7c5c-4820-9cb5-ef5202888721', '2024-05-18', 10.5, 3500.00, 'IndianOil Petrol Pump, Andheri'),
(uuid_generate_v4(), 'a19c2f68-7c5c-4820-9cb5-ef5202888723', '2024-05-19', 45.0, 15000.00, 'Bharat Petroleum, NH48 Highway'),
(uuid_generate_v4(), 'a19c2f68-7c5c-4820-9cb5-ef5202888722', '2024-05-21', 15.0, 5000.00, 'HP Petrol Pump, Dwarka');
