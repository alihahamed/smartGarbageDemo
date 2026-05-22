'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, HelpCircle, ArrowLeft, ArrowRight } from 'lucide-react';
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
    <div className="fixed inset-0 w-full max-w-[480px] mx-auto z-50 bg-white overflow-hidden flex flex-col select-none">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Top Banner (Full width stretching to edges) */}
      <div className="w-full px-6 pt-8 pb-10 bg-gradient-to-br from-[#EF4444] to-[#B91C1C] text-white flex flex-col justify-between relative shadow-lg shadow-[#B91C1C]/15">
        
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
            Enter your credentials to file civic grievances and track live resolutions.
          </p>
        </div>
      </div>

      {/* Overlapping White Form Card (Stretches to edges to cover the sides) */}
      <div className="-mt-6 w-full rounded-t-[40px] bg-white px-6 pt-8 pb-8 flex-1 flex flex-col justify-between relative z-10 shadow-[0_-8px_30px_rgba(239,68,68,0.04)] border-t border-[#EF4444]/5">
        
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Input */}
          <div className="space-y-1.5">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-3 rounded-full border border-[#EF4444]/10 bg-[#FAF6F3] text-[#0A1C33] text-[15px] placeholder-[#6B7F96] focus:outline-none focus:bg-white focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/10 transition-all font-light shadow-sm"
            />
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-3 rounded-full border border-[#EF4444]/10 bg-[#FAF6F3] text-[#0A1C33] text-[15px] placeholder-[#6B7F96] focus:outline-none focus:bg-white focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/10 transition-all font-light shadow-sm"
            />
          </div>

          {/* Prominent Centered Autofill Badge (Directly below Password field) */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={autofill}
              className="px-5 py-1.5 rounded-full bg-[#EF4444]/8 hover:bg-[#EF4444]/12 text-[#B91C1C] text-[12px] font-medium transition-all active:scale-95 cursor-pointer border border-[#EF4444]/15 shadow-sm"
            >
              Autofill Demo Citizen
            </button>
          </div>


          {/* Redesigned Primary CTA Button (Centered & Reduced Width) */}
          <div className="flex justify-center w-full pt-2">
            <button
              type="submit"
              className="flex items-center justify-between w-[200px] pl-5 pr-1.5 py-[5px] rounded-full text-[15px] font-medium bg-gradient-to-r from-[#EF4444] to-[#B91C1C] text-white hover:opacity-95 shadow-md shadow-[#EF4444]/15 active:scale-[0.98] transition-all cursor-pointer min-h-[48px]"
            >
              <span>Sign In</span>
              <div className="w-9 h-9 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#B91C1C] shrink-0 shadow-sm border border-[#EF4444]/10">
                <LogIn size={16} />
              </div>
            </button>
          </div>
        </form>

        {/* Bottom Social Logins section */}
        <div className="space-y-4">
          {/* Divider for Social Login */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dashed border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-white text-[11px] font-medium uppercase tracking-wider text-slate-400">Or continue with</span>
          </div>

          {/* Social Buttons (Placeholders as cards) */}
          <div className="space-y-3">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => setToastMessage('Social login is placeholder only.')}
              className="w-full px-5 py-3.5 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.49 14.98 1 12 1 7.35 1 3.37 3.65 1.39 7.56l3.85 2.99c.9-2.73 3.44-4.51 6.76-4.51z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.73-4.92 3.73-8.58z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.24 14.85c-.23-.69-.36-1.42-.36-2.18s.13-1.49.36-2.18L1.39 7.56C.5 9.35 0 11.62 0 14s.5 4.65 1.39 6.44l3.85-2.99z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.04.7-2.38 1.12-3.8 1.12-3.32 0-6.14-2.29-7.14-5.37L1.47 16c2.01 3.93 6.03 6.57 10.53 6.57z"
                  />
                </svg>
                <span className="text-[14px] font-medium text-slate-700">Continue with Google</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              onClick={() => setToastMessage('Social login is placeholder only.')}
              className="w-full px-5 py-3.5 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-[14px] font-medium text-slate-700">Continue with Facebook</span>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
