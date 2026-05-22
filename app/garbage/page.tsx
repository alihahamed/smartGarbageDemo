'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GarbageRoot() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('sgcs_role');
    if (role) {
      router.push(`/garbage/${role}`);
    } else {
      router.push('/garbage/login');
    }
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[12px] font-light text-brand-text-muted">Loading collection portal...</p>
    </div>
  );
}
