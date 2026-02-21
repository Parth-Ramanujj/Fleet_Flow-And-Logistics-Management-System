import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

let tripCounter = 45;

let mockTrips = [
    { id: '1', ref_id: 'TRP-0042', vehicle_id: '1', driver_id: '1', origin: 'Warehouse A', destination: 'City Center', cargo_weight_kg: 450, status: 'dispatched', created_at: new Date().toISOString() },
    { id: '2', ref_id: 'TRP-0043', vehicle_id: '2', driver_id: '2', origin: 'Port B', destination: 'Distribution Node', cargo_weight_kg: 1200, status: 'draft', created_at: new Date().toISOString() },
    { id: '3', ref_id: 'TRP-0044', vehicle_id: '1', driver_id: '1', origin: 'Store 1', destination: 'Customer X', cargo_weight_kg: 15, status: 'completed', created_at: new Date().toISOString() },
];

export const useTrips = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMock = !import.meta.env.VITE_SUPABASE_URL;

    const fetchTrips = async () => {
        setLoading(true);
        if (isMock) {
            setTimeout(() => {
                setTrips([...mockTrips]);
                setLoading(false);
            }, 600);
            return;
        }
        try {
            const { data, error } = await supabase.from('trips')
                .select(`*, vehicles(name, plate, capacity_kg), drivers(full_name)`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setTrips(data || []);
        } catch (error) {
            toast.error('Failed to fetch trips');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
        if (!isMock) {
            const sub = supabase.channel('trips_changes')
                .on('postgres', { event: '*', schema: 'public', table: 'trips' }, fetchTrips)
                .subscribe();
            return () => sub.unsubscribe();
        }
    }, [isMock]);

    const addTrip = async (tripData) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isMock) {
            tripCounter++;
            const newT = {
                ...tripData,
                id: Date.now().toString(),
                ref_id: `TRP-00${tripCounter}`,
                status: 'draft',
                created_at: new Date().toISOString()
            };
            mockTrips = [newT, ...mockTrips];
            setTrips([...mockTrips]);
            toast.success('Trip created as draft');
            return { error: null };
        }
        try {
            const { error } = await supabase.from('trips').insert([tripData]);
            if (error) throw error;
            toast.success('Trip created as draft');
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    const updateTripStatus = async (id, status) => {
        if (isMock) {
            mockTrips = mockTrips.map(t => t.id === id ? { ...t, status } : t);
            setTrips([...mockTrips]);
            toast.success(`Trip status updated`);
            return { error: null };
        }
        try {
            const { error } = await supabase.from('trips').update({ status }).eq('id', id);
            if (error) throw error;
            toast.success(`Trip status updated`);
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    return { trips, loading, addTrip, updateTripStatus, refresh: fetchTrips };
};
