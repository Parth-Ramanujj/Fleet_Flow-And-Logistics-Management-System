import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Truck, User, Weight, CheckCircle2, Clock, Ban, IndianRupee } from 'lucide-react';
import { useTrips } from '../hooks/useTrips';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import StatusBadge from '../components/StatusBadge';
import { SkeletonCard, FormLoader } from '../components/Skeleton';
import toast from 'react-hot-toast';

const Dispatcher = () => {
    const { trips, loading: tripsLoading, addTrip, updateTripStatus } = useTrips();
    const { vehicles, updateVehicleStatus } = useVehicles();
    const { drivers, updateDriverStatus } = useDrivers();

    const [searchTerm, setSearchTerm] = useState('');
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({
        vehicle_id: '',
        driver_id: '',
        cargo_weight_kg: '',
        origin: '',
        destination: '',
        estimated_fuel_cost: ''
    });

    const filteredTrips = trips.filter(t => t.ref_id.toLowerCase().includes(searchTerm.toLowerCase()));

    // Select options filtering
    const availableVehicles = vehicles.filter(v => v.status === 'available');
    const availableDrivers = drivers.filter(d =>
        d.status === 'available' &&
        d.duty_status === 'on_duty' &&
        new Date(d.license_expiry) > new Date()
    );

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);
    const weightExceeded = selectedVehicle && Number(formData.cargo_weight_kg) > selectedVehicle.capacity_kg;

    const handleCreateDraft = async (e) => {
        e.preventDefault();
        if (weightExceeded) {
            toast.error("Cargo exceeds vehicle capacity");
            return;
        }
        setFormLoading(true);
        const { error } = await addTrip({
            ...formData,
            cargo_weight_kg: Number(formData.cargo_weight_kg),
            estimated_fuel_cost: Number(formData.estimated_fuel_cost)
        });
        setFormLoading(false);
        if (!error) {
            setFormData({ vehicle_id: '', driver_id: '', cargo_weight_kg: '', origin: '', destination: '', estimated_fuel_cost: '' });
        }
    };

    const handleDispatch = async (trip) => {
        await updateTripStatus(trip.id, 'dispatched');

        // Mock DB Triggers -> update local state so UI updates
        if (!import.meta.env.VITE_SUPABASE_URL) {
            await updateVehicleStatus(trip.vehicle_id, 'on_trip');
            await updateDriverStatus(trip.driver_id, { status: 'on_trip' });
        }
    };

    const handleComplete = async (trip) => {
        await updateTripStatus(trip.id, 'completed');

        // Mock DB Triggers
        if (!import.meta.env.VITE_SUPABASE_URL) {
            await updateVehicleStatus(trip.vehicle_id, 'available');
            await updateDriverStatus(trip.driver_id, { status: 'available' });
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">

            {/* Left Column: Dispatch Form */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full lg:w-1/3 xl:w-1/4 space-y-6 flex-shrink-0"
            >
                <div className="glass-panel p-6 border-t-4 border-t-brand-500 relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">New Dispatch</h2>
                    </div>

                    <form className="space-y-4 text-sm" onSubmit={handleCreateDraft}>
                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Select Available Vehicle</label>
                            <div className="relative">
                                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    required
                                    value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                    className="form-input pl-9"
                                >
                                    <option value="">-- Choose Vehicle --</option>
                                    {availableVehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate} ({v.type}) - Max {v.capacity_kg}kg</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Assign On-Duty Driver</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    required
                                    value={formData.driver_id}
                                    onChange={e => setFormData({ ...formData, driver_id: e.target.value })}
                                    className="form-input pl-9"
                                >
                                    <option value="">-- Choose Driver --</option>
                                    {availableDrivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.full_name} ({d.license_type})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Origin Point</label>
                            <input required type="text" className="form-input" placeholder="e.g. Warehouse A" value={formData.origin} onChange={e => setFormData({ ...formData, origin: e.target.value })} />
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Destination Point</label>
                            <input required type="text" className="form-input" placeholder="e.g. City Center" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Cargo Weight (kg)</label>
                            <div className="relative">
                                <Weight className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    required
                                    type="number"
                                    value={formData.cargo_weight_kg}
                                    onChange={(e) => setFormData({ ...formData, cargo_weight_kg: e.target.value })}
                                    className={`form-input pl-9 ${weightExceeded ? 'border-red-300 focus:ring-red-500' : ''}`}
                                    placeholder="e.g. 450"
                                />
                            </div>
                            {weightExceeded && (
                                <p className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                                    <Ban className="w-3 h-3" /> Exceeds vehicle max capacity!
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Estimated Fuel Cost (₹)</label>
                            <div className="relative">
                                <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="number"
                                    value={formData.estimated_fuel_cost}
                                    onChange={(e) => setFormData({ ...formData, estimated_fuel_cost: e.target.value })}
                                    className="form-input pl-9"
                                    placeholder="e.g. 1500"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={weightExceeded || !formData.vehicle_id || !formData.driver_id || formLoading}
                                className="w-full btn-primary py-3"
                            >
                                <Plus className="w-4 h-4" /> Create Draft Trip
                            </button>
                        </div>
                    </form>
                    <FormLoader loading={formLoading} label="Creating dispatch..." />
                </div>
            </motion.div>

            {/* Right Column: Active Trips Timeline */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full flex-1 glass-panel p-0 overflow-hidden flex flex-col h-[calc(100vh-8rem)]"
            >
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white/50 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-lg font-bold">Trip Operations Timeline</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search Ref ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input py-1.5 w-48"
                        />
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1 h-full pb-20">
                    <div className="space-y-4">
                        {tripsLoading ? (
                            <>
                                <SkeletonCard />
                                <SkeletonCard />
                            </>
                        ) : filteredTrips.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                No trips found matching your search.
                            </div>
                        ) : filteredTrips.map((trip, idx) => {
                            // Find mock refs
                            const v = !import.meta.env.VITE_SUPABASE_URL ? vehicles.find(vx => vx.id === trip.vehicle_id) : trip.vehicles;
                            const d = !import.meta.env.VITE_SUPABASE_URL ? drivers.find(dx => dx.id === trip.driver_id) : trip.drivers;

                            return (
                                <motion.div
                                    key={trip.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                                >
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${trip.status === 'dispatched' ? 'bg-amber-400' :
                                        trip.status === 'completed' ? 'bg-emerald-400' :
                                            'bg-slate-300'
                                        }`} />

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 ml-2 gap-2">
                                        <div>
                                            <span className="font-mono font-bold text-slate-900 text-base">{trip.ref_id}</span>
                                            <p className="text-slate-500 text-xs mt-0.5">Vehicle: {v?.plate} ({v?.name})</p>
                                        </div>
                                        <StatusBadge status={trip.status} />
                                    </div>

                                    <div className="ml-2 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">Driver</span>
                                            <span className="font-semibold flex items-center gap-1.5 text-slate-800"><User className="w-3.5 h-3.5 text-brand-500" /> {d?.full_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">Route</span>
                                            <span className="font-medium text-slate-700">{trip.origin} <span className="text-slate-400">→</span> {trip.destination}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block mb-1">Load</span>
                                            <span className="font-medium flex items-center gap-1.5 whitespace-nowrap"><Weight className="w-3.5 h-3.5 text-slate-400" /> {trip.cargo_weight_kg} / {v?.capacity_kg} kg</span>
                                        </div>
                                    </div>

                                    <div className="ml-2 mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                                        {trip.status === 'draft' && (
                                            <button
                                                onClick={() => handleDispatch(trip)}
                                                className="btn-primary py-1.5 px-4 rounded-md"
                                            >
                                                Dispatch Now
                                            </button>
                                        )}
                                        {trip.status === 'dispatched' && (
                                            <button
                                                onClick={() => handleComplete(trip)}
                                                className="btn-secondary py-1.5 px-4 rounded-md text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                                            >
                                                Mark Completed
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.div>

        </div>
    );
};

export default Dispatcher;
