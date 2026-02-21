import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock, Mail, User, ArrowRight, Eye, EyeOff, ShieldCheck, Briefcase, Wrench, BarChart3, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FormLoader } from '../components/Skeleton';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ROLES = [
    {
        value: 'manager',
        label: 'Fleet Manager',
        description: 'Full access — oversee all vehicles, drivers, and finances.',
        color: 'brand',
        icon: Briefcase,
    },
    {
        value: 'dispatcher',
        label: 'Trip Dispatcher',
        description: 'Create trips, assign drivers, and validate cargo loads.',
        color: 'emerald',
        icon: Truck,
    },
    {
        value: 'safety',
        label: 'Safety Officer',
        description: 'Monitor driver compliance, licenses, and safety scores.',
        color: 'amber',
        icon: ShieldCheck,
    },
    {
        value: 'finance',
        label: 'Financial Analyst',
        description: 'Audit fuel spend, maintenance ROI, and operational costs.',
        color: 'purple',
        icon: BarChart3,
    },
];

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('manager');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const { register, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !authLoading) navigate('/');
    }, [user, authLoading, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await register({ fullName, email, password, role });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success(`Welcome to FleetFlow, ${fullName}!`);
                navigate('/');
            }
        } catch {
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    const colorMap = {
        brand: 'border-brand-500 bg-brand-50 text-brand-700',
        emerald: 'border-emerald-500 bg-emerald-50 text-emerald-700',
        amber: 'border-amber-500 bg-amber-50 text-amber-700',
        purple: 'border-purple-500 bg-purple-50 text-purple-700',
    };

    const selectedRole = ROLES.find(r => r.value === role);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden py-10">
            {/* Massive 3D Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[1000px]">
                {/* 3D Floating Globe */}
                <motion.div
                    animate={{ y: [0, -30, 0], rotateX: [10, 25, 10], rotateY: [-10, 10, -10] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-[5%] -right-[10%] w-[550px] h-[550px] text-brand-500/10"
                >
                    <Globe className="w-full h-full drop-shadow-[0_0_50px_rgba(14,165,233,0.3)]" />
                </motion.div>

                {/* 3D Floating Truck */}
                <motion.div
                    animate={{ y: [0, 40, 0], rotateX: [-15, 0, -15], rotateZ: [-10, 0, -10] }}
                    transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute top-[30%] -left-[15%] w-[600px] h-[600px] text-emerald-500/10"
                >
                    <Truck className="w-full h-full drop-shadow-[0_0_60px_rgba(16,185,129,0.2)]" />
                </motion.div>

                {/* 3D Floating ID/Briefcase */}
                <motion.div
                    animate={{ y: [0, -20, 0], rotateY: [15, 30, 15], rotateZ: [5, 15, 5] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
                    className="absolute -bottom-[10%] right-[10%] w-[350px] h-[350px] text-amber-500/10"
                >
                    <Briefcase className="w-full h-full drop-shadow-[0_0_40px_rgba(245,158,11,0.2)]" />
                </motion.div>
            </div>

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-xl flex items-center justify-center text-white transform -rotate-3 hover:rotate-0 transition-transform">
                        <Truck className="w-9 h-9" />
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">Create your account</h2>
                <p className="mt-2 text-center text-sm text-slate-500">Join FleetFlow and choose your operational role</p>
            </div>

            <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4 sm:px-0 perspective-[1000px]">
                <motion.div
                    initial={{ rotateX: 10, y: 30, opacity: 0 }}
                    animate={{ rotateX: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                    className="bg-white/80 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl border border-white/50 relative"
                    style={{ transformStyle: 'preserve-3d' }}
                >

                    <form className="space-y-5" onSubmit={handleRegister}>
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    required
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Alex Mercer"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="email"
                                    required
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="form-input pr-9"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="Min. 6 chars"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" onClick={() => setShowPassword(s => !s)}>
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="form-input"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="Repeat password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Role Selector */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Select Your Role</label>
                            <div className="grid grid-cols-2 gap-3">
                                {ROLES.map(r => {
                                    const Icon = r.icon;
                                    const isSelected = role === r.value;
                                    return (
                                        <button
                                            key={r.value}
                                            type="button"
                                            onClick={() => setRole(r.value)}
                                            className={`flex flex-col items-start p-3 rounded-xl border-2 text-left transition-all duration-200 ${isSelected
                                                ? colorMap[r.color] + ' shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? '' : 'text-slate-400'}`} />
                                            <span className="text-xs font-bold leading-tight">{r.label}</span>
                                            <span className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-2">{r.description}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedRole && (
                                <p className="mt-2 text-xs text-center text-slate-500">
                                    Registering as: <span className="font-semibold text-slate-700">{selectedRole.label}</span>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 mt-2 font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all"
                        >
                            <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-500 relative z-10">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 transition-colors">
                            Sign in
                        </Link>
                    </p>

                    <FormLoader loading={loading} label="Creating account..." />
                </motion.div>
            </div>
        </div>
    );
};

export default Register;
