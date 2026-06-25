import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

const Toast = () => {
  const { toast } = useAuth();

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div 
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-lg glass-panel px-4 py-3 border-l-4 shadow-xl border-y-0 border-r-0 border-finBorder transition-all duration-300 ${
        isSuccess ? 'border-l-finGreen text-finText' : 'border-l-red-500 text-finText'
      }`}
      style={{ borderLeftWidth: '6px' }}
    >
      {isSuccess ? (
        <CheckCircle2 className="h-5 w-5 text-finGreen" />
      ) : (
        <AlertTriangle className="h-5 w-5 text-red-500" />
      )}
      <span className="text-sm font-medium">{toast.message}</span>
    </div>
  );
};

export default Toast;
