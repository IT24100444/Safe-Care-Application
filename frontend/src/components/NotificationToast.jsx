import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = () => {
  const { notification, showNotification } = useAuth();

  if (!notification) return null;

  const bgStyles = {
    success: 'bg-emerald-600 text-white shadow-emerald-500/20',
    error: 'bg-rose-600 text-white shadow-rose-500/20',
    info: 'bg-brand-600 text-white shadow-brand-500/20'
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 flex-shrink-0" />,
    info: <Info className="w-5 h-5 flex-shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
      <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl backdrop-blur-md border border-white/20 transition-all ${bgStyles[notification.type] || bgStyles.info}`}>
        {icons[notification.type] || icons.info}
        <span className="text-sm font-medium tracking-wide">{notification.message}</span>
        <button
          onClick={() => showNotification(null)}
          className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
