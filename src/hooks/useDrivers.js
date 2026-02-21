import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

let mockDrivers = [
    { id: '1', full_name: 'Alex Mercer', license_expiry: '2026-10-15', license_type: 'Truck', status: 'available', duty_status: 'on_duty', safety_score: 98, phone: '+1234567890' },
    { id: '2', full_name: 'Sarah Connor', license_expiry: '2025-05-22', license_type: 'Van', status: 'on_trip', duty_status: 'on_duty', safety_score: 100, phone: '+1987654321' },
    { id: '3', full_name: 'John Smith', license_expiry: '2024-03-01', license_type: 'Truck', status: 'available', duty_status: 'suspended', safety_score: 65, phone: '+1122334455' },
    { id: '4', full_name: 'Emily Davis', license_expiry: '2024-11-10', license_type: 'Bike', status: 'available', duty_status: 'off_duty', safety_score: 92, phone: '+1555666777' },
];

export const useDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMock = !import.meta.env.VITE_SUPABASE_URL;

    const fetchDrivers = async () => {
        setLoading(true);
        if (isMock) {
            setTimeout(() => {
                setDrivers([...mockDrivers]);
                setLoading(false);
            }, 500);
            return;
        }
        try {
            const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setDrivers(data || []);
        } catch (error) {
            toast.error('Failed to fetch drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
        if (!isMock) {
            const sub = supabase.channel('drivers_changes')
                .on('postgres', { event: '*', schema: 'public', table: 'drivers' }, fetchDrivers)
                .subscribe();
            return () => sub.unsubscribe();
        }
    }, [isMock]);

    const addDriver = async (driverData) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isMock) {
            const newD = { ...driverData, id: Date.now().toString(), status: 'available', safety_score: 100, duty_status: 'off_duty' };
            mockDrivers = [newD, ...mockDrivers];
            setDrivers([...mockDrivers]);
            toast.success('Driver added successfully');
            return { error: null };
        }
        try {
            const { error } = await supabase.from('drivers').insert([driverData]);
            if (error) throw error;
            toast.success('Driver added successfully');
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    const updateDriverStatus = async (id, statusUpdates) => {
        if (isMock) {
            mockDrivers = mockDrivers.map(d => d.id === id ? { ...d, ...statusUpdates } : d);
            setDrivers([...mockDrivers]);
            toast.success('Driver updated');
            return { error: null };
        }
        try {
            const { error } = await supabase.from('drivers').update(statusUpdates).eq('id', id);
            if (error) throw error;
            toast.success('Driver updated');
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    return { drivers, loading, addDriver, updateDriverStatus, refresh: fetchDrivers };
};
