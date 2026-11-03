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

  // Patterns frequently found at the beginning of ATS job feeds:
  // e.g. "Job Tracking ID : 85347-370525Job Location : Colorado Springs... Readiness Delivered."
  const atsHeaderRegex = /^(?:Job Tracking ID\s*:\s*([^:]+?))?(?:Job Location\s*:\s*([^:]+?))?(?:Job Level\s*:\s*([^:]+?))?(?:Level of Education\s*:\s*([^:]+?))?(?:Job Type\s*:\s*([^:]+?))?(?:Date Updated\s*:\s*([^:]+?))?(?:Starting Date\s*:\s*([^:]+?))?(?:Travel Requirement\s*:\s*([^:]+?))?(?:Compensation\s*:\s*([^:]+?))?(?:Capabilities\s*:\s*([^:]+?))?(?:Salary\s*:\s*([^:]+?))?(?:Years Of Experience\s*:\s*(\d+))?\s*(?:Readiness Delivered\.)?/i;

  // Test if text starts with "Job Tracking ID :" or multiple of these tags
  if (/^Job Tracking ID\s*:/i.test(cleaned) || /^Requisition (?:ID|Number)\s*:/i.test(cleaned)) {
    // Extract individual tokens
    const tokens = [
      { key: 'Job Tracking ID', regex: /Job Tracking ID\s*:\s*([^:\n]+?)(?=(?:Job Location|Job Level|Level of Education|Job Type|Date Updated|Starting Date|Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Location', regex: /Job Location\s*:\s*([^:\n]+?)(?=(?:Job Level|Level of Education|Job Type|Date Updated|Starting Date|Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Experience Level', regex: /Job Level\s*:\s*([^:\n]+?)(?=(?:Level of Education|Job Type|Date Updated|Starting Date|Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Education', regex: /Level of Education\s*:\s*([^:\n]+?)(?=(?:Job Type|Date Updated|Starting Date|Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Job Type', regex: /Job Type\s*:\s*([^:\n]+?)(?=(?:Date Updated|Starting Date|Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Date Updated', regex: /Date Updated\s*:\s*([^:\n]+?)(?=(?:Starting Date|Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Starting Date', regex: /Starting Date\s*:\s*([^:\n]+?)(?=(?:Travel Requirement|Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Travel Requirement', regex: /Travel Requirement\s*:\s*([^:\n]+?)(?=(?:Compensation|Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Compensation Note', regex: /Compensation\s*:\s*([^:\n]+?)(?=(?:Capabilities|Salary|Years Of Experience|$))/i },
      { key: 'Domain / Capabilities', regex: /Capabilities\s*:\s*([^:\n]+?)(?=(?:Salary|Years Of Experience|$))/i },
      { key: 'Years Of Experience', regex: /Years Of Experience\s*:\s*([^:\n]+?)(?=(?:Readiness Delivered|$))/i }
    ];

    for (const token of tokens) {
      const match = cleaned.match(token.regex);
      if (match && match[1]) {
        const val = match[1].trim();
        if (val) {
          metadata.push({ label: token.key, value: val });
        }
      }
    }

    // Strip the entire matched header block from the text
    cleaned = cleaned.replace(/^(?:Job Tracking ID\s*:[\s\S]+?)(?:Readiness Delivered\.?|\.\s*(?=[A-Z]))/i, '').trim();
    cleaned = cleaned.replace(/^(?:Job Tracking ID\s*:[\s\S]*?(?:Years Of Experience\s*:\s*\d+))\s*/i, '').trim();
  }

  // Also strip any standalone single ATS line artifacts at start
  cleaned = cleaned.replace(/^(?:Job Requisition ID|Req ID|Requisition Number)\s*:\s*[A-Za-z0-9_-]+\s*/gi, '').trim();

  return { metadata, cleanedText: cleaned };
}

/**
 * Splits run-on concatenated sentences into clean bullet points when ATS flattening removed newlines.
 * e.g., "Write software that controls... Test and deploy code... Work directly in-person..."
 */
export function splitInlinedBullets(text: string): string[] {
  if (!text) return [];

  // If already contains newlines, split on newline
  const lines = text.split(/\r?\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 2) {
    return lines
      .map((l) => l.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((l) => l.length >= 8);
  }

  // Otherwise, attempt smart regex split on sentence boundaries followed by capital verb/qualification triggers
  const candidateDelimiters = [
    // Bullet symbols
    /(?:^|[.!?\n])\s*(?:[•\-\*–—]|\d+\.)\s*/g,
    // Typical action verb starters (when glued after period or without period)
    /(?<=\.)\s+(?=(?:Write|Test|Work|Develop|Design|Build|Create|Implement|Investigate|Maintain|Collaborate|Participate|Deploy|Manage|Support|Lead|Partner|Analyze|Receive|Assist|Ensure|Troubleshoot)\b)/g,
    // Typical qualification starters
    /(?<=\.)\s+(?=(?:Bachelor'?s|Master'?s|Proficiency|Familiarity|Desire to|Experience with|Knowledge of|Ability to|Strong understanding|Hands-on|Must have|Prior work|Eligible|US Citizen|Secret clearance)\b)/g
  ];

  let bestSplit = [text];

  for (const regex of candidateDelimiters) {
    const parts = text.split(regex).map((p) => p.trim()).filter(Boolean);
    if (parts.length > bestSplit.length && parts.every((p) => p.length >= 12)) {
      bestSplit = parts;
    }
  }

  return bestSplit
    .map((item) => item.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
    .filter((item) => item.length >= 8);
}

/**
 * Extracts benefits and perks keywords from job description
 */
export function extractBenefits(text: string): string[] {
  const perks: string[] = [];
  const low = text.toLowerCase();

  const standardBenefits: { key: string; check: RegExp; label: string }[] = [
    { key: '401k', check: /(?:401\s*\(?k\)?|401k|retirement plan|pension)/i, label: '401(k) Retirement Savings Plan' },
    { key: 'health', check: /(?:health|medical)\s+(?:insurance|coverage|benefits)/i, label: 'Comprehensive Medical Coverage' },
    { key: 'dental_vision', check: /(?:dental|vision)\s+(?:insurance|coverage|plans?)/i, label: 'Dental & Vision Insurance' },
    { key: 'pto', check: /(?:paid\s+time[- ]off|pto|vacation days|generous pto)/i, label: 'Paid Time Off (PTO) & Holidays' },
    { key: 'espp', check: /(?:espp|employee stock purchase|equity|stock options)/i, label: 'Employee Stock Purchase (ESPP) & Equity' },
    { key: 'tuition', check: /(?:tuition|education reimbursement|learning budget|professional development)/i, label: 'Tuition & Professional Learning Budget' },
    { key: 'parental', check: /(?:parental leave|maternity|paternity)/i, label: 'Paid Parental Leave' },
    { key: 'life_insurance', check: /(?:life insurance|disability insurance|add coverage)/i, label: 'Life & Disability Insurance' },
    { key: 'remote_flex', check: /(?:flexible work|remote stipend|home office)/i, label: 'Flexible Work & Home Office Support' }
  ];

  for (const item of standardBenefits) {
    if (item.check.test(low)) {
      perks.push(item.label);
    }
  }

  return perks;
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
  const compMatch = text.match(/(?:salary range|base pay for this position|grade-based pay range|compensation)\s*[:\-]?\s*(?:\$|€|£|CA\$)[0-9,]+(?:\.[0-9]{2})?\s*(?:to|[-–])\s*(?:\$|€|£|CA\$)[0-9,]+(?:\.[0-9]{2})?(?:[^\n.]*\.)?/i);
  if (compMatch) {
    compensationText = compMatch[0].trim();
  }

  // 5. Detect distinct sections using common section headers:
  // e.g. "Who We Need", "Key Responsibilities", "Experience and Skills", "Preferred Skills", "Job Benefits"
  const sectionDelimiters = [
    { type: 'about_role', regex: /(?:^|\n|\.\s+)(?:Who We Need|About the Role|The Opportunity|Position Summary|Role Overview|What You Will Do)[:\s]*/i },
    { type: 'responsibilities', regex: /(?:^|\n|\.\s+)(?:Key Responsibilities|Responsibilities|Core Duties|What You'll Do|Position Responsibilities)[:\s]*/i },
    { type: 'qualifications', regex: /(?:^|\n|\.\s+)(?:Experience and Skills|Key Qualifications|Basic Qualifications|Minimum Qualifications|Qualifications & Experience|Requirements|What We Look For)[:\s]*/i },
    { type: 'preferred', regex: /(?:^|\n|\.\s+)(?:Preferred Skills\/Experience|Preferred Qualifications|Desired Skills|Bonus Points|Nice to Have)[:\s]*/i },
    { type: 'benefits', regex: /(?:^|\n|\.\s+)(?:Job Benefits|Great benefits package|Benefits & Perks|What We Offer|Compensation & Benefits)[:\s]*/i }
  ];

  // Segmenting the text
  let aboutCompanyText = '';
  let aboutRoleText = '';
  let responsibilitiesText = '';
  let qualificationsText = '';
  let preferredText = '';
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
      } else if (current.type === 'benefits') {
        benefitsText = chunk;
      }
    }
  } else {
    // No section headers found; treat entire text as role overview
    aboutCompanyText = text;
  }

  // Combine responsibilities: structured from argument + newly parsed
  const parsedResponsibilities = responsibilitiesText ? splitInlinedBullets(responsibilitiesText) : [];
  const finalResponsibilities = existingResponsibilities.length >= 2
    ? existingResponsibilities
    : (parsedResponsibilities.length > 0 ? parsedResponsibilities : existingResponsibilities);

  // Combine qualifications
  const parsedQualifications = qualificationsText ? splitInlinedBullets(qualificationsText) : [];
  const finalQualifications = existingQualifications.length >= 2
    ? existingQualifications
    : (parsedQualifications.length > 0 ? parsedQualifications : existingQualifications);

  const finalPreferred = preferredText ? splitInlinedBullets(preferredText) : [];

  // Parse Benefits
  const perks = extractBenefits(benefitsText ? `${benefitsText} ${text}` : text);

  // Break prose paragraphs for aboutCompany and aboutRole
  const splitParagraphs = (str: string): string[] => {
    if (!str) return [];
    return str
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  const aboutCompany = splitParagraphs(aboutCompanyText);
  const aboutRole = splitParagraphs(aboutRoleText);

  return {
    aboutRole: aboutRole.length > 0 ? aboutRole : aboutCompany.slice(1),
    aboutCompany: aboutRole.length > 0 ? aboutCompany : [aboutCompany[0] || ''],
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
