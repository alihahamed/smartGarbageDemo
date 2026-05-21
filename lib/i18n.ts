export interface TranslationDict {
  title: string;
  subtitle: string;
  startBtn: string;
  langLabel: string;
  qCount: string;
  next: string;
  back: string;
  submit: string;
  resultsTitle: string;
  resultsSub: string;
  schemeLocked: string;
  schemeEligible: string;
  viewDetails: string;
  applyNow: string;
  criteriaHeading: string;
  closeBtn: string;
  
  // Question 1 (Age)
  q1_title: string;
  q1_opt1: string;
  q1_opt2: string;
  q1_opt3: string;

  // Question 2 (Income)
  q2_title: string;
  q2_opt1: string;
  q2_opt2: string;
  q2_opt3: string;

  // Question 3 (Land)
  q3_title: string;
  q3_opt1: string;
  q3_opt2: string;
  q3_opt3: string;

  // Question 4 (Employment)
  q4_title: string;
  q4_opt1: string;
  q4_opt2: string;
  q4_opt3: string;
  q4_opt4: string;

  // Question 5 (Category)
  q5_title: string;
  q5_opt1: string;
  q5_opt2: string;
  q5_opt3: string;
  q5_opt4: string;
}

export const i18nTranslations: Record<'en' | 'ml', TranslationDict> = {
  en: {
    title: 'Welfare Scheme Eligibility Assistant',
    subtitle: 'Check which government welfare schemes you qualify for by answering 5 simple questions.',
    startBtn: 'Begin Questionnaire',
    langLabel: 'Language',
    qCount: 'Question {current} of 5',
    next: 'Next Question',
    back: 'Back',
    submit: 'Calculate Eligibility',
    resultsTitle: 'Your Matched Schemes',
    resultsSub: 'Based on your answers, here are the schemes you are eligible to apply for.',
    schemeLocked: 'Not Eligible (Locked)',
    schemeEligible: 'Eligible',
    viewDetails: 'View Details & Criteria',
    applyNow: 'Apply Now →',
    criteriaHeading: 'Eligibility Criteria Required:',
    closeBtn: 'Close',
    
    q1_title: 'Select your age range:',
    q1_opt1: 'Below 18 years',
    q1_opt2: '18 – 60 years',
    q1_opt3: 'Above 60 years',

    q2_title: 'Select your annual family income:',
    q2_opt1: 'Below ₹1 Lakh',
    q2_opt2: '₹1 Lakh – ₹3 Lakhs',
    q2_opt3: 'Above ₹3 Lakhs',

    q3_title: 'Do you own agricultural land?',
    q3_opt1: 'No land',
    q3_opt2: 'Below 2 acres',
    q3_opt3: 'Above 2 acres',

    q4_title: 'Select your employment status:',
    q4_opt1: 'Unemployed / Household worker',
    q4_opt2: 'Farmer / Agricultural worker',
    q4_opt3: 'Government Employee',
    q4_opt4: 'Private Sector / Self-Employed',

    q5_title: 'Select your social category:',
    q5_opt1: 'General Category',
    q5_opt2: 'Other Backward Classes (OBC)',
    q5_opt3: 'Scheduled Castes (SC)',
    q5_opt4: 'Scheduled Tribes (ST)'
  },
  ml: {
    title: 'ക്ഷേമ പദ്ധതി യോഗ്യതാ സഹായി',
    subtitle: 'ചുവടെയുള്ള 5 ലളിതമായ ചോദ്യങ്ങൾക്ക് മറുപടി നൽകി നിങ്ങൾക്ക് ഏതൊക്കെ സർക്കാർ ക്ഷേമ പദ്ധതികൾക്ക് അർഹതയുണ്ടെന്ന് കണ്ടെത്തുക.',
    startBtn: 'ചോദ്യങ്ങൾ ആരംഭിക്കുക',
    langLabel: 'ഭാഷ',
    qCount: 'ചോദ്യം {current} / 5',
    next: 'അടുത്ത ചോദ്യം',
    back: 'പുറകോട്ട്',
    submit: 'യോഗ്യത പരിശോധിക്കുക',
    resultsTitle: 'നിങ്ങൾക്ക് യോജിച്ച പദ്ധതികൾ',
    resultsSub: 'നിങ്ങളുടെ വിവരങ്ങൾ അനുസരിച്ച് അപേക്ഷിക്കാൻ അർഹതയുള്ള പദ്ധതികൾ താഴെ നൽകുന്നു.',
    schemeLocked: 'അർഹതയില്ല (ലഭ്യമല്ല)',
    schemeEligible: 'അർഹതയുണ്ട്',
    viewDetails: 'കൂടുതൽ വിവരങ്ങൾ കാണുക',
    applyNow: 'അപേക്ഷിക്കുക →',
    criteriaHeading: 'ആവശ്യമായ യോഗ്യതാ മാനദണ്ഡങ്ങൾ:',
    closeBtn: 'അടയ്ക്കുക',
    
    q1_title: 'നിങ്ങളുടെ പ്രായപരിധി തിരഞ്ഞെടുക്കുക:',
    q1_opt1: '18 വയസ്സിന് താഴെ',
    q1_opt2: '18 – 60 വയസ്സ്',
    q1_opt3: '60 വയസ്സിന് മുകളിൽ',

    q2_title: 'കുടുംബത്തിന്റെ വാർഷിക വരുമാനം തിരഞ്ഞെടുക്കുക:',
    q2_opt1: '₹1 ലക്ഷത്തിൽ താഴെ',
    q2_opt2: '₹1 ലക്ഷം മുതൽ ₹3 ലക്ഷം വരെ',
    q2_opt3: '₹3 ലക്ഷത്തിന് മുകളിൽ',

    q3_title: 'നിങ്ങൾക്ക് കൃഷിഭൂമി സ്വന്തമായുണ്ടോ?',
    q3_opt1: 'ഭൂമിയില്ല',
    q3_opt2: '2 ഏക്കറിൽ താഴെ',
    q3_opt3: '2 ഏക്കറിന് മുകളിൽ',

    q4_title: 'തൊഴിൽ നില തിരഞ്ഞെടുക്കുക:',
    q4_opt1: 'തൊഴിൽരഹിതർ / ഗൃഹജോലി',
    q4_opt2: 'കർഷകൻ / കാർഷിക തൊഴിലാളി',
    q4_opt3: 'സർക്കാർ ഉദ്യോഗസ്ഥൻ',
    q4_opt4: 'സ്വകാര്യ മേഖല / സ്വയം തൊഴിൽ',

    q5_title: 'നിങ്ങളുടെ സാമൂഹിക വിഭാഗം തിരഞ്ഞെടുക്കുക:',
    q5_opt1: 'ജനറൽ വിഭാഗം',
    q5_opt2: 'മറ്റു പിന്നാക്ക വിഭാഗങ്ങൾ (OBC)',
    q5_opt3: 'പട്ടികജാതി (SC)',
    q5_opt4: 'പട്ടികവർഗ്ഗം (ST)'
  }
};
