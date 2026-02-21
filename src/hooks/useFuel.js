import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

let mockFuelLogs = [
    { id: '1', vehicle_id: '1', trip_id: '1', gallons: 15.5, cost: 45.50, date: '2026-02-21', station: 'Shell Central', created_at: new Date().toISOString() },
    { id: '2', vehicle_id: '2', trip_id: '2', gallons: 80.0, cost: 240.00, date: '2026-02-20', station: 'Love\'s Travel Stop', created_at: new Date().toISOString() },
    { id: '3', vehicle_id: '1', trip_id: '', gallons: 12.0, cost: 36.00, date: '2026-02-18', station: 'BP Express', created_at: new Date().toISOString() },
];

export const useFuel = () => {
    const [fuelLogs, setFuelLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMock = !import.meta.env.VITE_SUPABASE_URL;

    const fetchFuelLogs = async () => {
        setLoading(true);
        if (isMock) {
            setTimeout(() => {
                setFuelLogs([...mockFuelLogs]);
                setLoading(false);
            }, 500);
            return;
        }
        try {
            const { data, error } = await supabase.from('fuel_logs')
                .select(`*, vehicles(name, plate)`)
                .order('date', { ascending: false });
            if (error) throw error;
            setFuelLogs(data || []);
        } catch (error) {
            toast.error('Failed to fetch fuel logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFuelLogs();
        if (!isMock) {
            const sub = supabase.channel('fuel_changes')
                .on('postgres', { event: '*', schema: 'public', table: 'fuel_logs' }, fetchFuelLogs)
                .subscribe();
            return () => sub.unsubscribe();
        }
    }, [isMock]);

    const addFuelLog = async (logData) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isMock) {
            const newLog = {
                ...logData,
                id: Date.now().toString(),
                created_at: new Date().toISOString()
            };
            mockFuelLogs = [newLog, ...mockFuelLogs];
            setFuelLogs([...mockFuelLogs]);
            toast.success('Fuel entry recorded successfully');
            return { error: null };
        }
        try {
            const { error } = await supabase.from('fuel_logs').insert([logData]);
            if (error) throw error;
            toast.success('Fuel entry recorded successfully');
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    return { fuelLogs, loading, addFuelLog, refresh: fetchFuelLogs };
};
