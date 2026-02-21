import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

let mockLogs = [
    { id: '1', vehicle_id: '1', description: 'Oil Change & Brake Inspection', cost: 1250, date: '2026-10-15', created_at: new Date().toISOString() },
    { id: '2', vehicle_id: '3', description: 'Engine Overhaul & Transmission check', cost: 45000, date: '2026-10-10', created_at: new Date().toISOString() },
    { id: '3', vehicle_id: '2', description: 'Tire Replacement (All 6)', cost: 18000, date: '2026-09-28', created_at: new Date().toISOString() },
];

export const useMaintenance = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMock = !import.meta.env.VITE_SUPABASE_URL;

    const fetchLogs = async () => {
        setLoading(true);
        if (isMock) {
            setTimeout(() => {
                setLogs([...mockLogs]);
                setLoading(false);
            }, 600);
            return;
        }
        try {
            const { data, error } = await supabase.from('maintenance_logs')
                .select(`*, vehicles(name, plate)`)
                .order('date', { ascending: false });
            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            toast.error('Failed to fetch maintenance logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        if (!isMock) {
            const sub = supabase.channel('maintenance_changes')
                .on('postgres', { event: '*', schema: 'public', table: 'maintenance_logs' }, fetchLogs)
                .subscribe();
            return () => sub.unsubscribe();
        }
    }, [isMock]);

    const addLog = async (logData) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isMock) {
            const newLog = {
                ...logData,
                id: Date.now().toString(),
                created_at: new Date().toISOString()
            };
            mockLogs = [newLog, ...mockLogs];
            setLogs([...mockLogs]);
            toast.success('Maintenance record added');
            return { error: null };
        }
        try {
            const { error } = await supabase.from('maintenance_logs').insert([logData]);
            if (error) throw error;
            toast.success('Maintenance record added');
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    return { logs, loading, addLog, refresh: fetchLogs };
};
