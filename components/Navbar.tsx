'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ role: string; username: string } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  // Handle drawer visibility trigger
  useEffect(() => {
    const handleDrawerChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsDrawerOpen(customEvent.detail.open);
    };
    window.addEventListener('qr-drawer-toggle', handleDrawerChange);
    return () => window.removeEventListener('qr-drawer-toggle', handleDrawerChange);
  }, []);

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
    } else if (pathname.startsWith('/complaints')) {
      localStorage.removeItem('complaints_username');
      router.push('/complaints/login');
    } else {
      router.push('/');
    }
  };

  const getAppLocation = () => {
    if (pathname.startsWith('/garbage/resident')) return 'Resident Portal';
    
    if (pathname.startsWith('/garbage/collector/map')) return 'Route Map';
    if (pathname.startsWith('/garbage/collector/house')) return 'House Check';
    if (pathname.startsWith('/garbage/collector')) return 'Collector Portal';
    
    if (pathname.startsWith('/garbage/admin/status')) return 'Live Feed';
    if (pathname.startsWith('/garbage/admin')) {
      return session?.role === 'ward' ? 'Ward Monitor' : 'Admin Panel';
    }
    
    if (pathname.startsWith('/complaints/dashboard')) return 'Complaints Hub';
    if (pathname.startsWith('/complaints/file')) return 'File Complaint';
    if (pathname.startsWith('/complaints/track')) return 'Track Complaint';
    if (pathname.startsWith('/complaints')) return 'Complaints';
    
    if (pathname.startsWith('/welfare/quiz')) return 'Welfare Survey';
    if (pathname.startsWith('/welfare/results')) return 'Scheme Matches';
    if (pathname.startsWith('/welfare/scheme')) return 'Scheme Info';
    if (pathname.startsWith('/welfare')) return 'Welfare Portal';
    
    if (pathname.startsWith('/service-hub/book')) return 'Book Service';
    if (pathname.startsWith('/service-hub/worker')) return 'Worker Profile';
    if (pathname.startsWith('/service-hub')) return 'Service Hub';
    
    return 'Dashboard';
  };

  const handleLocationClick = () => {
    if (pathname.startsWith('/garbage/resident')) {
      router.push('/garbage/resident');
    } else if (pathname.startsWith('/garbage/collector')) {
      router.push('/garbage/collector');
    } else if (pathname.startsWith('/garbage/admin')) {
      router.push('/garbage/admin');
    } else if (pathname.startsWith('/complaints')) {
      router.push('/complaints/dashboard');
    } else if (pathname.startsWith('/welfare')) {
      router.push('/welfare');
    } else if (pathname.startsWith('/service-hub')) {
      router.push('/service-hub');
    }
  };

  const isHome = pathname === '/';
  const isLogin = pathname.endsWith('/login');

  if (isHome || isLogin || isDrawerOpen) return null;

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-[320px] bg-gradient-to-t from-[#014BAA]/40 via-white/85 to-white/95 border border-[#014BAA]/40 backdrop-blur-sm rounded-full shadow-lg p-1.5 flex items-center justify-between">
      {/* Left: Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-surface-alt border border-[#014BAA]/40 text-[#014BAA] hover:bg-[#E5EFFC] active:scale-[0.93] transition-all shadow-sm min-h-[56px] min-w-[56px]"
        aria-label="Go Back"
      >
        <ArrowLeft size={22} />
      </button>

      {/* Middle: Interactive Dashboard/Console App Location Button */}
      <button
        onClick={handleLocationClick}
        className="flex-1 flex flex-col items-center justify-center px-2 select-none hover:scale-105 active:scale-95 transition-all text-center leading-none gap-0.5"
      >
        <span className="text-[11px] font-medium text-slate-400 pb-1 tracking-wider uppercase">location</span>
        <span className="text-[14px] font-bold tracking-[0.05em] text-[#014BAA] uppercase truncate max-w-[150px]">
          {getAppLocation()}
        </span>
      </button>

      {/* Right: Logout/Exit Button */}
      <button
        onClick={handleExit}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 border border-red-400 text-red-500 hover:bg-red-100 active:scale-[0.93] transition-all shadow-sm min-h-[56px] min-w-[56px]"
        aria-label="Exit Console"
      >
        <LogOut size={22} />
      </button>
    </nav>
  );
}
