'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ role: string; username: string } | null>(null);

  // Check GCS / Complaints sessions on client
  useEffect(() => {
    const garbageRole = localStorage.getItem('sgcs_role');
    const garbageUser = localStorage.getItem('sgcs_username');
    if (garbageRole && garbageUser) {
      setSession({ role: garbageRole, username: garbageUser });
    } else {
      setSession(null);
    }
  }, [pathname]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleExit = () => {
    if (pathname.startsWith('/garbage') && session) {
      localStorage.removeItem('sgcs_role');
      localStorage.removeItem('sgcs_username');
      localStorage.removeItem('sgcs_userId');
      setSession(null);
      router.push('/garbage/login');
    } else {
      router.push('/');
    }
  };

  const isHome = pathname === '/';
  const isLogin = pathname.endsWith('/login');

  if (isHome || isLogin) return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[380px] bg-white/95 border border-[#014BAA]/10 backdrop-blur-md rounded-full shadow-lg p-1.5 flex items-center justify-between">
      {/* Left: Back Button (Royal blue color, warm cream bg, fully rounded) */}
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-brand-surface-alt border border-[#014BAA]/12 text-[#014BAA] hover:bg-[#E5EFFC] transition-colors shadow-sm min-h-[44px] min-w-[44px]"
        aria-label="Go Back"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Middle: Dashboard Text */}
      <span className="text-[10px] font-medium tracking-[0.12em] text-[#014BAA] uppercase select-none px-4 text-center">
        {pathname === '/garbage/admin/status' ? 'collection' : 'dashboard'}
      </span>

      {/* Right: Logout/Exit Button (Red text, light slate bg, fully rounded) */}
      <button
        onClick={handleExit}
        className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 transition-colors shadow-sm min-h-[44px] min-w-[44px]"
        aria-label="Exit Console"
      >
        <LogOut size={18} />
      </button>
    </nav>
  );
}
