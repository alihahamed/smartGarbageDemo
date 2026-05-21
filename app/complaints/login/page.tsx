'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, HelpCircle } from 'lucide-react';
import Toast from '@/components/Toast';

export default function ComplaintsLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setToastMessage('Please enter a username.');
      return;
    }

    localStorage.setItem('complaints_username', username.trim());
    setToastMessage('Login success! Redirecting to dashboard...');

    setTimeout(() => {
      router.push('/complaints/dashboard');
    }, 1000);
  };

  const autofill = () => {
    setUsername('citizen42');
    setPassword('demo123');
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-4">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      <div className="w-full rounded-2xl glass-panel p-6 border border-brand-accent/20">
        {/* Title */}
        <div className="text-center mb-6 space-y-2">
          <h2 className="text-lg font-medium text-brand-text">Citizen Portal Sign-In</h2>
          <p className="text-xs font-light text-brand-text-muted leading-relaxed">
            Enter your credentials to file civic grievances and track live resolutions.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-brand-text">Username</label>
            <input
              type="text"
              placeholder="e.g. resident42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-xs placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-brand-text">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text text-xs placeholder-brand-text-muted/50 focus:outline-none focus:border-brand-accent/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-3 rounded-lg bg-brand-accent text-brand-bg text-xs font-medium hover:bg-brand-accent/90 transition-colors shadow-lg shadow-brand-accent/15"
          >
            <LogIn size={14} />
            <span>Access Portal</span>
          </button>
        </form>

        {/* Quick Autofill Tools */}
        <div className="mt-6 pt-6 border-t border-brand-surface-alt">
          <button
            type="button"
            onClick={autofill}
            className="w-full px-4 py-2.5 rounded-lg border border-brand-text-muted/15 bg-brand-surface-alt/40 hover:bg-brand-surface-alt/80 hover:border-brand-accent/25 transition-all flex items-center justify-between text-left"
          >
            <div className="space-y-0.5">
              <div className="text-[10px] font-medium text-brand-text flex items-center gap-1">
                <HelpCircle size={10} className="text-brand-accent" />
                <span>Autofill Demo Citizen</span>
              </div>
              <div className="text-[9px] font-light text-brand-text-muted">citizen42 / demo</div>
            </div>
            <span className="text-[10px] font-medium text-brand-accent">Autofill →</span>
          </button>
        </div>
      </div>
    </div>
  );
}
