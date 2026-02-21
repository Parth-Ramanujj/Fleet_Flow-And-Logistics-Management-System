import { Clock, CheckCircle2, AlertTriangle, Truck, Wrench, Ban } from 'lucide-react';

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'available':
            return (
                <span className="status-pill bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Available
                </span>
            );
        case 'on_trip':
        case 'dispatched':
            return (
                <span className="status-pill bg-brand-50 text-brand-600 border border-brand-200">
                    <Truck className="w-3 h-3" />
                    On Trip
                </span>
            );
        case 'in_shop':
        case 'in_progress':
            return (
                <span className="status-pill bg-amber-50 text-amber-600 border border-amber-200">
                    <Wrench className="w-3 h-3" />
                    In Shop
                </span>
            );
        case 'retired':
            return (
                <span className="status-pill bg-slate-100 text-slate-500 border border-slate-200">
                    <Ban className="w-3 h-3" />
                    Retired
                </span>
            );
        case 'completed':
            return (
                <span className="status-pill bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                </span>
            );
        case 'draft':
            return (
                <span className="status-pill bg-slate-100 text-slate-600 border border-slate-200">
                    <Clock className="w-3 h-3" />
                    Draft
                </span>
            );
        default:
            return (
                <span className="status-pill bg-slate-100 text-slate-600 border border-slate-200">
                    {status}
                </span>
            );
    }
};

export default StatusBadge;
