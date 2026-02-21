import { motion, AnimatePresence } from 'framer-motion';

// ── Circular Spinner ──────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', color = 'brand' }) => {
    const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
    return (
        <svg
            className={`${sizes[size]} animate-spin`}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Track */}
            <circle
                cx="18" cy="18" r="15"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-10"
            />
            {/* Arc */}
            <path
                d="M 18 3 A 15 15 0 0 1 33 18"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className={color === 'brand' ? 'text-brand-500' : 'text-white'}
            />
        </svg>
    );
};

// ── Form Loading Overlay ──────────────────────────────────────────────────────
// Wrap this inside any form container. When `loading` is true it shows
// a frosted-glass overlay with an animated circular spinner + status text.
export const FormLoader = ({ loading, label = 'Saving data...' }) => (
    <AnimatePresence>
        {loading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-50 rounded-xl flex flex-col items-center justify-center gap-4"
                style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(6px)' }}
            >
                {/* Outer ring pulse */}
                <div className="relative flex items-center justify-center">
                    <motion.div
                        className="absolute w-16 h-16 rounded-full border-2 border-brand-200"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                        className="absolute w-12 h-12 rounded-full border-2 border-brand-300"
                        animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                    />
                    {/* Main spinner */}
                    <svg
                        className="w-10 h-10 animate-spin text-brand-500"
                        viewBox="0 0 36 36"
                        fill="none"
                    >
                        <circle cx="18" cy="18" r="15" stroke="currentColor" strokeWidth="3.5" className="opacity-10" />
                        <path
                            d="M 18 3 A 15 15 0 0 1 33 18"
                            stroke="currentColor"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <div className="flex gap-1 justify-center mt-1.5">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-brand-400"
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
);

// ── Skeleton Row (table) ──────────────────────────────────────────────────────
export const SkeletonRow = ({ columns }) => (
    <tr className="animate-pulse">
        {Array.from({ length: columns }).map((_, i) => (
            <td key={i} className="px-6 py-4 border-b border-slate-100">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
            </td>
        ))}
    </tr>
);

// ── Skeleton Card ─────────────────────────────────────────────────────────────
export const SkeletonCard = () => (
    <div className="glass-panel p-6 animate-pulse">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-slate-200 rounded-xl" />
            <div className="w-16 h-6 bg-slate-200 rounded-md" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2" />
        <div className="h-8 bg-slate-200 rounded w-1/2" />
    </div>
);

// ── Skeleton Form Fields ──────────────────────────────────────────────────────
// Shows shimmer placeholder for a form while data is being loaded
export const SkeletonForm = ({ rows = 4 }) => (
    <div className="space-y-4 animate-pulse">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i}>
                <div className="h-3.5 bg-slate-200 rounded w-28 mb-2" />
                <div className="h-10 bg-slate-100 border border-slate-200 rounded-lg w-full" />
            </div>
        ))}
        <div className="flex gap-3 pt-2">
            <div className="h-10 bg-slate-100 rounded-lg w-24" />
            <div className="h-10 bg-brand-100 rounded-lg flex-1" />
        </div>
    </div>
);
