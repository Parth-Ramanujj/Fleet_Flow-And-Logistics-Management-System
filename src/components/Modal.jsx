import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { FormLoader } from './Skeleton';

// Modal now accepts an optional `loading` prop.
// When loading=true, the FormLoader overlay appears inside the modal.
const Modal = ({ isOpen, onClose, title, children, loading = false, loadingLabel }) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !loading) onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose, loading]);

    const handleBackdropClick = (e) => {
        if (!loading && modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
                    onMouseDown={handleBackdropClick}
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body + FormLoader overlay */}
                        <div className="p-6 overflow-y-auto relative">
                            {children}
                            <FormLoader loading={loading} label={loadingLabel} />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
