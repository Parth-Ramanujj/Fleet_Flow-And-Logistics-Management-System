import { motion } from 'framer-motion';
import { Truck, MapPin, Wrench, Box, ArrowUpRight, Activity, ShieldCheck, BellRing, Package, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { useDrivers } from '../hooks/useDrivers';
import { useTrips } from '../hooks/useTrips';
import { useMaintenance } from '../hooks/useMaintenance';

const StatCard = ({ title, value, icon: Icon, trend, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="glass-panel p-6"
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 font-medium mb-1 text-sm">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-50`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center gap-2">
                <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    {trend}
                </span>
                <span className="text-slate-400 text-xs font-medium">vs last month</span>
            </div>
        )}
    </motion.div>
);

const Dashboard = () => {
    const { vehicles } = useVehicles();
    const { drivers } = useDrivers();
    const { trips } = useTrips();
    const { logs } = useMaintenance();

    const activeVehicles = vehicles.filter(v => v.status === 'on_trip').length;
    const availableDrivers = drivers.filter(d => d.status === 'available').length;

    // Quick calculations
    const tripsCompleted = trips.filter(t => t.status === 'completed').length;
    const itemsInShop = vehicles.filter(v => v.status === 'in_shop').length;
    const pendingCargo = trips.filter(t => t.status === 'draft').length;
    const utilizationRate = vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard title="Active En-Route" value={activeVehicles} icon={Truck} trend="+12%" color="brand" delay={0.1} />
                <StatCard title="Total Dispatches" value={trips.length} icon={MapPin} trend="+5%" color="emerald" delay={0.2} />
                <StatCard title="Vehicles In Shop" value={itemsInShop} icon={Wrench} color="amber" delay={0.3} />
                <StatCard title="Available Drivers" value={availableDrivers} icon={Box} trend="+2" color="blue" delay={0.4} />
                <StatCard title="Pending Cargo" value={pendingCargo} icon={Package} color="purple" delay={0.5} />
            </div>

            {/* Quick Actions & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="lg:col-span-2 glass-panel p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-brand-500 opacity-20 rounded-full blur-2xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-4 max-w-lg">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                                <Activity className="w-3.5 h-3.5" /> Fleet is fully operational
                            </span>
                            <h2 className="text-3xl font-bold tracking-tight">Ready for deployment commands</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {activeVehicles} vehicles are currently executing routes. You have {availableDrivers} drivers on standby ready for new assignments.
                            </p>
                            <div className="pt-2 flex flex-wrap gap-4">
                                <Link to="/analytics" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-medium transition-colors">
                                    View Performance Matrix
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="glass-panel p-0 flex flex-col"
                >
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="font-bold flex items-center gap-2"><BellRing className="w-4 h-4 text-brand-500" /> Operational Alerts</h3>
                    </div>
                    <div className="flex-1 p-5 space-y-4">
                        {itemsInShop > 0 && (
                            <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                                <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
                                    <Wrench className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{itemsInShop} Vehicles Require Maintenance</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Some units are marked as In Shop.</p>
                                </div>
                            </div>
                        )}
                        {availableDrivers === 0 && (
                            <div className="flex gap-4 items-start pb-4 border-b border-slate-100">
                                <div className="p-2 bg-brand-50 rounded-lg flex-shrink-0">
                                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Driver Shortage Warning</p>
                                    <p className="text-xs text-slate-500 mt-0.5">No drivers are currently available for dispatch.</p>
                                </div>
                            </div>
                        )}
                        {itemsInShop === 0 && availableDrivers > 0 && (
                            <div className="flex flex-col items-center justify-center p-6 text-center h-full text-slate-400">
                                <ShieldCheck className="w-10 h-10 text-emerald-300 mb-3" />
                                <p className="text-sm font-medium">All systems green.</p>
                                <p className="text-xs mt-1">No critical alerts requiring attention.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Recent Trips Table */}
            <div className="glass-panel p-0 overflow-hidden mt-6">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-2">Recent Dispatches</h3>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm data-table">
                        <thead>
                            <tr>
                                <th>Ref ID</th>
                                <th>Vehicle Code</th>
                                <th>Route</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {trips.slice(0, 5).map(t => {
                                const vCode = !import.meta.env.VITE_SUPABASE_URL ? vehicles.find(vx => vx.id === t.vehicle_id)?.plate : t.vehicles?.plate;
                                return (
                                    <tr key={t.id} className="hover:bg-slate-50/50">
                                        <td className="font-semibold">{t.ref_id}</td>
                                        <td><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-semibold">{vCode || 'Unknown'}</span></td>
                                        <td className="text-slate-600">{t.origin} &rarr; {t.destination}</td>
                                        <td>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                t.status === 'dispatched' ? 'bg-brand-100 text-brand-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {t.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
