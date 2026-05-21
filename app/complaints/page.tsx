'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComplaintsRoot() {
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem('complaints_username');
    if (username) {
      router.push('/complaints/dashboard');
    } else {
      router.push('/complaints/login');
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-light text-brand-text-muted">Loading citizen portal...</p>
    </div>
  );
}
