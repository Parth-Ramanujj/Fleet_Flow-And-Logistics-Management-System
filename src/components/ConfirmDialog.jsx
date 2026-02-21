import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', variant = 'danger' }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-brand-50 text-brand-500'}`}>
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <p className="text-slate-600 mb-6">{message}</p>
                <div className="flex gap-4 w-full">
                    <button
                        onClick={onClose}
                        className="flex-1 btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmDialog;
