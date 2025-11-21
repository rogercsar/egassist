import React, { createContext, useContext, useState, useCallback } from 'react';
import { ErrorToast } from '../components/ErrorToast';
import { SuccessToast } from '../components/SuccessToast';

type ToastType = 'success' | 'error';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
    showError: (message: string) => void;
    showSuccess: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
    const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
            {children}
            <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div key={toast.id}>
                        {toast.type === 'error' ? (
                            <ErrorToast message={toast.message} onClose={() => removeToast(toast.id)} />
                        ) : (
                            <SuccessToast message={toast.message} onClose={() => removeToast(toast.id)} />
                        )}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
