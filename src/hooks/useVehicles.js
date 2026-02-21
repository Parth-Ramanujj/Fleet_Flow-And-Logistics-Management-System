import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

let mockVehicles = [
    { id: '1', name: 'Ford Transit', type: 'Van', plate: 'VAN-0921', capacity_kg: 800, odometer_km: 45200, status: 'available', roi_cost: 12500 },
    { id: '2', name: 'Volvo FH16', type: 'Truck', plate: 'TRK-5542', capacity_kg: 20000, odometer_km: 125000, status: 'on_trip', roi_cost: 45000 },
    { id: '3', name: 'Mercedes Sprinter', type: 'Van', plate: 'VAN-1120', capacity_kg: 1200, odometer_km: 82000, status: 'in_shop', roi_cost: 18200 },
    { id: '4', name: 'Honda Activa', type: 'Bike', plate: 'BK-9901', capacity_kg: 50, odometer_km: 12500, status: 'available', roi_cost: 450 },
    { id: '5', name: 'Isuzu NNR', type: 'Truck', plate: 'TRK-2210', capacity_kg: 4500, odometer_km: 210000, status: 'retired', roi_cost: 89000 },
];

export const useVehicles = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    const isMock = !import.meta.env.VITE_SUPABASE_URL;

    const fetchVehicles = async () => {
        setLoading(true);
        if (isMock) {
            setTimeout(() => {
                setVehicles([...mockVehicles]);
                setLoading(false);
            }, 600);
            return;
        }
        try {
            const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            setVehicles(data || []);
        } catch (error) {
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
        if (!isMock) {
            const sub = supabase.channel('vehicles_changes')
                .on('postgres', { event: '*', schema: 'public', table: 'vehicles' }, fetchVehicles)
                .subscribe();
            return () => sub.unsubscribe();
        }
    }, [isMock]);

    const addVehicle = async (vehicleData) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        if (isMock) {
            const newV = { ...vehicleData, id: Date.now().toString(), status: 'available', odometer_km: vehicleData.odometer_km || 0, roi_cost: vehicleData.roi_cost || 0 };
            mockVehicles = [newV, ...mockVehicles];
            setVehicles([...mockVehicles]);
            toast.success('Vehicle added successfully');
            return { error: null };
        }
        try {
            const { error } = await supabase.from('vehicles').insert([{ ...vehicleData, status: 'available' }]);
            if (error) throw error;
            toast.success('Vehicle added successfully');
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    const updateVehicleStatus = async (id, status) => {
        if (isMock) {
            mockVehicles = mockVehicles.map(v => v.id === id ? { ...v, status } : v);
            setVehicles([...mockVehicles]);
            toast.success(`Vehicle marked as ${status.replace('_', ' ')}`);
            return { error: null };
        }
        try {
            const { error } = await supabase.from('vehicles').update({ status }).eq('id', id);
            if (error) throw error;
            toast.success(`Vehicle marked as ${status.replace('_', ' ')}`);
            return { error: null };
        } catch (error) {
            toast.error(error.message);
            return { error };
        }
    };

    return { vehicles, loading, addVehicle, updateVehicleStatus, refresh: fetchVehicles };
};
