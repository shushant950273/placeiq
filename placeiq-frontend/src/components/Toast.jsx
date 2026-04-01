import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Premium slide-in toast notification
 * type: 'success' | 'error' | 'warning' | 'info'
 * Props: message, type, onClose, duration (ms, default 4000)
 */

const styles = {
  success: {
    bar:  'bg-emerald-500',
    icon: <CheckCircle size={20} className="text-emerald-500 shrink-0" />,
    title:'Success',
  },
  error: {
    bar:  'bg-red-500',
    icon: <XCircle size={20} className="text-red-500 shrink-0" />,
    title:'Error',
  },
  warning: {
    bar:  'bg-amber-500',
    icon: <AlertTriangle size={20} className="text-amber-500 shrink-0" />,
    title:'Warning',
  },
  info: {
    bar:  'bg-blue-500',
    icon: <Info size={20} className="text-blue-500 shrink-0" />,
    title:'Info',
  },
};

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  const [progress, setProgress] = useState(100);
  const s = styles[type] || styles.info;

  /* Progress bar */
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev - (100 / (duration / 50));
        if (next <= 0) { onClose?.(); return 0; }
        return next;
      });
    }, 50);

    const timer = setTimeout(() => onClose?.(), duration);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ x: 120, opacity: 0, scale: 0.95 }}
      animate={{ x: 0,   opacity: 1, scale: 1 }}
      exit={{   x: 120, opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden w-[340px] max-w-[calc(100vw-2rem)]"
      style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.12)' }}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar} rounded-l-2xl`} />

      {/* Content */}
      <div className="flex items-start gap-3 px-5 py-4 pl-6">
        <div className="mt-0.5">{s.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 mb-0.5">{s.title}</p>
          <p className="text-sm text-slate-500 font-medium leading-snug">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5 shrink-0 p-0.5 rounded-lg hover:bg-slate-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-slate-100 mx-4 mb-3 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${s.bar} rounded-full`}
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </motion.div>
  );
};

/**
 * ToastContainer — wraps multiple toasts and handles AnimatePresence
 * Usage: place at root level or top-level of page
 */
export const ToastContainer = ({ toasts, removeToast }) => (
  <div className="fixed top-5 right-5 z-[200] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence mode="sync">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast
            message={t.message}
            type={t.type}
            onClose={() => removeToast(t.id)}
          />
        </div>
      ))}
    </AnimatePresence>
  </div>
);

export default Toast;
