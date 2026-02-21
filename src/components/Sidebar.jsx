import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Truck, Users, Map, Wrench, Fuel, FileText, LogOut, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Sidebar = ({ mobileOpen, closeMobile }) => {
    const { profile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out successfully");
        navigate('/login');
    };

    const role = profile?.role || 'dispatcher';

    const canSeeTrips = ['manager', 'dispatcher'].includes(role);
    const canSeeAssetsHR = ['manager', 'safety'].includes(role);
    const canSeeFinance = ['manager', 'finance'].includes(role);

    const mainMenu = [
        { name: 'Command Center', icon: BarChart3, path: '/' },
        ...(canSeeTrips ? [{ name: 'Trip Dispatcher', icon: Map, path: '/trips' }] : []),
        ...(canSeeAssetsHR ? [
            { name: 'Vehicle Registry', icon: Truck, path: '/vehicles' },
            { name: 'Driver Profiles', icon: Users, path: '/drivers' },
        ] : []),
    ];

    const operationsMenu = canSeeFinance ? [
        { name: 'Maintenance Logs', icon: Wrench, path: '/maintenance' },
        { name: 'Expenses & Fuel', icon: Fuel, path: '/fuel' },
        { name: 'Analytics & Reports', icon: FileText, path: '/analytics' },
    ] : [];

    const renderLinks = (links) => (
        <ul className="space-y-1">
            {links.map((link) => (
                <li key={link.name}>
                    <NavLink
                        to={link.path}
                        onClick={closeMobile}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-brand-500/10 text-brand-400'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                    </NavLink>
                </li>
            ))}
        </ul>
    );

    const SidebarContent = (
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 w-64 shadow-2xl">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white shadow-brand-500/50 shadow-lg">
                        <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        FleetFlow
                    </span>
                </div>
                <button className="md:hidden text-slate-400 p-1" onClick={closeMobile}>
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 scroll-smooth">
                <div className="mb-8">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
                    {renderLinks(mainMenu)}
                </div>

                {operationsMenu.length > 0 && (
                    <div>
                        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Operations</p>
                        {renderLinks(operationsMenu)}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
                {/* User Profile Chip */}
                {profile && (
                    <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/70 border border-slate-700/50">
                        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg">
                            {(profile.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white truncate">{profile.full_name}</p>
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 capitalize ${role === 'manager' ? 'bg-brand-500/20 text-brand-300' :
                                    role === 'dispatcher' ? 'bg-emerald-500/20 text-emerald-300' :
                                        role === 'safety' ? 'bg-amber-500/20 text-amber-300' :
                                            'bg-purple-500/20 text-purple-300'
                                }`}>{role}</span>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-shrink-0 h-screen sticky top-0 z-20">
                {SidebarContent}
            </aside>

            {/* Mobile Sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
                            onClick={closeMobile}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 z-50 md:hidden"
                        >
                            {SidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
