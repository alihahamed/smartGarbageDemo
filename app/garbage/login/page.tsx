'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Toast from '@/components/Toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function GarbageLogin() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'collector' | 'resident' | 'ward'>('resident');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

    const redirectPath = role === 'ward' ? 'admin' : role;
    setToastMessage(`Login success! Redirecting to ${role === 'ward' ? 'Ward Monitor' : role} dashboard...`);

    setTimeout(() => {
      router.push(`/garbage/${redirectPath}`);
    }, 1000);
  };

  const autofill = (selectedRole: typeof role) => {
    setRole(selectedRole);
    setUsername(`${selectedRole}42`);
    setPassword('demo123');
  };

  return (
    <div className="fixed inset-0 w-full max-w-[480px] mx-auto z-50 bg-white overflow-hidden flex flex-col select-none">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top Banner (Full width stretching to edges) */}
      <div className="w-full px-6 pt-8 pb-10 bg-gradient-to-br from-[#014BAA] to-[#0A3366] text-white flex flex-col justify-between relative shadow-lg shadow-[#014BAA]/15">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => router.push('/')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center border border-white/10 shadow-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Title & Description */}
        <div className="mt-8 space-y-2">
          <h2 className="text-[32px] font-medium leading-none tracking-tight">Sign In</h2>
          <p className="text-[14px] font-light text-white/80 leading-relaxed max-w-[320px]">
            Enter your credentials to manage waste services and track collections.
          </p>
        </div>
      </div>

      {/* Overlapping White Form Card (Stretches to edges to cover the sides) */}
      <div className="-mt-6 w-full rounded-t-[40px] bg-white px-6 pt-8 pb-8 flex-1 flex flex-col justify-between relative z-10 shadow-[0_-8px_30px_rgba(1,75,170,0.04)] border-t border-[#014BAA]/5">
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Select Role Trigger */}
          <div className="space-y-1.5">
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger className="w-full px-6 py-3 rounded-full border border-[#014BAA]/10 bg-[#FAF6F3] text-[#0A1C33] text-[15px] focus:bg-white focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm cursor-pointer h-[46px]">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#014BAA]/15 rounded-2xl text-black">
                <SelectItem value="resident">Resident</SelectItem>
                <SelectItem value="collector">Collector</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="ward">Ward Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-3 rounded-full border border-[#014BAA]/10 bg-[#FAF6F3] text-[#0A1C33] text-[15px] placeholder-[#6B7F96] focus:outline-none focus:bg-white focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-6 pr-12 py-3 rounded-full border border-[#014BAA]/10 bg-[#FAF6F3] text-[#0A1C33] text-[15px] placeholder-[#6B7F96] focus:outline-none focus:bg-white focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A1C33]/60 hover:text-[#014BAA] focus:outline-none transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Redesigned Primary CTA Button (Centered & Reduced Width) */}
          <div className="flex justify-center w-full pt-4">
            <button
              type="submit"
              className="flex items-center justify-between w-[200px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#014BAA] to-[#0A3366] text-white hover:opacity-95 shadow-md shadow-[#014BAA]/15 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>Sign In</span>
              <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#014BAA] shrink-0 shadow-sm border border-[#014BAA]/10">
                <LogIn size={16} />
              </div>
            </button>
          </div>
        </form>

        {/* Bottom Social Logins replacement (3 options of autofill) */}
        <div className="space-y-4">
          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">Quick Demo Access</span>
          </div>

          {/* 3 Autofill Badges (Minimal, not loud, big enough to tap) */}
          <div className="space-y-2.5">
            {/* Resident Demo */}
            <button
              type="button"
              onClick={() => autofill('resident')}
              className="w-full px-5 py-3 rounded-full border border-[#014BAA]/8 bg-[#FAF6F3] hover:bg-[#E5EFFC] text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer min-h-[48px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-[14px] font-medium text-[#0A1C33]">Resident Demo</span>
              </div>
              <span className="text-[12px] font-medium text-slate-400 group-hover:text-[#014BAA] transition-colors">Autofill</span>
            </button>

            {/* Collector Demo */}
            <button
              type="button"
              onClick={() => autofill('collector')}
              className="w-full px-5 py-3 rounded-full border border-[#014BAA]/8 bg-[#FAF6F3] hover:bg-[#E5EFFC] text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer min-h-[48px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-[14px] font-medium text-[#0A1C33]">Collector Demo</span>
              </div>
              <span className="text-[12px] font-medium text-slate-400 group-hover:text-[#014BAA] transition-colors">Autofill</span>
            </button>

            {/* Admin Demo */}
            <button
              type="button"
              onClick={() => autofill('admin')}
              className="w-full px-5 py-3 rounded-full border border-[#014BAA]/8 bg-[#FAF6F3] hover:bg-[#E5EFFC] text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer min-h-[48px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#014BAA]"></div>
                <span className="text-[14px] font-medium text-[#0A1C33]">Admin Demo</span>
              </div>
              <span className="text-[12px] font-medium text-slate-400 group-hover:text-[#014BAA] transition-colors">Autofill</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
