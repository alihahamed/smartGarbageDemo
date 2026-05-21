'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-bg/85 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-[440px] rounded-2xl glass-panel border border-brand-accent/25 overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-4 border-b border-brand-surface-alt bg-brand-surface-alt/45">
          <div className="min-w-0">
            <h3 className="text-base font-medium text-brand-text truncate">{title}</h3>
            {subtitle && (
              <p className="text-xs font-light text-brand-text-muted mt-0.5 leading-relaxed truncate">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-11 h-11 rounded-lg border border-brand-text-muted/20 bg-brand-bg text-brand-text-muted hover:text-brand-accent hover:border-brand-accent/30 transition-colors"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
