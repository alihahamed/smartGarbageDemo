'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Languages, CheckSquare } from 'lucide-react';
import { i18nTranslations } from '@/lib/i18n';
import { QuizAnswers } from '@/lib/api/welfare';

export default function WelfareQuiz() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [currentStep, setCurrentStep] = useState(1);

  // Quiz state answers
  const [answers, setAnswers] = useState<QuizAnswers>({
    age: '18_60',
    income: '1l_3l',
    land: 'below_2_acres',
    employment: 'private',
    category: 'general'
  });

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

  const handleSelectOption = (key: keyof QuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save answers & navigate
      localStorage.setItem('welfare_quiz_answers', JSON.stringify(answers));
      router.push('/welfare/results');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.push('/welfare');
    }
  };

  const t = i18nTranslations[lang];

  // Render question cards by step
  const renderQuestion = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-brand-text">{t.q1_title}</h3>
            <div className="space-y-2">
              {([
                { id: 'below_18', label: t.q1_opt1 },
                { id: '18_60', label: t.q1_opt2 },
                { id: 'above_60', label: t.q1_opt3 }
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption('age', opt.id)}
                  className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    answers.age === opt.id
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-normal'
                      : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/25'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    answers.age === opt.id ? 'border-brand-accent' : 'border-brand-text-muted/30'
                  }`}>
                    {answers.age === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-brand-text">{t.q2_title}</h3>
            <div className="space-y-2">
              {([
                { id: 'below_1l', label: t.q2_opt1 },
                { id: '1l_3l', label: t.q2_opt2 },
                { id: 'above_3l', label: t.q2_opt3 }
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption('income', opt.id)}
                  className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    answers.income === opt.id
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-normal'
                      : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/25'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    answers.income === opt.id ? 'border-brand-accent' : 'border-brand-text-muted/30'
                  }`}>
                    {answers.income === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-brand-text">{t.q3_title}</h3>
            <div className="space-y-2">
              {([
                { id: 'no_land', label: t.q3_opt1 },
                { id: 'below_2_acres', label: t.q3_opt2 },
                { id: 'above_2_acres', label: t.q3_opt3 }
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption('land', opt.id)}
                  className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    answers.land === opt.id
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-normal'
                      : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/25'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    answers.land === opt.id ? 'border-brand-accent' : 'border-brand-text-muted/30'
                  }`}>
                    {answers.land === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-brand-text">{t.q4_title}</h3>
            <div className="space-y-2">
              {([
                { id: 'unemployed', label: t.q4_opt1 },
                { id: 'farmer', label: t.q4_opt2 },
                { id: 'govt', label: t.q4_opt3 },
                { id: 'private', label: t.q4_opt4 }
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption('employment', opt.id)}
                  className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    answers.employment === opt.id
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-normal'
                      : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/25'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    answers.employment === opt.id ? 'border-brand-accent' : 'border-brand-text-muted/30'
                  }`}>
                    {answers.employment === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-brand-text">{t.q5_title}</h3>
            <div className="space-y-2">
              {([
                { id: 'general', label: t.q5_opt1 },
                { id: 'obc', label: t.q5_opt2 },
                { id: 'sc', label: t.q5_opt3 },
                { id: 'st', label: t.q5_opt4 }
              ] as const).map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption('category', opt.id)}
                  className={`w-full p-3.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                    answers.category === opt.id
                      ? 'border-brand-accent bg-brand-accent/5 text-brand-accent font-normal'
                      : 'border-brand-surface-alt bg-brand-bg/40 text-brand-text-muted hover:bg-brand-surface-alt/25'
                  }`}
                >
                  <span>{opt.label}</span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    answers.category === opt.id ? 'border-brand-accent' : 'border-brand-text-muted/30'
                  }`}>
                    {answers.category === opt.id && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Header with Language select */}
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] font-medium text-brand-accent uppercase tracking-wider">
          {t.qCount.replace('{current}', String(currentStep))}
        </span>
        
        <button
          onClick={handleLangToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-accent/25 bg-brand-surface-alt/40 text-brand-accent text-xs font-normal hover:bg-brand-surface-alt/80 transition-colors"
        >
          <Languages size={13} />
          <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
        </button>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1 bg-brand-surface-alt/60 rounded-full overflow-hidden">
        <div 
          className="bg-brand-accent h-full transition-all duration-300"
          style={{ width: `${(currentStep / 5) * 100}%` }}
        />
      </div>

      {/* Question Card Body */}
      <div className="w-full rounded-2xl glass-panel p-5 border border-brand-accent/20 my-auto">
        {renderQuestion()}
      </div>

      {/* Navigation Footer */}
      <div className="grid grid-cols-2 gap-3 pt-2 shrink-0">
        <button
          onClick={handleBack}
          className="py-3 rounded-lg border border-brand-surface-alt bg-brand-bg text-brand-text-muted text-xs font-medium hover:bg-brand-surface-alt/40 transition-colors flex items-center justify-center gap-1"
        >
          <ArrowLeft size={14} />
          <span>{t.back}</span>
        </button>

        <button
          onClick={handleNext}
          className="py-3 rounded-lg bg-brand-accent text-brand-bg text-xs font-medium hover:bg-brand-accent/90 transition-colors flex items-center justify-center gap-1 shadow-lg shadow-brand-accent/15"
        >
          <span>{currentStep === 5 ? t.submit : t.next}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
