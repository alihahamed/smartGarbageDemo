'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, HelpCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Toast from '@/components/Toast';
import { Field, FieldLabel } from '@/components/ui/field';
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
    <div className="flex-1 flex flex-col -mx-4 -mt-6 -mb-28 h-[100dvh] max-h-[100dvh] bg-brand-bg overflow-hidden select-none">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top Background Image Section */}
      <div className="relative w-full h-[22vh] min-h-[160px]">
        <img 
          src="/login-bg.png" 
          alt="Login Background" 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay to blend bottom of background image with light cream sheet */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F3F0] via-[#F8F3F0]/20 to-transparent" />
        
        {/* Back Button (Top Right) */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-6 right-6 flex items-center justify-center gap-1.5 px-3 py-[7px] rounded-full bg-white/80 border border-[#014BAA]/15 text-[#0A1C33] hover:bg-white transition-colors shadow-md min-h-[38px] backdrop-blur-sm"
          aria-label="Back to home"
        >
          <ArrowLeft size={14} className="text-[#014BAA]" />
          <span className="text-[12px] font-medium uppercase tracking-wider text-black">Back</span>
        </button>
      </div>

      {/* Curved Bottom Sheet Form container */}
      <div className="flex-1 -mt-8 relative z-10 w-full rounded-t-[32px] bg-white border-t border-[#014BAA]/10 px-6 py-8 flex flex-col justify-center shadow-[0_-8px_30px_rgba(1,75,170,0.04)]">
        <div className="max-w-[340px] mx-auto w-full flex flex-col space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-[24px] font-medium text-[#0A1C33] tracking-tight">Welcome Back</h2>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 w-full">
            <Field className="space-y-1">
              <FieldLabel className="text-[14px] font-medium uppercase tracking-wider text-black">Select Role</FieldLabel>
              <Select value={role} onValueChange={(value) => setRole(value as any)}>
                <SelectTrigger className="w-full px-4 py-3.5 rounded-xl border border-[#014BAA]/15 bg-[#FAF6F3] text-black text-[18px] focus:bg-white focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm cursor-pointer h-auto">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-[#014BAA]/15 rounded-xl text-black">
                  <SelectItem value="resident">Resident</SelectItem>
                  <SelectItem value="collector">Collector</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="ward">Ward Member</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field className="space-y-1">
              <FieldLabel className="text-[14px] font-medium uppercase tracking-wider text-black">Username</FieldLabel>
              <input
                type="text"
                placeholder="e.g. resident42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-[#014BAA]/15 bg-[#FAF6F3] text-black text-[18px] placeholder-[#6B7F96] focus:outline-none focus:bg-white focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm"
              />
            </Field>

            <Field className="space-y-1">
              <FieldLabel className="text-[14px] font-medium uppercase tracking-wider text-black">Password</FieldLabel>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 rounded-xl border border-[#014BAA]/15 bg-[#FAF6F3] text-black text-[18px] placeholder-[#6B7F96] focus:outline-none focus:bg-white focus:border-[#014BAA] focus:ring-2 focus:ring-[#014BAA]/10 transition-all font-light shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black hover:text-[#014BAA] focus:outline-none transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            {/* Submit Button (Pill shaped with trailing dark blue circle icon wrapper) */}
            <div className="flex justify-center w-full pt-2">
              <button
                type="submit"
                className="flex items-center gap-3 pl-6 pr-1.5 py-[3px] rounded-full bg-[#014BAA] text-white text-[15px] font-medium hover:opacity-90 transition-all shadow-md shadow-[#014BAA]/20 transform active:scale-95 duration-150"
              >
                <span>Access Portal</span>
                <span className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FAF6F3] text-[#014BAA] min-h-[44px] min-w-[44px]">
                  <LogIn size={18} />
                </span>
              </button>
            </div>
          </form>

          {/* Quick Autofill Tools */}
          <div className="pt-4 border-t border-[#014BAA]/8 flex flex-col items-center">
            <p className="text-[12px] font-medium text-black uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <HelpCircle size={13} className="text-[#014BAA]" />
              <span>Autofill Demo Roles</span>
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => autofill('admin')}
                className="px-6 py-3 rounded-full text-[16px] font-medium transition-all active:scale-95 bg-[#E5EFFC] text-[#014BAA] border border-[#014BAA]/15 cursor-pointer hover:bg-[#D5E5FC]"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofill('collector')}
                className="px-6 py-3 rounded-full text-[16px] font-medium transition-all active:scale-95 bg-[#FFF3E0] text-[#E65100] border border-[#FFB74D]/30 cursor-pointer hover:bg-[#FFE0B2]"
              >
                Collector
              </button>
              <button
                type="button"
                onClick={() => autofill('resident')}
                className="px-6 py-3 rounded-full text-[16px] font-medium transition-all active:scale-95 bg-[#E8F5E9] text-[#2E7D32] border border-[#81C784]/30 cursor-pointer hover:bg-[#C8E6C9]"
              >
                Resident
              </button>
              <button
                type="button"
                onClick={() => autofill('ward')}
                className="px-6 py-3 rounded-full text-[16px] font-medium transition-all active:scale-95 bg-[#F3E5F5] text-[#7B1FA2] border border-[#BA68C8]/30 cursor-pointer hover:bg-[#E1BEE7]"
              >
                Ward
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

