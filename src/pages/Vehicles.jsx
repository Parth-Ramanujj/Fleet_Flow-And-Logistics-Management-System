import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Ban } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { SkeletonRow } from '../components/Skeleton';
import ConfirmDialog from '../components/ConfirmDialog';

const Vehicles = () => {
    const { vehicles, loading, addVehicle, updateVehicleStatus } = useVehicles();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [retireConfirmId, setRetireConfirmId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        plate: '',
        type: 'Van',
        capacity_kg: '',
        odometer_km: '',
        roi_cost: ''
    });

    const filtered = vehicles.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.plate.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const { error } = await addVehicle({
            ...formData,
            capacity_kg: Number(formData.capacity_kg),
            odometer_km: Number(formData.odometer_km) || 0,
            roi_cost: Number(formData.roi_cost) || 0
        });
        setFormLoading(false);
        if (!error) {
            setIsAddModalOpen(false);
            setFormData({ name: '', plate: '', type: 'Van', capacity_kg: '', odometer_km: '', roi_cost: '' });
        }
    };

    return (
        <div className="space-y-6">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search models or plates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-9 outline-none"
                    />
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto btn-primary"
                >
                    <Plus className="w-4 h-4" /> Add Vehicle
                </button>
            </div>

            {/* Main Table */}
            <div className="glass-panel overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm data-table">
                        <thead>
                            <tr>
                                <th>Vehicle Model</th>
                                <th>License Plate</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Odometer</th>
                                <th>Status</th>
                                <th>Est. Cost</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <>
                                    <SkeletonRow columns={8} />
                                    <SkeletonRow columns={8} />
                                    <SkeletonRow columns={8} />
                                </>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                                        No vehicles found matching "{searchTerm}"
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((vehicle, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        key={vehicle.id}
                                        className={`group ${vehicle.status === 'retired' ? 'bg-slate-50/50 opacity-60' : ''}`}
                                    >
                                        <td className="font-semibold text-slate-900">{vehicle.name}</td>
                                        <td><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{vehicle.plate}</span></td>
                                        <td>{vehicle.type}</td>
                                        <td>{Number(vehicle.capacity_kg).toLocaleString()} kg</td>
                                        <td className="font-mono text-slate-600">{Number(vehicle.odometer_km).toLocaleString()} km</td>
                                        <td>
                                            <StatusBadge status={vehicle.status} />
                                        </td>
                                        <td className="text-slate-500 font-medium">₹{Number(vehicle.roi_cost).toLocaleString()}</td>
                                        <td className="text-center space-x-2">
                                            {vehicle.status !== 'retired' && vehicle.status !== 'on_trip' && (
                                                <button
                                                    onClick={() => setRetireConfirmId(vehicle.id)}
                                                    className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Retire Vehicle"
                                                >
                                                    <Ban className="w-4 h-4" />
                                                </button>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Vehicle" loading={formLoading} loadingLabel="Registering vehicle...">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Model</label>
                        <input required type="text" className="form-input" placeholder="e.g. Ford Transit" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label>
                            <input required type="text" className="form-input font-mono uppercase" placeholder="ABC-1234" value={formData.plate} onChange={e => setFormData({ ...formData, plate: e.target.value.toUpperCase() })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Type</label>
                            <select className="form-input" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="Van">Van</option>
                                <option value="Truck">Truck</option>
                                <option value="Bike">Bike</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Capacity (kg)</label>
                            <input required type="number" className="form-input" placeholder="500" value={formData.capacity_kg} onChange={e => setFormData({ ...formData, capacity_kg: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Current Odometer (km)</label>
                            <input required type="number" className="form-input" placeholder="0" value={formData.odometer_km} onChange={e => setFormData({ ...formData, odometer_km: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial ROI Cost / Purchase Price (₹)</label>
                        <input required type="number" className="form-input" placeholder="100000" value={formData.roi_cost} onChange={e => setFormData({ ...formData, roi_cost: e.target.value })} />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Save Vehicle</button>
                    </div>
                </form>
            </Modal>

            {/* Retire Confirm */}
            <ConfirmDialog
                isOpen={!!retireConfirmId}
                onClose={() => setRetireConfirmId(null)}
                onConfirm={() => updateVehicleStatus(retireConfirmId, 'retired')}
                title="Retire Vehicle"
                message="Are you sure you want to retire this vehicle? It will no longer be available for dispatch."
                confirmText="Yes, Retire Vehicle"
            />
        </div>
    );
};

export default Vehicles;
