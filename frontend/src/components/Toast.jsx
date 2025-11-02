/**
 * Toast Notification Component
 * Modern toast notifications with animations and auto-dismiss
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for exit animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-success-500 to-success-600 text-white';
      case 'error':
        return 'bg-gradient-to-r from-error-500 to-error-600 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-warning-500 to-warning-600 text-white';
      default:
        return 'bg-gradient-to-r from-primary-500 to-primary-600 text-white';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${getStyles()} max-w-md`}
        >
          <div className="flex-shrink-0">{getIcon()}</div>
          <p className="flex-1 font-medium text-sm">{message}</p>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast Container for managing multiple toasts
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
