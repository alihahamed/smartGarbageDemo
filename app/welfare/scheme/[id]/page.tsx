'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Lock, AlertTriangle, ShieldCheck, FileText, Check } from 'lucide-react';
import { i18nTranslations } from '@/lib/i18n';
import { fetchSchemeById, evaluateEligibility, Scheme, QuizAnswers } from '@/lib/api/welfare';
import Skeleton from '@/components/Skeleton';
import Toast from '@/components/Toast';

export default function SchemeDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'warning' | 'info'>('success');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        // Load language preference
        const savedLang = localStorage.getItem('welfare_lang') as 'en' | 'ml';
        const activeLang = savedLang === 'en' || savedLang === 'ml' ? savedLang : 'en';
        setLang(activeLang);

        // Fetch scheme detail
        const data = await fetchSchemeById(id);
        if (!data) {
          setLoading(false);
          return;
        }
        setScheme(data);

        // Load quiz answers and evaluate eligibility
        const answersStr = localStorage.getItem('welfare_quiz_answers');
        if (answersStr) {
          const quizAnswers: QuizAnswers = JSON.parse(answersStr);
          setAnswers(quizAnswers);

          const eligibility = await evaluateEligibility(quizAnswers);
          setIsEligible(eligibility.eligible.includes(id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadData();
    }
  }, [id]);

  const t = i18nTranslations[lang];

  const getCriteriaStatus = () => {
    if (!scheme || !answers) return [];

    switch (scheme.id) {
      case 'aawaas-yojana':
        return [
          { text: lang === 'en' ? 'Household income must be below ₹1 Lakh per annum.' : 'കുടുംബത്തിന്റെ വാർഷിക വരുമാനം ₹1 ലക്ഷത്തിൽ താഴെയായിരിക്കണം.', met: answers.income === 'below_1l' },
          { text: lang === 'en' ? 'Must not own any pucca house or residential land in the country.' : 'സ്വന്തമായി പക്കാ വീടോ പാർപ്പിട ഭൂമിയോ ഉണ്ടായിരിക്കരുത്.', met: answers.land === 'no_land' }
        ];
      case 'pm-kisan':
        return [
          { text: lang === 'en' ? 'Employment status must be registered as a active Farmer.' : 'തൊഴിൽ നില കർഷകനായിരിക്കണം.', met: answers.employment === 'farmer' },
          { text: lang === 'en' ? 'Total agricultural land ownership must be below 2 acres.' : 'കാർഷിക ഭൂമിയുടെ വിസ്തൃതി 2 ഏക്കറിൽ താഴെയായിരിക്കണം.', met: answers.land === 'no_land' || answers.land === 'below_2_acres' }
        ];
      case 'widow-pension':
        return [
          { text: lang === 'en' ? 'Applicant must be above 60 years of age.' : 'അപേക്ഷകന്റെ പ്രായം 60 വയസ്സിന് മുകളിലായിരിക്കണം.', met: answers.age === 'above_60' },
          { text: lang === 'en' ? 'Must be unemployed with minimal household income.' : 'തൊഴിൽരഹിതരും വരുമാനം കുറഞ്ഞവരുമായിരിക്കണം.', met: answers.employment === 'unemployed' }
        ];
      case 'disability-support':
        return [
          { text: lang === 'en' ? 'Must be currently unemployed.' : 'നിലവിൽ തൊഴിൽരഹിതനായിരിക്കണം.', met: answers.employment === 'unemployed' },
          { text: lang === 'en' ? 'Annual household income must not exceed ₹1 Lakh.' : 'കുടുംബത്തിന്റെ വാർഷിക വരുമാനം ₹1 ലക്ഷത്തിൽ താഴെയായിരിക്കണം.', met: answers.income === 'below_1l' }
        ];
      case 'student-scholarship':
        return [
          { text: lang === 'en' ? 'Student age must be under 18 years.' : 'അപേക്ഷകന്റെ പ്രായം 18 വയസ്സിൽ താഴെയായിരിക്കണം.', met: answers.age === 'below_18' },
          { text: lang === 'en' ? 'Family income must be below ₹3 Lakhs per annum.' : 'കുടുംബത്തിന്റെ വാർഷിക വരുമാനം ₹3 ലക്ഷത്തിൽ താഴെയായിരിക്കണം.', met: answers.income !== 'above_3l' },
          { text: lang === 'en' ? 'Belongs to SC, ST, or OBC category.' : 'SC, ST, അല്ലെങ്കിൽ OBC വിഭാഗത്തിൽപെട്ടവരായിരിക്കണം.', met: answers.category !== 'general' }
        ];
      case 'health-insurance':
        return [
          { text: lang === 'en' ? 'Household income must be below ₹3 Lakhs per annum.' : 'കുടുംബത്തിന്റെ വാർഷിക വരുമാനം ₹3 ലക്ഷത്തിൽ താഴെയായിരിക്കണം.', met: answers.income !== 'above_3l' },
          { text: lang === 'en' ? 'Applies to both general and reservation categories.' : 'പൊതു വിഭാഗക്കാർക്കും സംവരണ വിഭാഗക്കാർക്കും ബാധകം.', met: true }
        ];
      default:
        // Fallback for metadata criteria array
        return scheme.criteria.map(c => ({ text: c, met: isEligible }));
    }
  };

  const handleApply = () => {
    if (!isEligible || isSubmitting) return;

    setIsSubmitting(true);
    setToastMessage(lang === 'en' ? 'Submitting your application registration...' : 'നിങ്ങളുടെ അപേക്ഷ സമർപ്പിക്കുന്നു...');
    setToastType('info');

    setTimeout(() => {
      setToastMessage(
        lang === 'en' 
          ? 'Application submitted! A Welfare Officer will review your parameters shortly.' 
          : 'അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു! ഒരു വെൽഫെയർ ഓഫീസർ നിങ്ങളുടെ യോഗ്യത പരിശോധിക്കും.'
      );
      setToastType('success');
      setIsSubmitting(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
        <div className="-mx-4 -mt-8 px-6 pt-10 pb-9 rounded-b-[40px] bg-gradient-to-br from-[#8B5CF6] via-[#8B5CF6] to-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 text-center space-y-4">
          <div className="h-6 w-32 bg-white/20 rounded-md mx-auto animate-pulse" />
          <div className="h-4 w-48 bg-white/20 rounded-md mx-auto animate-pulse" />
        </div>
        <div className="flex-1 px-1 py-4 space-y-4">
          <Skeleton variant="card" count={1} />
          <Skeleton variant="list" count={1} />
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <AlertTriangle size={40} className="text-[#6D28D9]" />
        <div className="space-y-1">
          <h2 className="text-[18px] font-medium text-[#0A1C33]">Scheme Not Found</h2>
          <p className="text-[13px] font-light text-[#0A1C33]/60">
            The scheme you are looking for does not exist or has been removed.
          </p>
        </div>
        <button
          onClick={() => router.push('/welfare/results')}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white border border-[#8B5CF6]/20 text-[13px] text-[#8B5CF6] hover:bg-[#FAF6F3] font-medium transition-all shadow-sm cursor-pointer"
        >
          <span>Back to Matches</span>
        </button>
      </div>
    );
  }

  const criteria = getCriteriaStatus();

  return (
    <div className="flex-1 flex flex-col justify-between py-2 space-y-6">
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType === 'info' ? 'info' : toastType === 'warning' ? 'warning' : 'success'} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* Curved Premium Purple Header Banner (No back button) */}
      <div className="-mx-4 -mt-8 px-6 pt-10 pb-9 rounded-b-[40px] bg-gradient-to-br from-[#8B5CF6] via-[#8B5CF6] to-[#6D28D9] shadow-lg shadow-[#6D28D9]/10 flex flex-col items-center justify-center text-center space-y-3.5 relative">
        <div className="space-y-1.5 flex flex-col items-center justify-center">
          <span className="text-[11px] font-medium text-white/80 uppercase tracking-wider bg-white/10 border border-white/15 px-3 py-1 rounded-full leading-none">
            {lang === 'en' ? 'Scheme Details' : 'പദ്ധതി വിവരങ്ങൾ'}
          </span>
          <h2 className="text-[32px] font-medium text-white tracking-tight leading-tight max-w-[320px] mx-auto pt-1">
            {scheme.name}
          </h2>
        </div>
      </div>

      {/* Redesigned Scheme Description & Parameters */}
      <div className="flex-1 space-y-5 overflow-y-auto max-h-[440px] pr-1 -mr-1">
        
        {/* Eligibility Header Ticket */}
        <div className="relative rounded-[24px] bg-white border border-[#8B5CF6]/15 p-6 shadow-sm overflow-hidden flex items-center gap-4">
          {/* Status Indicator Stripe */}
          <div className={`absolute left-0 top-0 bottom-0 w-2 ${isEligible ? 'bg-gradient-to-b from-[#10B981] to-[#059669]' : 'bg-gradient-to-b from-amber-400 to-amber-500'}`} />
          
          {/* Left punch hole */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8F3F0] border-r border-[#8B5CF6]/15 z-10" />
          {/* Right punch hole */}
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F8F3F0] border-l border-[#8B5CF6]/15 z-10" />

          {/* Ticket Content */}
          <div className="flex-1 min-w-0 space-y-1 pl-3">
            <span className="text-[11px] font-medium text-[#0A1C33]/45 uppercase tracking-wider block">
              {lang === 'en' ? 'Eligibility Status' : 'യോഗ്യതാ നില'}
            </span>
            <h3 className={`text-[21px] font-medium tracking-tight leading-snug ${isEligible ? 'text-[#10B981]' : 'text-amber-600'}`}>
              {isEligible 
                ? (lang === 'en' ? 'Eligible to Apply' : 'അപേക്ഷിക്കാൻ അർഹതയുണ്ട്') 
                : (lang === 'en' ? 'Ineligible (Parameters Unmet)' : 'അർഹതയില്ല (ലഭ്യമല്ല)')}
            </h3>
          </div>

          {/* Ticket Divider */}
          <div className="h-10 border-l border-dashed border-[#8B5CF6]/20 mx-1" />

          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
            isEligible 
              ? 'bg-[#10B981]/10 border-[#10B981]/25 text-[#10B981]' 
              : 'bg-amber-50 border-amber-200 text-amber-500'
          }`}>
            {isEligible ? <CheckCircle2 size={22} /> : <Lock size={22} />}
          </div>
        </div>

        {/* Main Details Panel (About) */}
        <div className="rounded-[24px] bg-white border border-[#8B5CF6]/10 p-6 shadow-sm space-y-4 relative overflow-hidden">
          {/* Decorative Corner Gradient Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#8B5CF6]/5 to-transparent rounded-bl-full pointer-events-none" />

          <div className="space-y-1 relative">
            <h4 className="text-[13px] font-medium text-[#8B5CF6] uppercase tracking-wider leading-none flex items-center gap-2">
              <FileText size={15} />
              <span>{lang === 'en' ? 'About Scheme' : 'പദ്ധതിയെക്കുറിച്ച്'}</span>
            </h4>
          </div>
          <p className="text-[16px] font-light text-[#0A1C33]/80 leading-relaxed relative">
            {scheme.longDescription}
          </p>
        </div>

        {/* Requirements Checklist Panel */}
        <div className="rounded-[24px] bg-white border border-[#8B5CF6]/10 p-6 shadow-sm space-y-5">
          <h3 className="text-[15px] font-medium text-[#0A1C33] flex items-center gap-2 uppercase tracking-wider">
            <ShieldCheck size={18} className="text-[#8B5CF6]" />
            <span>{t.criteriaHeading}</span>
          </h3>

          <div className="space-y-4">
            {criteria.map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                  item.met 
                    ? 'border-[#10B981]/15 bg-[#10B981]/5 shadow-sm shadow-[#10B981]/5' 
                    : 'border-[#EF4444]/15 bg-[#EF4444]/5 opacity-95 shadow-sm shadow-[#EF4444]/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-0.5 ${
                  item.met 
                    ? 'bg-[#10B981]/15 border-[#10B981]/25 text-[#10B981]' 
                    : 'bg-[#EF4444]/15 border-[#EF4444]/25 text-[#EF4444]'
                }`}>
                  {item.met ? <Check size={16} strokeWidth={2.5} /> : <AlertTriangle size={15} />}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className={`text-[15px] font-light leading-relaxed ${
                    item.met ? 'text-[#0A1C33]/90' : 'text-[#0A1C33]/80'
                  }`}>
                    {item.text}
                  </p>
                  <span className={`text-[11px] font-medium uppercase tracking-wider block leading-none pt-0.5 ${
                    item.met ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {item.met ? (lang === 'en' ? 'Requirement Met' : 'യോഗ്യതയുണ്ട്') : (lang === 'en' ? 'Requirement Unmet' : 'യോഗ്യതയില്ല')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic CTA Footer button wrapped with pb-20 to clear bottom floating Navbar overlap */}
      <div className="pb-20 shrink-0">
        <button
          onClick={handleApply}
          disabled={!isEligible || isSubmitting}
          className={`w-full py-4.5 rounded-full text-[16px] font-medium transition-all text-center flex items-center justify-center gap-2 shadow-md ${
            isEligible
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white hover:opacity-95 shadow-[#8B5CF6]/20 active:scale-[0.99] cursor-pointer'
              : 'bg-[#FAF6F3] border border-[#0A1C33]/5 text-[#0A1C33]/40 cursor-not-allowed'
          }`}
        >
          {isEligible ? (
            <>
              <CheckCircle2 size={18} />
              <span>{isSubmitting ? (lang === 'en' ? 'Registering...' : 'രജിസ്റ്റർ ചെയ്യുന്നു...') : (lang === 'en' ? 'Submit Application' : 'അപേക്ഷ സമർപ്പിക്കുക')}</span>
            </>
          ) : (
            <>
              <Lock size={16} />
              <span>{lang === 'en' ? 'Locked (Parameters Not Met)' : 'അപേക്ഷിക്കാൻ കഴിയില്ല'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
