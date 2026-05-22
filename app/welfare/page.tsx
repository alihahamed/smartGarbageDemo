'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Languages, ArrowRight } from 'lucide-react';
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

  const handleLangChange = (selectedLang: 'en' | 'ml') => {
    setLang(selectedLang);
    localStorage.setItem('welfare_lang', selectedLang);
  };

  const t = i18nTranslations[lang];

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Curved Premium Purple Header Banner (Pushed title and desc to the top, copying Service Hub style) */}
      <div className="-mx-4 -mt-8 px-6 pt-8 pb-7 rounded-b-[40px] bg-gradient-to-br from-[#8B5CF6] via-[#8B5CF6] to-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 flex flex-col items-center justify-center text-center space-y-5">
        <div className="space-y-1.5 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-medium text-white tracking-tight leading-tight max-w-[300px]">
            {t.title}
          </h2>
          <p className="text-[15px] font-light text-[#FAF6F3]/80 leading-normal max-w-[280px]">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Main Info Card and Start CTA */}
      <div className="flex-1 flex flex-col justify-center items-center px-2 space-y-7 my-auto">
        
        {/* Prominent Segmented Language Switcher (Moved and made prominent) */}
        <div className="w-full max-w-[340px] space-y-2 text-center">
          <span className="text-[10px] font-medium text-[#0A1C33]/40 uppercase tracking-wider block">
            {lang === 'en' ? 'Select Portal Language' : 'പോർട്ടൽ ഭാഷ തിരഞ്ഞെടുക്കുക'}
          </span>
          <div className="flex p-1 rounded-full bg-white border border-[#8B5CF6]/15 max-w-[220px] mx-auto shadow-sm">
            <button
              onClick={() => handleLangChange('en')}
              className={`flex-1 py-2 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white shadow-sm shadow-[#8B5CF6]/20'
                  : 'text-[#0A1C33]/60 hover:text-[#0A1C33]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLangChange('ml')}
              className={`flex-1 py-2 px-4 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                lang === 'ml'
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white shadow-sm shadow-[#8B5CF6]/20'
                  : 'text-[#0A1C33]/60 hover:text-[#0A1C33]'
              }`}
            >
              മലയാളം
            </button>
          </div>
        </div>

        {/* Square Card CTA button */}
        <button
          onClick={() => router.push('/welfare/quiz')}
          className="w-60 h-60 rounded-[32px] bg-gradient-to-b from-white via-[#E9D5FF] to-[#8B5CF6] border border-[#8B5CF6]/25 hover:opacity-95 active:scale-[0.98] transition-all flex flex-col items-center justify-center p-6 shadow-lg shadow-[#8B5CF6]/15 hover:shadow-xl hover:shadow-[#8B5CF6]/25 cursor-pointer text-center relative group overflow-hidden"
        >
          {/* Subtle hover overlay */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <span className="text-[28px] font-medium text-[#2E1065] tracking-tight leading-tight select-none max-w-[180px]">
            {t.startBtn}
          </span>
          <div className="mt-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-[#8B5CF6]/15 group-hover:scale-105 transition-transform duration-200">
            <ArrowRight size={22} className="text-[#6D28D9] group-hover:translate-x-0.5 transition-transform duration-200" />
          </div>
        </button>
      </div>
    </div>
  );
}
