'use client';

import React, { useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'warning' | 'info' | 'bell';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type = 'info', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-brand-success shrink-0" size={16} />;
      case 'warning':
        return <AlertTriangle className="text-brand-warning shrink-0" size={16} />;
      case 'bell':
        return <Bell className="text-brand-accent shrink-0 animate-bounce" size={16} />;
      case 'info':
      default:
        return <Info className="text-brand-accent shrink-0" size={16} />;
    }
  };

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-accent/25 bg-brand-surface-alt text-brand-text shadow-xl shadow-black/40 animate-fade-in-down">
      {getIcon()}
      <p className="text-xs font-normal leading-relaxed text-brand-text flex-1">
        {message}
      </p>
      <button 
        onClick={onClose}
        className="text-[10px] uppercase font-medium text-brand-text-muted hover:text-brand-accent transition-colors p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        Dismiss
      </button>
    </div>
  );
}
