import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Lock, Mail, ArrowRight, Eye, EyeOff, KeyRound, X, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FormLoader } from '../components/Skeleton';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Forgot Password Modal ─────────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
    const [step, setStep] = useState('email'); // 'email' | 'reset' | 'done'
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleLookup = (e) => {
        e.preventDefault();
        // Check if email exists in our dummy user store
        try {
            const users = JSON.parse(localStorage.getItem('fleetflow_users') || '[]');
            const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!found) {
                toast.error('No account found with that email address.');
                return;
            }
            setStep('reset');
        } catch {
            toast.error('Something went wrong. Please try again.');
        }
    };

    const handleReset = (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }
        try {
            const users = JSON.parse(localStorage.getItem('fleetflow_users') || '[]');
            const updated = users.map(u =>
                u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u
            );
            localStorage.setItem('fleetflow_users', JSON.stringify(updated));
            setStep('done');
        } catch {
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Forgot Password</h3>
                        <p className="text-slate-500 text-xs">Reset your account credentials</p>
                    </div>
                </div>

                {step === 'email' && (
                    <form onSubmit={handleLookup} className="space-y-4">
                        <p className="text-sm text-slate-600">Enter your registered email address and we'll help you reset your password.</p>
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
                        <button type="submit" className="w-full btn-primary py-2.5">
                            Find Account <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {step === 'reset' && (
                    <form onSubmit={handleReset} className="space-y-4">
                        <p className="text-sm text-slate-600">Account found for <strong className="text-slate-800">{email}</strong>. Set your new password below.</p>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Min. 6 characters"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    style={{ paddingLeft: '2.5rem' }}
                                    placeholder="Repeat new password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full btn-primary py-2.5">
                            Reset Password <CheckCircle2 className="w-4 h-4" />
                        </button>
                    </form>
                )}

                {step === 'done' && (
                    <div className="text-center py-4 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-lg">Password Reset!</p>
                            <p className="text-slate-500 text-sm mt-1">You can now sign in with your new password.</p>
                        </div>
                        <button onClick={onClose} className="w-full btn-primary py-2.5">
                            Back to Sign In
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Login Page ────────────────────────────────────────────────────────────────
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);

    const { login, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user && !authLoading) navigate('/');
    }, [user, authLoading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await login({ email, password });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success('Welcome back to FleetFlow!');
                navigate('/');
            }
        } catch {
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <>
            {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

            <div className="min-h-screen bg-slate-50 flex flex-col justify-center relative overflow-hidden">
                {/* Massive 3D Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[1000px]">
                    {/* 3D Glowing Truck */}
                    <motion.div
                        animate={{ y: [0, -20, 0], rotateX: [15, 25, 15], rotateY: [-20, -10, -20] }}
                        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] text-brand-500/20"
                    >
                        <Truck className="w-full h-full drop-shadow-[0_0_40px_rgba(14,165,233,0.4)]" />
                    </motion.div>

                    {/* 3D Floating Shield */}
                    <motion.div
                        animate={{ y: [0, 30, 0], rotateX: [-20, -10, -20], rotateZ: [10, 20, 10] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute top-[20%] -right-[15%] w-[600px] h-[600px] text-emerald-500/10"
                    >
                        <ShieldCheck className="w-full h-full drop-shadow-[0_0_60px_rgba(16,185,129,0.3)]" />
                    </motion.div>

                    {/* 3D Glowing Zap */}
                    <motion.div
                        animate={{ y: [0, -40, 0], rotateY: [15, 30, 15], rotateZ: [-10, -5, -10] }}
                        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        className="absolute -bottom-[20%] left-[20%] w-[400px] h-[400px] text-indigo-500/10"
                    >
                        <Zap className="w-full h-full drop-shadow-[0_0_50px_rgba(99,102,241,0.3)]" />
                    </motion.div>
                </div>

                <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-400 shadow-xl flex items-center justify-center text-white transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Truck className="w-9 h-9" />
                        </div>
                    </div>
                    <h2 className="mt-2 text-center text-3xl font-black text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="mt-2 text-center text-sm text-slate-500">Sign in to your FleetFlow workspace</p>
                </div>

                <div className="relative mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0 perspective-[1000px]">
                    <motion.div
                        initial={{ rotateX: 10, y: 30, opacity: 0 }}
                        animate={{ rotateX: 0, y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
                        className="bg-white/80 backdrop-blur-xl py-8 px-6 shadow-2xl sm:rounded-2xl border border-white/50 relative"
                        style={{ transformStyle: 'preserve-3d' }}
                    >

                        <form className="space-y-5 relative z-10" onSubmit={handleLogin}>
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
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-slate-700">Password</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowForgot(true)}
                                        className="text-xs font-semibold text-brand-600 hover:text-brand-500 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="form-input pr-10"
                                        style={{ paddingLeft: '2.5rem' }}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        onClick={() => setShowPassword(s => !s)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-3 mt-2 font-bold shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all"
                            >
                                <>Sign In <ArrowRight className="ml-2 h-4 w-4" /></>
                            </button>
                        </form>

                        {/* Info note */}
                        <div className="mt-6 border border-slate-100 rounded-xl p-3 bg-slate-50 text-center relative z-10">
                            <p className="text-xs text-slate-500">
                                Your account is created by your <span className="font-semibold text-slate-700">Fleet Manager</span>. Contact them if you need access.
                            </p>
                        </div>

                        <FormLoader loading={loading} label="Authenticating session..." />
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Login;
