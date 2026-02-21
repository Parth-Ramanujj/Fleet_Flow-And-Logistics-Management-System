import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
    const location = useLocation();
    const { profile, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const isLoginPage = location.pathname === '/login';

    const getPageTitle = (path) => {
        switch (path) {
            case '/': return 'Command Center';
            case '/vehicles': return 'Vehicle Registry';
            case '/drivers': return 'Driver Profiles';
            case '/trips': return 'Trip Dispatcher';
            case '/maintenance': return 'Maintenance Logs';
            case '/fuel': return 'Expense & Fuel Logging';
            case '/analytics': return 'Operational Analytics';
            default: return '';
        }
    };

    if (isLoginPage) {
        return <Outlet />;
    }

    return (
        <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
            <Sidebar mobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative scroll-smooth">
                {/* Top Navbar */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-3">
                        <button
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-md"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold text-slate-800">
                            {getPageTitle(location.pathname)}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full shadow-sm border border-slate-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm border border-brand-200 shadow-sm">
                                    {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : <UserCircle className="w-5 h-5" />}
                                </div>
                            )}
                            <div className="hidden sm:block">
                                <p className="text-sm font-bold leading-none text-slate-800">{profile?.full_name || user?.email}</p>
                                <p className="text-xs text-brand-600 font-semibold lowercase tracking-wider">{profile?.role}</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content with Transitions */}
                <div className="flex-1 p-4 sm:p-8">
                    <div className="max-w-7xl mx-auto h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="pb-12"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
