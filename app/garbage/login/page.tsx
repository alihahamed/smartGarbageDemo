'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, HelpCircle, ArrowLeft } from 'lucide-react';
import Toast from '@/components/Toast';

export default function GarbageLogin() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'collector' | 'resident' | 'ward'>('resident');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setToastMessage('Please enter a username.');
      return;
    }

    // Extract user ID if resident (e.g., "resident14" -> 14)
    let userId = '1';
    if (role === 'resident') {
      const match = username.match(/\d+/);
      if (match) userId = match[0];
    }

    localStorage.setItem('sgcs_role', role);
    localStorage.setItem('sgcs_username', username);
    localStorage.setItem('sgcs_userId', userId);

    setToastMessage(`Login success! Redirecting to ${role} dashboard...`);

    setTimeout(() => {
      router.push(`/garbage/${role}`);
    }, 1000);
  };

  const autofill = (selectedRole: typeof role) => {
    setRole(selectedRole);
    setUsername(`${selectedRole}42`);
    setPassword('demo123');
  };

  return (
    <div className="flex-1 flex flex-col -mx-4 -mt-6 -mb-28 min-h-[calc(100vh+28px)] bg-[#F8FAFC] pb-24 overflow-y-auto select-none">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top Background Image Section */}
      <div className="relative w-full h-[35vh] min-h-[220px]">
        <img 
          src="/login-bg.png" 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay to blend bottom of background image with white sheet */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/20 to-transparent" />
        
        {/* Back Button (Top Right) */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 right-6 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-[#0F6441]/15 text-[#0A3D2A] hover:bg-white transition-colors shadow-md min-h-[36px] backdrop-blur-sm"
          aria-label="Back to home"
        >
          <ArrowLeft size={14} className="text-[#0F6441]" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Back</span>
        </button>
      </div>

      {/* Curved Bottom Sheet Form container */}
      <div className="flex-1 -mt-8 relative z-10 w-full rounded-t-[32px] bg-white border-t border-[#0F6441]/10 px-6 pt-8 pb-10 flex flex-col justify-between shadow-[0_-8px_30px_rgba(15,100,65,0.04)]">
        <div>
          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-medium text-[#0A3D2A] tracking-wide">Garbage Portal Sign-In</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-[#3D7A5F]">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-[#0F6441]/12 bg-[#F0F7F4] text-[#0A3D2A] text-xs focus:outline-none focus:border-[#0F6441]/50 transition-colors font-light"
              >
                <option value="resident">Resident</option>
                <option value="collector">Collector</option>
                <option value="admin">Admin</option>
                <option value="ward">Ward Member</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-[#3D7A5F]">Username</label>
              <input
                type="text"
                placeholder="e.g. resident42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#0F6441]/12 bg-[#F0F7F4] text-[#0A3D2A] text-xs placeholder-[#7BAF96] focus:outline-none focus:border-[#0F6441]/50 transition-colors font-light"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wider text-[#3D7A5F]">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#0F6441]/12 bg-[#F0F7F4] text-[#0A3D2A] text-xs placeholder-[#7BAF96] focus:outline-none focus:border-[#0F6441]/50 transition-colors font-light"
              />
            </div>

            {/* Submit Button (Pill shaped with trailing green circle icon wrapper) */}
            <div className="flex justify-center w-full pt-4">
              <button
                type="submit"
                className="flex items-center gap-3 pl-6 pr-1.5 py-1.5 rounded-full bg-[#BEF000] text-[#0A3D2A] text-xs font-medium hover:bg-[#BEF000]/90 transition-all shadow-md shadow-[#BEF000]/10 transform active:scale-95 duration-150"
              >
                <span>Access Portal</span>
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#0F6441] text-[#BEF000]">
                  <LogIn size={12} />
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Quick Autofill Tools */}
        <div className="mt-8 pt-6 border-t border-[#0F6441]/8">
          <p className="text-[10px] font-medium text-[#3D7A5F] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <HelpCircle size={11} className="text-[#0F6441]" />
            <span>Autofill Demo Roles</span>
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {(['admin', 'collector', 'resident', 'ward'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => autofill(r)}
                className="px-3.5 py-2.5 rounded-xl border border-[#0F6441]/12 bg-[#F0F7F4] hover:bg-[#E0F0E8] hover:border-[#0F6441]/30 text-left transition-all min-h-[44px]"
              >
                <div className="text-[10px] font-medium text-[#0A3D2A] capitalize">{r}</div>
                <div className="text-[9px] font-light text-[#3D7A5F] truncate">{r}42 / demo</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

