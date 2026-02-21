import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, ShieldAlert, CheckCircle2, Ban, UserCheck } from 'lucide-react';
import { useDrivers } from '../hooks/useDrivers';
import { useTrips } from '../hooks/useTrips';
import Modal from '../components/Modal';
import { SkeletonCard } from '../components/Skeleton';
import StatusBadge from '../components/StatusBadge';

const Drivers = () => {
    const { drivers, loading, addDriver, updateDriverStatus } = useDrivers();
    const { trips } = useTrips();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        license_expiry: '',
        license_type: 'Van'
    });

    const getScoreColor = (score) => {
        if (score >= 95) return 'bg-emerald-500';
        if (score >= 80) return 'bg-brand-500';
        if (score >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const filtered = drivers.filter(d =>
        (d.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        const { error } = await addDriver(formData);
        setFormLoading(false);
        if (!error) {
            setIsAddModalOpen(false);
            setFormData({ full_name: '', phone: '', license_expiry: '', license_type: 'Van' });
        }
    };

    const toggleSuspend = async (driver) => {
        const newStatus = driver.duty_status === 'suspended' ? 'off_duty' : 'suspended';
        await updateDriverStatus(driver.id, { duty_status: newStatus });
    };

    return (
        <div className="space-y-6">

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search driver profiles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input pl-9 outline-none"
                    />
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto btn-primary"
                >
                    <UserPlus className="w-4 h-4" /> Register Driver
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
                        No drivers found matching "{searchTerm}"
                    </div>
                ) : (
                    filtered.map((driver, i) => {
                        const isExpired = new Date(driver.license_expiry) < new Date();
                        const isSuspended = driver.duty_status === 'suspended';

                        // Calculate completion rate from trip history
                        const driverTrips = trips.filter(t => t.driver_id === driver.id);
                        const driverCompletedTrips = driverTrips.filter(t => t.status === 'completed').length;
                        const completionRate = driverTrips.length > 0 ? Math.round((driverCompletedTrips / driverTrips.length) * 100) : 100;

                        return (
                            <motion.div
                                key={driver.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-panel p-6 flex flex-col ${isSuspended ? 'bg-slate-50 opacity-75' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2 shadow-sm ${isSuspended ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-brand-100 text-brand-600 border-white'}`}>
                                            {(driver.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{driver.full_name}</h3>
                                            <p className="text-xs text-slate-500 font-medium">Duty:
                                                {driver.duty_status === 'on_duty' && <span className="text-emerald-600 ml-1">On Duty</span>}
                                                {driver.duty_status === 'off_duty' && <span className="text-slate-500 ml-1">Off Duty</span>}
                                                {driver.duty_status === 'suspended' && <span className="text-red-500 ml-1">Suspended</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleSuspend(driver)}
                                        className={`p-2 rounded-lg transition-colors ${isSuspended ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50'}`}
                                        title={isSuspended ? 'Reactivate Driver' : 'Suspend Driver'}
                                    >
                                        {isSuspended ? <UserCheck className="w-5 h-5" /> : <Ban className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="space-y-3 mb-6 flex-1">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-600">Safety Score</span>
                                            <span className="font-bold text-slate-900">{driver.safety_score}/100</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className={`${getScoreColor(driver.safety_score)} h-2 rounded-full transition-all duration-1000`} style={{ width: `${driver.safety_score}%` }}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-slate-600">Completion Rate</span>
                                            <span className="font-bold text-slate-900">{completionRate}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-1000 ${completionRate >= 90 ? 'bg-emerald-500' : completionRate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                style={{ width: `${completionRate}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{driverCompletedTrips} of {driverTrips.length} trips completed</p>
                                    </div>

                                    <div className={`p-3 rounded-lg border flex items-start gap-3 text-sm ${isExpired ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
                                        {isExpired ? (
                                            <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        ) : (
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className={`font-semibold ${isExpired ? 'text-red-900' : 'text-slate-700'}`}>License Expiry</p>
                                            <p className={isExpired ? 'text-red-700 font-medium' : 'text-slate-500'}>
                                                {new Date(driver.license_expiry).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">Class: {driver.license_type}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 flex justify-between items-center mt-auto">
                                    <span className="text-xs font-semibold text-slate-400 uppercase">Assignment</span>
                                    <StatusBadge status={driver.status} />
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Add Driver Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Register Driver" loading={formLoading} loadingLabel="Registering driver...">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input required type="text" className="form-input" placeholder="e.g. Alex Mercer" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                        <input required type="text" className="form-input" placeholder="+1 234 567 8900" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">License Expiry</label>
                            <input required type="date" className="form-input" value={formData.license_expiry} onChange={e => setFormData({ ...formData, license_expiry: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">License Class</label>
                            <select className="form-input" value={formData.license_type} onChange={e => setFormData({ ...formData, license_type: e.target.value })}>
                                <option value="Van">Van</option>
                                <option value="Truck">Truck</option>
                                <option value="Bike">Bike</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Register Driver</button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default Drivers;
