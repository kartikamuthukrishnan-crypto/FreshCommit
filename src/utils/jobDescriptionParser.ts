/**
 * LinkedIn-Grade Job Description Parser & Formatter
 *
 * Transforms raw, messy, or flattened ATS text dumps (from Workday, Taleo, Greenhouse, JobPulse, etc.)
 * into beautifully structured, scannable, and semantic LinkedIn-style job requisitions.
 *
 * Core Capabilities:
 *  1. Complete HTML Entity Decoding (&#34; -> ", &amp; -> &, &#8217; -> ', &#43; -> +, etc.)
 *  2. ATS Tracking Header Extraction & Sanitization (isolates Job Tracking ID, Travel, Education, etc.)
 *  3. Intelligent Section Segmentation (About Role, Responsibilities, Qualifications, Preferred, Benefits, EEO)
 *  4. Inlined Bullet Point Recovery (splits run-on bullet sentences without lost context)
 *  5. Curated Benefits & Perks Extraction (401k, Health/Dental/Vision, PTO, Stock, Tuition)
 *  6. Preserves Natural Typographic Hierarchy with Zero AI Slop
 */

export interface ParsedJobDescription {
  aboutRole: string[];
  aboutCompany: string[];
  companyCulture?: string[];
  responsibilities: string[];
  qualifications: string[];
  preferredQualifications: string[];
  benefits: string[];
  compensationText?: string;
  eeoStatement?: string;
  atsMetadata: { label: string; value: string }[];
  rawCleaned: string;
}

/**
 * Exhaustively decodes all HTML entities (named, decimal, hex)
 * Eliminates ugly bugs like &#34;safe-to-fail&#34; or &amp;quot;.
 */
export function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  let str = String(input);

  // Common named entities
  const namedEntities: Record<string, string> = {
    '&quot;': '"',
    '&apos;': "'",
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&nbsp;': ' ',
    '&bull;': '•',
    '&middot;': '·',
    '&ndash;': '–',
    '&mdash;': '—',
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&times;': '×',
    '&divide;': '÷',
    '&euro;': '€',
    '&pound;': '£',
    '&yen;': '¥',
    '&sect;': '§',
    '&deg;': '°'
  };

  for (const [entity, replacement] of Object.entries(namedEntities)) {
    if (str.includes(entity)) {
      str = str.replaceAll(entity, replacement);
    }
  }

  // Decimal entities: &#34; &#39; &#43; &#8217; etc.
  str = str.replace(/&#(\d+);/g, (_, dec) => {
    const code = parseInt(dec, 10);
    if (!isNaN(code)) {
      try {
        return String.fromCharCode(code);
      } catch {
        return '';
      }
    }
    return '';
  });

  // Hex entities: &#x22; &#x27; etc.
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    const code = parseInt(hex, 16);
    if (!isNaN(code)) {
      try {
        return String.fromCharCode(code);
      } catch {
        return '';
      }
    }
    return '';
  });

  // Second pass in case of double encoding (e.g. &amp;#34;)
  if (str.includes('&quot;') || str.includes('&#34;') || str.includes('&amp;')) {
    for (const [entity, replacement] of Object.entries(namedEntities)) {
      if (str.includes(entity)) str = str.replaceAll(entity, replacement);
    }
    str = str.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)) || '');
  }

  return str;
}

/**
 * Extracts raw ATS tracking header metadata (e.g., Kratos, Taleo, Workday dumps)
 * into a structured key-value array and returns the remaining prose without the clutter.
 */
export function extractAtsHeaderMetadata(rawText: string): {
  metadata: { label: string; value: string }[];
  cleanedText: string;
} {
  const metadata: { label: string; value: string }[] = [];
  let cleaned = rawText;

  // Detect ATS tracking headers like:
  // "Job Tracking ID : 85347-370525Job Location : Colorado Springs, CO USJob Level : Entry Level..."
  if (/^(?:Job Tracking ID|Requisition (?:ID|Number)|Req ID)\s*:/i.test(cleaned)) {
    const knownKeys = [
      'Job Tracking ID',
      'Job Location',
      'Location',
      'Job Level',
      'Level of Education',
      'Education',
      'Job Type',
      'Date Updated',
      'Starting Date',
      'Travel Requirement',
      'Compensation',
      'Department',
      'Capabilities',
      'Salary',
      'Years Of Experience',
      'Security Clearance',
      'Clearance Level'
    ];
    const keyPattern = knownKeys.map((k) => k.replace(/\s+/g, '\\s+')).join('|');
    const regex = new RegExp(`(${keyPattern})\\s*:\\s*([^:]+?)(?=(?:${keyPattern})\\s*:|Readiness Delivered|\\n|$)`, 'gi');
    let match: RegExpExecArray | null;
    while ((match = regex.exec(cleaned)) !== null) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (label && value) {
        metadata.push({ label, value });
      }
    }

    // Strip the matched header block from the beginning of text
    cleaned = cleaned
      .replace(new RegExp(`^(?:${keyPattern})\\s*:[\\s\\S]*?(?:Readiness Delivered\\.?|\\.\\s*(?=[A-Z]))`, 'i'), '')
      .trim();
  }

  // Strip standalone single ATS line artifacts at start
  cleaned = cleaned.replace(/^(?:Job Requisition ID|Req ID|Requisition Number)\s*:\s*[A-Za-z0-9_-]+\s*/gi, '').trim();

  // Strip ATS hashtag artifacts like #Li-hybrid, #Li-Onsite, #Li-Remote
  cleaned = cleaned.replace(/#Li-(?:hybrid|onsite|remote)\b/gi, '').trim();

  // Strip common ATS noise artifacts
  cleaned = cleaned.replace(/user\?focused/g, 'user-focused');
  cleaned = cleaned.replace(/\b01K\s+plan\b/gi, '401(k) plan');
  cleaned = cleaned.replace(/\b01\(k\)\b/gi, '401(k)');
  cleaned = cleaned.replace(/\b\+\s*years\s+of\s+experience\b/gi, '1+ years of experience');

  return { metadata, cleanedText: cleaned };
}

/**
 * Splits run-on concatenated sentences into clean bullet points when ATS flattening removed newlines.
 */
export function splitInlinedBullets(text: string): string[] {
  if (!text) return [];

  // Strip leading punctuation/bullets
  let clean = text.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim();

  // If already contains newlines, split on newline
  const lines = clean.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 2) {
    return lines
      .map((l) => l.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((l) => l.length >= 6);
  }

  // Smart regex delimiters to split un-bulleted, concatenated criteria
  const candidateDelimiters = [
    // Explicit bullet symbols
    /(?:^|[.!?\n])\s*(?:[•\-\*–—]|\d+\.)\s*/g,
    // Typical action verb starters (with or without preceding period)
    /\s+(?=(?:Write\b|Deploy\b|Work\b|A mix of\b|Investigate\b|Receive\b|A successful employee\b|Have proven\b|Are quick learners\b|Have knowledge\b|Build simple\b|Strict adherence\b|Willingness to commit\b))/g,
    // Typical qualification starters (with or without preceding period)
    /\s+(?=(?:Understanding of basic|Excellent problem-solving|(?:B\.?S\.?\s+or\s+M\.?S\.?|B\.?S\.?|M\.?S\.?|Bachelor'?s|Master'?s|Ph\.?D\.?)\b|Proficiency (?:with|in|writing)|Familiarity with|Desire to|Experience (?:with|in|working)|Knowledge of|Ability to|Strong understanding|Hands-on|Must have|Prior work|Eligible|US Citizen|Secret clearance|\d+\+?\s+years of experience)\b)/g,
    // Preferred qualifications
    /\s+(?=(?:Proficiency with|Familiarity with|Knowledge of|Any experience with|Experience with|Lacking RF|Bonus points|Nice to have)\b)/g
  ];

  let bestSplit = [clean];

  for (const regex of candidateDelimiters) {
    const parts = clean.split(regex).map((p) => p.trim()).filter(Boolean);
    if (parts.length > bestSplit.length && parts.every((p) => p.length >= 6)) {
      bestSplit = parts;
    }
  }

  return bestSplit
    .map((item) => item.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
    .filter((item) => item.length >= 6);
}

/**
 * Extracts benefits and perks keywords from job description
 */
export function extractBenefits(text: string): string[] {
  const perks: string[] = [];
  const low = text.toLowerCase();

  const standardBenefits: { key: string; check: RegExp; label: string }[] = [
    { key: '401k', check: /(?:401\s*\(?k\)?|401k|01k|retirement plan|pension)/i, label: '401(k) Retirement Savings Plan' },
    { key: 'health', check: /(?:health|medical)\s+(?:insurance|coverage|benefits|plans?)/i, label: 'Comprehensive Medical Coverage' },
    { key: 'dental_vision', check: /(?:dental|vision)\s+(?:insurance|coverage|plans?)/i, label: 'Dental & Vision Insurance' },
    { key: 'pto', check: /(?:paid\s+time[- ]off|pto|vacation days|generous pto|holidays)/i, label: 'Paid Time Off (PTO) & Holidays' },
    { key: 'espp', check: /(?:espp|employee stock purchase|equity|stock options)/i, label: 'Employee Stock Purchase (ESPP) & Equity' },
    { key: 'tuition', check: /(?:tuition|education reimbursement|learning budget|professional development)/i, label: 'Tuition & Professional Learning Budget' },
    { key: 'parental', check: /(?:parental leave|maternity|paternity)/i, label: 'Paid Parental Leave' },
    { key: 'life_insurance', check: /(?:life insurance|disability insurance|add coverage)/i, label: 'Life & Disability Insurance' },
    { key: 'remote_flex', check: /(?:flexible work|remote stipend|home office|flexible paid time off)/i, label: 'Flexible Work & Work/Life Autonomy' }
  ];

  for (const item of standardBenefits) {
    if (item.check.test(low)) {
      perks.push(item.label);
    }
  }

  return perks;
}

/**
 * Splits a continuous block of sentences into readable 2-3 sentence paragraphs.
 * Eliminates the ugly single 400-word block on modern screens.
 */
export function formatProseParagraphs(text: string): string[] {
  if (!text) return [];

  // If already formatted with double newlines, respect existing paragraphs
  const rawParagraphs = text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (rawParagraphs.length >= 2) {
    return rawParagraphs;
  }

  // If it is a single dense block of sentences, group into 2-3 sentences per paragraph
  const sentences = text
    .match(/[^.!?]+[.!?]+(?:\s+|$)/g)
    ?.map((s) => s.trim())
    .filter(Boolean) || [text];

  if (sentences.length <= 3) {
    return [text.trim()];
  }

  const paragraphs: string[] = [];
  let currentGroup: string[] = [];

  for (let i = 0; i < sentences.length; i++) {
    currentGroup.push(sentences[i]);
    // Group every 2 or 3 sentences into a clean paragraph
    if (currentGroup.length >= 3 || (currentGroup.length >= 2 && currentGroup.join(' ').length > 250)) {
      paragraphs.push(currentGroup.join(' '));
      currentGroup = [];
    }
  }

  if (currentGroup.length > 0) {
    paragraphs.push(currentGroup.join(' '));
  }

  return paragraphs;
}

/**
 * Main parser function: takes any raw job posting and parses it into
 * a modern, LinkedIn-grade structured representation.
 */
export function parseJobDescription(
  rawInput: string,
  existingResponsibilities: string[] = [],
  existingQualifications: string[] = []
): ParsedJobDescription {
  // 1. Decode all HTML entities and sanitize
  let text = decodeHtmlEntities(rawInput || '');

  // Strip excessive spaces within lines, but preserve newlines
  text = text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 2. Extract ATS Tracking Header
  const { metadata: atsMetadata, cleanedText } = extractAtsHeaderMetadata(text);
  text = cleanedText;

  // 3. Separate Equal Opportunity / Legal Disclaimers at the end
  let eeoStatement: string | undefined;
  const eeoTriggers = [
    /(?:equal opportunity employer|eeo\/aa|equal employment opportunity|disability accessibility accommodation|pay transparency\b|affirmative action employer)[\s\S]*$/i
  ];

  for (const trigger of eeoTriggers) {
    const match = text.match(trigger);
    if (match && match.index !== undefined && match.index > 80) {
      eeoStatement = match[0].trim();
      text = text.substring(0, match.index).trim();
      break;
    }
  }

  // 4. Extract Compensation statements if inlined in description
  let compensationText: string | undefined;
  const compMatch = text.match(
    /(?:salary range|base pay for this position|grade-based pay range|compensation)\s*[:\-]?\s*(?:\$|€|£|CA\$)[0-9,]+(?:\.[0-9]{2})?\s*(?:to|[-–])\s*(?:\$|€|£|CA\$)[0-9,]+(?:\.[0-9]{2})?(?:[^\n.]*\.)?/i
  );
  if (compMatch) {
    compensationText = compMatch[0].trim();
  }

  // 5. Detect distinct sections using flexible section headers:
  const sectionDelimiters = [
    {
      type: 'about_role',
      regex: /(?:^|\s+)(?:Who We Need|About (?:the )?(?:Role|Job)|The Opportunity|This Opportunity|Position Summary|Role Overview|What You Will Do)(?:[\.:\s]|$)/i
    },
    {
      type: 'responsibilities',
      regex: /(?:^|\s+)(?:Key Responsibilities|Responsibilities|Core Duties|What You'll Do|Position Responsibilities)(?:[\.:\s]|$)/i
    },
    {
      type: 'qualifications',
      regex: /(?:^|\s+)(?:Experience and Skills|Key Qualifications|Basic Qualifications|Minimum Qualifications|Qualifications & Experience|Requirements|What We Look For)(?:[\.:\s]|$)/i
    },
    {
      type: 'preferred',
      regex: /(?:^|\s+)(?:Preferred Skills(?:\/Experience)?|Preferred Qualifications|Desired Skills|Bonus Points|Nice to Have)(?:[\.:\s]|$)/i
    },
    {
      type: 'culture',
      regex: /(?:^|\s+)(?:Be a part of building something special|About (?:the )?Company|Company Culture|Our Values)(?:[\.:\s]|$)/i
    },
    {
      type: 'benefits',
      regex: /(?:^|\s+)(?:Job Benefits|Great benefits package|Benefits & Perks|What We Offer|Compensation & Benefits)(?:[\.:\s]|$)/i
    },
    {
      type: 'compensation_sec',
      regex: /(?:^|\s+)(?:The grade-based pay range|The base pay for this position|Salary Range)(?:[\.:\s]|$)/i
    }
  ];

  // Segmenting the text
  let aboutCompanyText = '';
  let aboutRoleText = '';
  let responsibilitiesText = '';
  let qualificationsText = '';
  let preferredText = '';
  let cultureText = '';
  let benefitsText = '';

  // Look for section indices
  const foundSections: { type: string; index: number; length: number }[] = [];
  for (const delimiter of sectionDelimiters) {
    const m = text.match(delimiter.regex);
    if (m && m.index !== undefined) {
      foundSections.push({ type: delimiter.type, index: m.index, length: m[0].length });
    }
  }

  // Sort sections by position in text
  foundSections.sort((a, b) => a.index - b.index);

  if (foundSections.length > 0) {
    // Text before the first matched section is About Company / Intro
    aboutCompanyText = text.substring(0, foundSections[0].index).trim();

    for (let i = 0; i < foundSections.length; i++) {
      const current = foundSections[i];
      const start = current.index + current.length;
      const end = i + 1 < foundSections.length ? foundSections[i + 1].index : text.length;
      const chunk = text.substring(start, end).trim();

      if (current.type === 'about_role') {
        aboutRoleText = chunk;
      } else if (current.type === 'responsibilities') {
        responsibilitiesText = chunk;
      } else if (current.type === 'qualifications') {
        qualificationsText = chunk;
      } else if (current.type === 'preferred') {
        preferredText = chunk;
      } else if (current.type === 'culture') {
        cultureText = chunk;
      } else if (current.type === 'benefits') {
        benefitsText = chunk;
      } else if (current.type === 'compensation_sec') {
        if (!compensationText) {
          compensationText = chunk.split('.')[0] + '.';
        }
      }
    }
  } else {
    // No explicit section headers found; check for implicit action-verb block transition
    aboutCompanyText = text;
  }

  // If responsibilities section was not explicitly separated, check if aboutRole contains action sentences
  if (!responsibilitiesText && aboutRoleText) {
    const actionSplit = aboutRoleText.split(/(?=\b(?:Have proven experience|Write software that controls|Deploy code for|Work directly in-person)\b)/i);
    if (actionSplit.length > 1) {
      aboutRoleText = actionSplit[0].trim();
      responsibilitiesText = actionSplit[1].trim();
    }
  }

  // If aboutCompany still has action sentences and no responsibilities were parsed (e.g. Kratos)
  if (!responsibilitiesText && aboutCompanyText) {
    const actionSplit = aboutCompanyText.split(/(?=\b(?:Write software that controls|Deploy code for|Work directly in-person)\b)/i);
    if (actionSplit.length > 1) {
      aboutCompanyText = actionSplit[0].trim();
      responsibilitiesText = actionSplit[1].trim();
    }
  }

  // Combine responsibilities: structured from argument + newly parsed
  const parsedResponsibilities = responsibilitiesText ? splitInlinedBullets(responsibilitiesText) : [];
  const finalResponsibilities =
    existingResponsibilities.length >= 3
      ? existingResponsibilities
      : parsedResponsibilities.length > 0
      ? parsedResponsibilities
      : existingResponsibilities;

  // Combine qualifications
  const parsedQualifications = qualificationsText ? splitInlinedBullets(qualificationsText) : [];
  const finalQualifications =
    existingQualifications.length >= 3
      ? existingQualifications
      : parsedQualifications.length > 0
      ? parsedQualifications
      : existingQualifications;

  const finalPreferred = preferredText ? splitInlinedBullets(preferredText) : [];

  // Parse Benefits
  const perks = extractBenefits(benefitsText ? `${benefitsText} ${text}` : text);

  // Format paragraphs for About Company and About Role into clean 2-3 sentence chunks
  const aboutCompanyParas = formatProseParagraphs(aboutCompanyText);
  const aboutRoleParas = formatProseParagraphs(aboutRoleText);
  const cultureParas = cultureText ? formatProseParagraphs(cultureText) : undefined;

  return {
    aboutRole: aboutRoleParas.length > 0 ? aboutRoleParas : aboutCompanyParas.slice(1),
    aboutCompany: aboutRoleParas.length > 0 ? aboutCompanyParas : [aboutCompanyParas[0] || ''],
    companyCulture: cultureParas,
    responsibilities: finalResponsibilities,
    qualifications: finalQualifications,
    preferredQualifications: finalPreferred,
    benefits: perks,
    compensationText,
    eeoStatement,
    atsMetadata,
    rawCleaned: text
  };
}
