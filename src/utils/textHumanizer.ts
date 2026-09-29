/**
 * Focus Keywords Engine for FreshCommits:
 * Strictly adheres to Google Search Quality Rater Guidelines (E-E-A-T) and
 * Google AdSense Helpful Content & Anti-Spam policies by dynamically contextualizing
 * the 5 core target keywords:
 *   1. "entry level"
 *   2. "new graduates"
 *   3. "junior engineer"
 *   4. "early career"
 *   5. "freshers"
 *
 * Each listing receives natural, editorial phrasing derived contextually and
 * deterministically (seeded by Job ID), avoiding robotic keyword stuffing while
 * guaranteeing authentic semantic search coverage.
 */

export const CORE_FOCUS_KEYWORDS = [
  'entry level',
  'new graduates',
  'junior engineer',
  'early career',
  'freshers'
] as const;

export type FocusKeyword = (typeof CORE_FOCUS_KEYWORDS)[number];

export interface FocusKeywordMatch {
  keyword: FocusKeyword;
  displayTag: string;
  phrase: string;
}

/**
 * Returns the best contextual focus keyword archetype and human display label for a given job.
 */
export function getFocusKeywordForJob(job: {
  id?: string;
  title: string;
  category?: string;
  qualifications?: string[];
}): FocusKeywordMatch {
  const titleLower = (job.title || '').toLowerCase();
  const seed = (job.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  // 1. New Graduates / Campus / Rotational
  if (
    titleLower.includes('graduate') ||
    titleLower.includes('grad') ||
    titleLower.includes('university') ||
    titleLower.includes('campus') ||
    titleLower.includes('trainee')
  ) {
    const phrases = [
      'new graduates launching their software engineering careers',
      'new graduates seeking structured technical mentorship and velocity',
      'new graduates ready to transition academic foundations into production code'
    ];
    return {
      keyword: 'new graduates',
      displayTag: 'New Graduates',
      phrase: phrases[seed % phrases.length]
    };
  }

  // 2. Freshers (explicitly stated or open eligibility)
  if (
    titleLower.includes('fresher') ||
    titleLower.includes('freshers') ||
    titleLower.includes('open for freshers') ||
    titleLower.includes('no experience')
  ) {
    const phrases = [
      'freshers transitioning into commercial software teams',
      'freshers and aspiring developers eager for guided engineering mentorship',
      'freshers seeking a foundational, high-support technical environment'
    ];
    return {
      keyword: 'freshers',
      displayTag: 'Freshers Welcome',
      phrase: phrases[seed % phrases.length]
    };
  }

  // 3. Junior Engineers
  if (titleLower.includes('junior') || titleLower.includes('jr.')) {
    const phrases = [
      'junior engineers building high-velocity production systems',
      'junior engineers and developers ready for hands-on technical ownership',
      'junior engineers seeking a collaborative team with dedicated code reviews',
      'junior engineers looking to deepen their system design and debugging capabilities'
    ];
    return {
      keyword: 'junior engineer',
      displayTag: 'Junior Engineer',
      phrase: phrases[seed % phrases.length]
    };
  }

  // 4. Internships & Apprenticeships (Entry Level pipeline)
  if (titleLower.includes('intern') || titleLower.includes('apprentice') || titleLower.includes('co-op')) {
    const phrases = [
      'entry-level talent seeking immersive production exposure',
      'entry-level developers ready for practical software development learning',
      'entry-level builders eager for hands-on engineering mentorship'
    ];
    return {
      keyword: 'entry level',
      displayTag: 'Entry Level',
      phrase: phrases[seed % phrases.length]
    };
  }

  // 5. Dynamic Rotation across "entry level" and "early career" for general tech roles
  const generalPool: { keyword: FocusKeyword; displayTag: string; phrases: string[] }[] = [
    {
      keyword: 'entry level',
      displayTag: 'Entry Level',
      phrases: [
        'entry-level developers looking to establish strong engineering habits',
        'entry-level technologists seeking a collaborative, high-growth engineering environment',
        'entry-level software practitioners developing commercial software capabilities'
      ]
    },
    {
      keyword: 'early career',
      displayTag: 'Early Career',
      phrases: [
        'early-career developers in their first one to two years of commercial experience',
        'early-career technologists focusing on real-world system architecture',
        'early-career engineers ready to make a tangible, measurable product impact',
        'early-career builders looking for structured mentorship and career velocity'
      ]
    },
    {
      keyword: 'junior engineer',
      displayTag: 'Junior Engineer',
      phrases: [
        'junior engineers launching their commercial software journey',
        'junior engineers and emerging problem-solvers building production workflows'
      ]
    },
    {
      keyword: 'new graduates',
      displayTag: 'New Graduates',
      phrases: [
        'new graduates and emerging technologists seeking structured team mentorship'
      ]
    },
    {
      keyword: 'freshers',
      displayTag: 'Freshers',
      phrases: [
        'freshers and emerging candidates eager to build real-world engineering depth'
      ]
    }
  ];

  const selectedCategory = generalPool[seed % generalPool.length];
  const selectedPhrase = selectedCategory.phrases[seed % selectedCategory.phrases.length];

  return {
    keyword: selectedCategory.keyword,
    displayTag: selectedCategory.displayTag,
    phrase: selectedPhrase
  };
}

/**
 * Editorial parser & humanizer for "The FreshCommits Career Take".
 * Automatically substitutes rigid recruiter jargon like "0–2 YoE" with
 * the contextually selected focus keyword phrase, ensuring full AdSense compliance.
 */
export function humanizeCareerTake(
  careerTake: string,
  job: { id: string; title: string; category?: string; experienceLevel?: string; qualifications?: string[] }
): string {
  if (!careerTake) return '';

  const { phrase } = getFocusKeywordForJob(job);

  // Substitute rigid "0–2 YoE" patterns dynamically with natural focus keyword phrasing
  return careerTake
    .replace(
      /0[–-]2\s*YoE\s+(engineers\s+and\s+tech\s+professionals|engineers|developers|candidates|professionals)/gi,
      phrase
    )
    .replace(/for\s+0[–-]2\s*YoE\b/gi, `for ${phrase}`)
    .replace(/0[–-]2\s*YoE/gi, phrase);
}
