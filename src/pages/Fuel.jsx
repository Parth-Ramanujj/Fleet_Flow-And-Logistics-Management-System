import { useState } from 'react';
import { motion } from 'framer-motion';
import { Fuel as FuelIcon, Plus, Calendar, IndianRupee, MapPin, Droplets, Truck, Map as MapIcon } from 'lucide-react';
import { useFuel } from '../hooks/useFuel';
import { useVehicles } from '../hooks/useVehicles';
import { useTrips } from '../hooks/useTrips';
import { SkeletonRow, FormLoader } from '../components/Skeleton';
import toast from 'react-hot-toast';

const Fuel = () => {
    const { fuelLogs, loading, addFuelLog } = useFuel();
    const { vehicles } = useVehicles();
    const { trips } = useTrips();

    const [formData, setFormData] = useState({
        vehicle_id: '',
        trip_id: '',
        date: new Date().toISOString().split('T')[0],
        gallons: '',
        cost: '',
        station: ''
    });
    const [formLoading, setFormLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const { error } = await addFuelLog({
            ...formData,
            gallons: Number(formData.gallons),
            cost: Number(formData.cost)
        });
        setFormLoading(false);
        if (!error) {
            setFormData({
                vehicle_id: '',
                trip_id: '',
                date: new Date().toISOString().split('T')[0],
                gallons: '',
                cost: '',
                station: ''
            });
        }
    };

    return (
        <div className="flex flex-col xl:flex-row gap-8">
            {/* Split Form */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full xl:w-1/3 flex-shrink-0"
            >
                <div className="glass-panel p-6 border-t-4 border-t-brand-500 relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-brand-50 text-brand-600">
                            <FuelIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Log Fuel Transaction</h2>
                    </div>

                    <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Vehicle</label>
                            <div className="relative">
                                <Truck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    required
                                    className="form-input pl-9"
                                    value={formData.vehicle_id}
                                    onChange={e => setFormData({ ...formData, vehicle_id: e.target.value })}
                                >
                                    <option value="">-- Select Vehicle --</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate} ({v.name})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Assigned Trip (Optional)</label>
                            <div className="relative">
                                <MapIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <select
                                    className="form-input pl-9"
                                    value={formData.trip_id}
                                    onChange={e => setFormData({ ...formData, trip_id: e.target.value })}
                                >
                                    <option value="">-- No Specific Trip --</option>
                                    {trips.filter(t => formData.vehicle_id ? t.vehicle_id === formData.vehicle_id : true).map(t => (
                                        <option key={t.id} value={t.id}>{t.ref_id} ({t.origin} to {t.destination})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Date</label>
                            <div className="relative">
                                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    required
                                    type="date"
                                    className="form-input pl-9"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Volume (Liters)</label>
                                <div className="relative">
                                    <Droplets className="w-4 h-4 text-brand-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="form-input pl-9"
                                        placeholder="0.00"
                                        value={formData.gallons}
                                        onChange={e => setFormData({ ...formData, gallons: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-slate-700 mb-1">Total Cost (₹)</label>
                                <div className="relative">
                                    <IndianRupee className="w-4 h-4 text-emerald-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        className="form-input pl-9"
                                        placeholder="0.00"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Gas Station</label>
                            <div className="relative">
                                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    required
                                    type="text"
                                    className="form-input pl-9"
                                    placeholder="e.g. Jio-BP Station"
                                    value={formData.station}
                                    onChange={e => setFormData({ ...formData, station: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={formLoading} className="w-full btn-primary py-3">
                                <Plus className="w-4 h-4" /> Save Fuel Log
                            </button>
                        </div>
                    </form>
                    <FormLoader loading={formLoading} label="Saving fuel log..." />
                </div>
            </motion.div>

            {/* List Table */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full xl:w-2/3 flex-1"
            >
                <div className="glass-panel overflow-hidden bg-white h-full">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            Recent Fuel Logs
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vehicle</th>
                                    <th>Trip Ref</th>
                                    <th>Station</th>
                                    <th>Volume</th>
                                    <th>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <>
                                        <SkeletonRow columns={6} />
                                        <SkeletonRow columns={6} />
                                        <SkeletonRow columns={6} />
                                    </>
                                ) : fuelLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium text-lg">
                                            No fuel records found.
                                        </td>
                                    </tr>
                                ) : (
                                    fuelLogs.map((log) => {
                                        const vCode = !import.meta.env.VITE_SUPABASE_URL ? vehicles.find(vx => vx.id === log.vehicle_id)?.plate : log.vehicles?.plate;
                                        const tCode = log.trip_id && (!import.meta.env.VITE_SUPABASE_URL ? trips.find(tx => tx.id === log.trip_id)?.ref_id : log.trips?.ref_id || log.trip_id);

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="whitespace-nowrap font-medium text-slate-700">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </td>
                                                <td><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">{vCode || 'Unknown'}</span></td>
                                                <td>
                                                    {tCode ? <span className="text-xs font-semibold bg-brand-50 text-brand-600 px-2 py-1 rounded">{tCode}</span> : <span className="text-slate-400 text-xs italic">Unlinked</span>}
                                                </td>
                                                <td className="text-slate-600 font-medium flex items-center gap-1.5 py-4">
                                                    <MapPin className="w-3 h-3 text-slate-400" />
                                                    {log.station}
                                                </td>
                                                <td className="font-medium text-brand-600 bg-brand-50/50">
                                                    {Number(log.gallons).toFixed(2)} L
                                                </td>
                                                <td className="font-bold text-slate-900 bg-emerald-50/30 whitespace-nowrap">
                                                    ₹{Number(log.cost).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Fuel;
