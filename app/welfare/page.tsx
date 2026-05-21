'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileCheck, Languages, ArrowRight } from 'lucide-react';
import { i18nTranslations } from '@/lib/i18n';

export default function WelfareHome() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('welfare_lang') as 'en' | 'ml';
      if (saved === 'en' || saved === 'ml') {
        setLang(saved);
      }
    }
  }, []);

  const handleLangToggle = () => {
    const nextLang = lang === 'en' ? 'ml' : 'en';
    setLang(nextLang);
    localStorage.setItem('welfare_lang', nextLang);
  };

  const t = i18nTranslations[lang];

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Language Switcher Float */}
      <div className="flex justify-end shrink-0">
        <button
          onClick={handleLangToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-accent/25 bg-brand-surface-alt/40 text-brand-accent text-xs font-normal hover:bg-brand-surface-alt/80 transition-colors"
        >
          <Languages size={13} />
          <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
        </button>
      </div>

      {/* Hero Welcome Container */}
      <div className="w-full rounded-2xl glass-panel p-6 border border-brand-accent/20 flex flex-col items-center text-center space-y-6 my-auto">
        <div className="p-3.5 rounded-2xl bg-brand-accent/5 border border-brand-accent/20 text-brand-accent w-fit animate-pulse">
          <FileCheck size={28} />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-medium text-brand-text leading-snug">
            {t.title}
          </h2>
          <p className="text-xs font-light text-brand-text-muted leading-relaxed max-w-[280px] mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Primary CTA button */}
      <button
        onClick={() => router.push('/welfare/quiz')}
        className="w-full py-3.5 rounded-lg bg-brand-accent text-brand-bg text-xs font-medium hover:bg-brand-accent/90 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-brand-accent/15"
      >
        <span>{t.startBtn}</span>
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
