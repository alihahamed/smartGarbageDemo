'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Lock, AlertTriangle, ChevronRight } from 'lucide-react';
import { i18nTranslations } from '@/lib/i18n';
import { evaluateEligibility, fetchAllSchemes, Scheme, QuizAnswers } from '@/lib/api/welfare';
import Skeleton from '@/components/Skeleton';

export default function WelfareResults() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [loading, setLoading] = useState(true);
  
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);
  const [ineligibleSchemes, setIneligibleSchemes] = useState<Scheme[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Load language preference
        const savedLang = localStorage.getItem('welfare_lang') as 'en' | 'ml';
        const activeLang = savedLang === 'en' || savedLang === 'ml' ? savedLang : 'en';
        setLang(activeLang);

        // Load quiz answers
        const answersStr = localStorage.getItem('welfare_quiz_answers');
        if (!answersStr) {
          router.push('/welfare');
          return;
        }
        const answers: QuizAnswers = JSON.parse(answersStr);

        // Fetch all schemes & evaluate
        const [allSchemes, eligibility] = await Promise.all([
          fetchAllSchemes(),
          evaluateEligibility(answers)
        ]);

        const eligibleList = allSchemes.filter(s => eligibility.eligible.includes(s.id));
        const ineligibleList = allSchemes.filter(s => eligibility.ineligible.includes(s.id));

        setEligibleSchemes(eligibleList);
        setIneligibleSchemes(ineligibleList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const t = i18nTranslations[lang];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
        <div className="-mx-4 -mt-8 px-6 pt-10 pb-9 rounded-b-[40px] bg-gradient-to-br from-[#8B5CF6] via-[#8B5CF6] to-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 text-center space-y-4">
          <div className="h-6 w-32 bg-white/20 rounded-md mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-white/20 rounded-md mx-auto animate-pulse" />
        </div>
        <div className="flex-1 px-1 py-4 space-y-4">
          <Skeleton variant="card" count={2} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Curved Premium Purple Header Banner (No back button) */}
      <div className="-mx-4 -mt-8 px-6 pt-10 pb-9 rounded-b-[40px] bg-gradient-to-br from-[#8B5CF6] via-[#8B5CF6] to-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 flex flex-col items-center justify-center text-center relative">
        <div className="space-y-1.5 flex flex-col items-center justify-center">
          <h2 className="text-4xl font-medium text-white tracking-tight leading-tight max-w-[300px]">
            {t.resultsTitle}
          </h2>
          <p className="text-[15px] font-light text-[#FAF6F3]/80 leading-normal max-w-[280px]">
            {t.resultsSub}
          </p>
        </div>
      </div>

      {/* Redesigned Premium Matching Results Lists */}
      <div className="flex-1 space-y-6 overflow-y-auto max-h-[440px] pr-1 -mr-1">
        
        {/* Eligible schemes */}
        <div className="space-y-3 px-1">
          <span className="text-[10px] font-medium text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/15 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} />
            <span>{t.schemeEligible} ({eligibleSchemes.length})</span>
          </span>
          
          {eligibleSchemes.length === 0 ? (
            <div className="p-8 rounded-2xl border border-[#8B5CF6]/10 bg-white/70 backdrop-blur-sm text-center text-[12px] font-light text-[#0A1C33]/60 flex flex-col items-center justify-center min-h-[140px] space-y-2 shadow-sm">
              <AlertTriangle size={20} className="text-[#8B5CF6]/40" />
              <p className="font-medium text-[#0A1C33]/80">No Eligible Schemes Found</p>
              <p className="text-[10px] text-[#0A1C33]/50 max-w-[220px]">Based on current answers, you do not qualify for any schemes. Try checking your parameters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eligibleSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => router.push(`/welfare/scheme/${scheme.id}`)}
                  className="w-full relative pl-6 pr-4 py-4.5 rounded-2xl border border-[#8B5CF6]/15 bg-white hover:bg-[#FAF6F3]/40 text-left transition-all duration-300 flex items-center justify-between gap-4 group shadow-sm hover:shadow-md cursor-pointer overflow-hidden"
                >
                  {/* Left indicator stripe: Vibrant Emerald */}
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#10B981] to-[#059669]" />
                  
                  {/* Content area */}
                  <div className="flex-1 min-w-0 space-y-2 py-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-medium text-[#10B981] bg-[#10B981]/8 px-2 py-0.5 rounded-full border border-[#10B981]/15 uppercase tracking-wider inline-flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[#10B981] animate-pulse"></span>
                        <span>{t.schemeEligible || 'Eligible'}</span>
                      </span>
                    </div>
                    <h3 className="text-[17px] font-medium text-[#0A1C33] group-hover:text-[#6D28D9] transition-colors leading-snug truncate pr-1">
                      {scheme.name}
                    </h3>
                    <p className="text-[13px] font-light text-[#0A1C33]/65 leading-relaxed line-clamp-2">
                      {scheme.description}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8B5CF6] pt-1">
                      <span>{t.viewDetails}</span>
                      <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
                    </div>
                  </div>

                  {/* Right interactive circle CTA */}
                  <div className="w-10 h-10 rounded-full bg-[#FAF6F3] border border-[#8B5CF6]/15 flex items-center justify-center text-[#8B5CF6] shadow-sm shrink-0 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-[#8B5CF6] group-hover:to-[#6D28D9] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                    <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ineligible (locked) schemes */}
        <div className="space-y-3 pt-2 px-1">
          <span className="text-[10px] font-medium text-[#0A1C33]/50 bg-[#0A1C33]/5 border border-[#0A1C33]/8 px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
            <Lock size={11} />
            <span>{t.schemeLocked} ({ineligibleSchemes.length})</span>
          </span>

          <div className="space-y-3">
            {ineligibleSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => router.push(`/welfare/scheme/${scheme.id}`)}
                className="w-full relative pl-6 pr-4 py-4.5 rounded-2xl border border-slate-200/80 bg-white/70 opacity-75 hover:opacity-95 hover:border-[#8B5CF6]/20 text-left transition-all duration-300 flex items-center justify-between gap-4 group cursor-pointer overflow-hidden shadow-sm"
              >
                {/* Left indicator stripe: Neutral/Locked Gray */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-slate-300 to-slate-400" />
                
                {/* Content area */}
                <div className="flex-1 min-w-0 space-y-2 py-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wide inline-flex items-center gap-1">
                      <Lock size={9} />
                      <span>{t.schemeLocked || 'Locked'}</span>
                    </span>
                  </div>
                  <h3 className="text-[16px] font-medium text-slate-700 group-hover:text-[#6D28D9] transition-colors leading-snug truncate pr-1">
                    {scheme.name}
                  </h3>
                  <p className="text-[12.5px] font-light text-slate-500 leading-relaxed line-clamp-2">
                    {scheme.description}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#8B5CF6] pt-1">
                    <span>{t.viewDetails}</span>
                    <span className="group-hover:translate-x-1.5 transition-transform duration-200">→</span>
                  </div>
                </div>

                {/* Right interactive circle CTA: Gray lock icon */}
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-sm shrink-0 group-hover:scale-105 transition-all duration-300">
                  <Lock size={15} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restart quiz: Wrapped with pb-20 to clear bottom floating Navbar overlap */}
      <div className="pb-20 shrink-0">
        <button
          onClick={() => router.push('/welfare/quiz')}
          className="w-full py-4 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-[14px] font-medium hover:opacity-95 transition-all shadow-md shadow-[#8B5CF6]/10 active:scale-98 cursor-pointer text-center"
        >
          Re-Evaluate Parameters
        </button>
      </div>
    </div>
  );
}
