export interface Scheme {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  criteria: string[];
}

export interface QuizAnswers {
  age: 'below_18' | '18_60' | 'above_60';
  income: 'below_1l' | '1l_3l' | 'above_3l';
  land: 'no_land' | 'below_2_acres' | 'above_2_acres';
  employment: 'unemployed' | 'farmer' | 'govt' | 'private';
  category: 'general' | 'obc' | 'sc' | 'st';
}

const SCHEMES_CATALOG: Scheme[] = [
  {
    id: 'aawaas-yojana',
    name: 'Aawaas Yojana (Housing Support)',
    description: 'Financial assistance for constructing houses for rural homeless and low-income families.',
    longDescription: 'Aawaas Yojana is a flagship government mission that addresses housing shortage among the rural poor by providing solid pucca houses. The scheme provides financial assistance of up to ₹1.2 Lakhs for plains and ₹1.3 Lakhs for hilly areas, direct-to-bank.',
    criteria: [
      'Household income must be below ₹1 Lakh per annum.',
      'Must not own any pucca house or residential land in the country.'
    ]
  },
  {
    id: 'pm-kisan',
    name: 'PM Kisan Samman Nidhi',
    description: 'Income support of ₹6,000 per year in three equal installments to small landholding farmers.',
    longDescription: 'PM Kisan is a central sector scheme to provide income support to all landholding farmers families in the country to enable them to take care of expenses related to agriculture and domestic needs. It transfers ₹6,000 annually directly into bank accounts.',
    criteria: [
      'Employment status must be registered as a active Farmer.',
      'Total agricultural land ownership must be below 2 acres.'
    ]
  },
  {
    id: 'widow-pension',
    name: 'Indira Gandhi National Widow Pension',
    description: 'Monthly pension support for senior widows living below the poverty line.',
    longDescription: 'This pension scheme provides social security to widows who are aged 40 years or above and belong to households below the poverty line (BPL). It ensures a monthly direct transfer of pension funds to assist in basic living expenses.',
    criteria: [
      'Applicant must be above 60 years of age (or aged 40-59 with verified BPL status).',
      'Must be unemployed with minimal household income.'
    ]
  },
  {
    id: 'disability-support',
    name: 'Disability Support Scheme',
    description: 'Financial aid and assistive devices for persons with 40% or more disability.',
    longDescription: 'The Disability Support Scheme aims to empower differently-abled citizens by providing monthly welfare pensions, scholarship grants for education, and free assistive devices. It is targeted at individuals with certified disability percentages.',
    criteria: [
      'Must be currently unemployed.',
      'Annual household income must not exceed ₹1 Lakh.'
    ]
  },
  {
    id: 'student-scholarship',
    name: 'Post-Matric Scholarship Scheme',
    description: 'Scholarships covering tuition and maintenance fees for SC/ST/OBC students.',
    longDescription: 'A comprehensive educational support program that covers tuition, enrollment fees, and provides monthly maintenance allowances for students pursuing higher secondary or university degrees.',
    criteria: [
      'Student age must be under 18 years (or enrolled in active full-time courses).',
      'Family income must be below ₹3 Lakhs per annum.',
      'Belongs to SC, ST, or OBC category.'
    ]
  },
  {
    id: 'health-insurance',
    name: 'Karunya Health Insurance (Ayushman Bharat)',
    description: 'Free secondary and tertiary healthcare coverage up to ₹5 Lakhs per family per year.',
    longDescription: 'Karunya Health Scheme offers cashless medical treatment across empaneled public and private hospitals. It covers diagnostics, surgery, hospitalization costs, and pre-existing conditions from day one.',
    criteria: [
      'Household income must be below ₹3 Lakhs per annum.',
      'Applies to both general and reservation categories.'
    ]
  }
];

export async function fetchAllSchemes(): Promise<Scheme[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return SCHEMES_CATALOG;
}

export async function fetchSchemeById(id: string): Promise<Scheme | null> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return SCHEMES_CATALOG.find((s) => s.id === id) || null;
}

export async function evaluateEligibility(answers: QuizAnswers): Promise<{ eligible: string[]; ineligible: string[] }> {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const eligible: string[] = [];
  const ineligible: string[] = [];

  // Decision Tree Logic
  SCHEMES_CATALOG.forEach((scheme) => {
    let isEligible = false;

    switch (scheme.id) {
      case 'aawaas-yojana':
        isEligible = answers.income === 'below_1l' && answers.land === 'no_land';
        break;
      case 'pm-kisan':
        isEligible = answers.employment === 'farmer' && (answers.land === 'no_land' || answers.land === 'below_2_acres');
        break;
      case 'widow-pension':
        isEligible = answers.age === 'above_60' && answers.employment === 'unemployed';
        break;
      case 'disability-support':
        isEligible = answers.employment === 'unemployed' && answers.income === 'below_1l';
        break;
      case 'student-scholarship':
        isEligible = answers.age === 'below_18' && answers.income !== 'above_3l' && answers.category !== 'general';
        break;
      case 'health-insurance':
        isEligible = answers.income !== 'above_3l';
        break;
    }

    if (isEligible) {
      eligible.push(scheme.id);
    } else {
      ineligible.push(scheme.id);
    }
  });

  return { eligible, ineligible };
}
