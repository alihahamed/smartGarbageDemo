'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Languages, Check, CheckCircle2 } from 'lucide-react';
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
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-[#0A1C33] leading-snug">{t.q1_title}</h3>
            <div className="space-y-2.5">
              {([
                { id: 'below_18', label: t.q1_opt1 },
                { id: '18_60', label: t.q1_opt2 },
                { id: 'above_60', label: t.q1_opt3 }
              ] as const).map(opt => {
                const isSelected = answers.age === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption('age', opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-[12px] transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6] font-medium'
                        : 'border-[#FAF6F3] bg-white text-[#0A1C33]/70 hover:bg-[#FAF6F3]/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#0A1C33]/15'
                    }`}>
                      {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B5CF6]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-[#0A1C33] leading-snug">{t.q2_title}</h3>
            <div className="space-y-2.5">
              {([
                { id: 'below_1l', label: t.q2_opt1 },
                { id: '1l_3l', label: t.q2_opt2 },
                { id: 'above_3l', label: t.q2_opt3 }
              ] as const).map(opt => {
                const isSelected = answers.income === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption('income', opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-[12px] transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6] font-medium'
                        : 'border-[#FAF6F3] bg-white text-[#0A1C33]/70 hover:bg-[#FAF6F3]/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#0A1C33]/15'
                    }`}>
                      {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B5CF6]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-[#0A1C33] leading-snug">{t.q3_title}</h3>
            <div className="space-y-2.5">
              {([
                { id: 'no_land', label: t.q3_opt1 },
                { id: 'below_2_acres', label: t.q3_opt2 },
                { id: 'above_2_acres', label: t.q3_opt3 }
              ] as const).map(opt => {
                const isSelected = answers.land === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption('land', opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-[12px] transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6] font-medium'
                        : 'border-[#FAF6F3] bg-white text-[#0A1C33]/70 hover:bg-[#FAF6F3]/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#0A1C33]/15'
                    }`}>
                      {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B5CF6]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-[#0A1C33] leading-snug">{t.q4_title}</h3>
            <div className="space-y-2.5">
              {([
                { id: 'unemployed', label: t.q4_opt1 },
                { id: 'farmer', label: t.q4_opt2 },
                { id: 'govt', label: t.q4_opt3 },
                { id: 'private', label: t.q4_opt4 }
              ] as const).map(opt => {
                const isSelected = answers.employment === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption('employment', opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-[12px] transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6] font-medium'
                        : 'border-[#FAF6F3] bg-white text-[#0A1C33]/70 hover:bg-[#FAF6F3]/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#0A1C33]/15'
                    }`}>
                      {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B5CF6]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-[14px] font-medium text-[#0A1C33] leading-snug">{t.q5_title}</h3>
            <div className="space-y-2.5">
              {([
                { id: 'general', label: t.q5_opt1 },
                { id: 'obc', label: t.q5_opt2 },
                { id: 'sc', label: t.q5_opt3 },
                { id: 'st', label: t.q5_opt4 }
              ] as const).map(opt => {
                const isSelected = answers.category === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption('category', opt.id)}
                    className={`w-full p-4 rounded-2xl border text-left text-[12px] transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#8B5CF6]/5 text-[#8B5CF6] font-medium'
                        : 'border-[#FAF6F3] bg-white text-[#0A1C33]/70 hover:bg-[#FAF6F3]/50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-[16px] h-[16px] rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-[#8B5CF6] bg-[#8B5CF6]/10' : 'border-[#0A1C33]/15'
                    }`}>
                      {isSelected && <div className="w-[8px] h-[8px] rounded-full bg-[#8B5CF6]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {/* Curved Premium Purple Header Banner */}
      <div className="-mx-4 -mt-8 px-6 pt-8 pb-6 rounded-b-[40px] bg-gradient-to-br from-[#8B5CF6] via-[#8B5CF6] to-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 flex flex-col items-center justify-center text-center space-y-4">
        
        {/* Header Title with Language Switcher */}
        <div className="w-full flex items-center justify-between">
          {/* Custom Step indicator Badge */}
          <span className="inline-flex items-center text-[10px] font-medium text-white uppercase tracking-wider bg-white/10 border border-white/25 px-2.5 py-1 rounded-full leading-none">
            {t.qCount.replace('{current}', String(currentStep))}
          </span>
          
          <button
            onClick={handleLangToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-[12px] font-light hover:bg-white/25 active:scale-95 transition-all shadow-sm"
          >
            <Languages size={13} className="text-white/90" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>
        </div>

        {/* Progress Bar Container inside Banner */}
        <div className="w-full space-y-1.5 pt-2">
          <div className="w-full h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-500 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card Box */}
      <div className="flex-1 flex flex-col justify-center px-1 my-auto">
        <div className="w-full rounded-[24px] bg-white border border-[#8B5CF6]/10 p-5 shadow-sm">
          {renderQuestion()}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="grid grid-cols-2 gap-3 pt-2 shrink-0">
        <button
          onClick={handleBack}
          className="py-3.5 rounded-full border border-[#FAF6F3] bg-white text-[#0A1C33]/70 text-[12px] font-medium hover:bg-[#FAF6F3]/50 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-97 shadow-sm"
        >
          <ArrowLeft size={14} />
          <span>{t.back}</span>
        </button>

        <button
          onClick={handleNext}
          className="py-3.5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-[12px] font-medium hover:opacity-95 transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-97 shadow-md shadow-[#8B5CF6]/10"
        >
          <span>{currentStep === 5 ? t.submit : t.next}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
