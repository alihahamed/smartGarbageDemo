'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Lock, ShieldAlert, Award, FileText } from 'lucide-react';
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
      <div className="space-y-4 py-2">
        <Skeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Back button */}
      <div>
        <Link 
          href="/welfare/quiz"
          className="inline-flex items-center gap-1 text-xs text-brand-accent hover:underline"
        >
          <ArrowLeft size={14} />
          <span>{t.back}</span>
        </Link>
      </div>

      {/* Header title */}
      <div className="space-y-1 text-center">
        <h2 className="text-base font-medium text-brand-text leading-snug">
          {t.resultsTitle}
        </h2>
        <p className="text-xs font-light text-brand-text-muted leading-relaxed">
          {t.resultsSub}
        </p>
      </div>

      {/* Matching Results Lists */}
      <div className="flex-1 space-y-5 overflow-y-auto max-h-[380px] pr-1">
        
        {/* Eligible schemes */}
        <div className="space-y-3">
          <span className="text-[10px] font-medium text-brand-success uppercase tracking-wider block flex items-center gap-1">
            <CheckCircle2 size={12} />
            {t.schemeEligible} ({eligibleSchemes.length})
          </span>
          
          {eligibleSchemes.length === 0 ? (
            <div className="p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 text-center text-xs font-light text-brand-text-muted">
              No matching eligible schemes. Try checking your parameters.
            </div>
          ) : (
            eligibleSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => router.push(`/welfare/scheme/${scheme.id}`)}
                className="w-full p-4 rounded-xl border border-brand-success/20 bg-brand-success/5 hover:bg-brand-success/10 text-left transition-all space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-medium text-brand-text group-hover:text-brand-accent transition-colors leading-snug truncate pr-2 flex-1">
                    {scheme.name}
                  </h3>
                  <span className="text-[9px] font-medium text-brand-success bg-brand-success/15 px-2 py-0.5 rounded border border-brand-success/20 uppercase shrink-0">
                    Apply
                  </span>
                </div>
                <p className="text-[10px] font-light text-brand-text-muted leading-relaxed">
                  {scheme.description}
                </p>
                <span className="text-[9px] font-medium text-brand-accent group-hover:underline block pt-1">
                  {t.viewDetails} →
                </span>
              </button>
            ))
          )}
        </div>

        {/* Ineligible (locked) schemes */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-medium text-brand-text-muted uppercase tracking-wider block flex items-center gap-1">
            <Lock size={12} />
            {t.schemeLocked} ({ineligibleSchemes.length})
          </span>

          <div className="space-y-2">
            {ineligibleSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => router.push(`/welfare/scheme/${scheme.id}`)}
                className="w-full p-4 rounded-xl border border-brand-surface-alt bg-brand-surface-alt/10 hover:bg-brand-surface-alt/20 text-left opacity-60 hover:opacity-85 transition-all space-y-3 group"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xs font-medium text-brand-text group-hover:text-brand-accent transition-colors leading-snug truncate pr-2 flex-1">
                    {scheme.name}
                  </h3>
                  <Lock size={12} className="text-brand-text-muted/65 shrink-0" />
                </div>
                <p className="text-[10px] font-light text-brand-text-muted leading-relaxed">
                  {scheme.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Restart quiz */}
      <button
        onClick={() => router.push('/welfare/quiz')}
        className="w-full py-3 rounded-lg border border-brand-accent/25 bg-brand-surface-alt/45 text-brand-accent text-xs font-medium hover:bg-brand-surface-alt/80 transition-colors shadow-md"
      >
        Re-Evaluate Parameters
      </button>
    </div>
  );
}
