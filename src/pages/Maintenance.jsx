import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Plus, Calendar, IndianRupee, Truck } from 'lucide-react';
import { useMaintenance } from '../hooks/useMaintenance';
import { useVehicles } from '../hooks/useVehicles';
import { SkeletonRow, FormLoader } from '../components/Skeleton';
import toast from 'react-hot-toast';

const Maintenance = () => {
    const { logs, loading, addLog } = useMaintenance();
    const { vehicles, updateVehicleStatus } = useVehicles();

    const [formData, setFormData] = useState({
        vehicle_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        cost: ''
    });

    const [shouldUpdateStatus, setShouldUpdateStatus] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const { error } = await addLog({
            ...formData,
            cost: Number(formData.cost)
        });

        if (!error) {
            if (shouldUpdateStatus) {
                await updateVehicleStatus(formData.vehicle_id, 'in_shop');
            }
            setFormData({
                vehicle_id: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
                cost: ''
            });
            setShouldUpdateStatus(false);
        }
        setFormLoading(false);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Form Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0"
            >
                <div className="glass-panel p-6 border-t-4 border-t-amber-500 relative">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold">Log Maintenance</h2>
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
                            <label className="block font-medium text-slate-700 mb-1">Service Date</label>
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

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Cost / Labor (₹)</label>
                            <div className="relative">
                                <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    required
                                    type="number"
                                    className="form-input pl-9"
                                    placeholder="0"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-slate-700 mb-1">Issues Resolved & Details</label>
                            <textarea
                                required
                                className="form-input py-2"
                                rows="3"
                                placeholder="E.g., Oil change, brake fluid top-up..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="flex items-center pt-2">
                            <input
                                id="mark-shop"
                                type="checkbox"
                                className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                                checked={shouldUpdateStatus}
                                onChange={e => setShouldUpdateStatus(e.target.checked)}
                            />
                            <label htmlFor="mark-shop" className="ml-2 block text-sm text-slate-700 font-medium cursor-pointer">
                                Update vehicle status to <span className="text-red-600 font-bold">In Shop</span>
                            </label>
                        </div>

                        <div className="pt-4">
                            <button type="submit" disabled={formLoading} className="w-full btn-primary py-3">
                                <Plus className="w-4 h-4" /> Save Record
                            </button>
                        </div>
                    </form>
                    <FormLoader loading={formLoading} label="Saving maintenance log..." />
                </div>
            </motion.div>

            {/* History Table */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full lg:w-2/3 flex-1"
            >
                <div className="glass-panel overflow-hidden bg-white">
                    <div className="p-5 border-b border-slate-200">
                        <h2 className="text-lg font-bold">Recent Service History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Vehicle</th>
                                    <th>Service Details</th>
                                    <th>Total Cost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <>
                                        <SkeletonRow columns={4} />
                                        <SkeletonRow columns={4} />
                                        <SkeletonRow columns={4} />
                                    </>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium text-lg">
                                            No maintenance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const vCode = !import.meta.env.VITE_SUPABASE_URL ? vehicles.find(vx => vx.id === log.vehicle_id)?.plate : log.vehicles?.plate;
                                        const vName = !import.meta.env.VITE_SUPABASE_URL ? vehicles.find(vx => vx.id === log.vehicle_id)?.name : log.vehicles?.name;

                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="whitespace-nowrap font-medium text-slate-700">
                                                    {new Date(log.date).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <div className="font-semibold text-slate-900">{vCode || 'Unknown'}</div>
                                                    <div className="text-xs text-slate-500">{vName || 'Deleted Vehicle'}</div>
                                                </td>
                                                <td className="max-w-xs text-slate-600 truncate" title={log.description}>
                                                    {log.description}
                                                </td>
                                                <td className="font-bold text-amber-700 whitespace-nowrap">
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

export default Maintenance;
