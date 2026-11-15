import { JobPosting } from '../types';

/**
 * Pure, dependency-free Job Data & ATS HTML Sanitizer
 * Safe to run in Browser, Node.js build scripts, and Cloudflare Pages Functions.
 */

const MATERIAL_ICON_TOKENS = [
  'star_rate',
  'location_on',
  'schedule',
  'business_center',
  'find_in_page',
  'bookmark_border',
  'bookmark_added',
  'work_outline',
  'open_in_new',
  'arrow_forward',
  'arrow_back',
  'check_circle',
  'check_circle_outline',
  'verified_user',
  'content_copy',
  'attach_money',
  'apartment',
  'public',
  'calendar_today',
  'trending_up',
  'info_outline',
  'help_outline',
  'flag_outlined',
];

const UI_NOISE_PHRASES = [
  /\bshare\s+Share\b/gi,
  /\bSave\s+Job\b/gi,
  /\bUnsave\s+Job\b/gi,
  /\bApply\s+Now\b/gi,
  /\bEasy\s+Apply\b/gi,
  /\b1:1\s+JD\s+Ready\b/gi,
  /\bGoogle\s+for\s+Jobs\s+Indexed\b/gi,
];

const NAMED_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#x27;': "'",
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&nbsp;': ' ',
  '&#xa0;': ' ',
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
};

export function decodeHtmlEntitiesClean(input: string): string {
  if (!input) return '';
  let str = String(input);

  // Decode twice to catch double-encoded entities like &amp;#39;
  for (let pass = 0; pass < 2; pass++) {
    for (const [ent, val] of Object.entries(NAMED_ENTITIES)) {
      if (str.includes(ent)) {
        str = str.split(ent).join(val);
      }
    }
    str = str
      .replace(/&#(\d+);/g, (_, dec) => {
        const code = parseInt(dec, 10);
        return !isNaN(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
      })
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
        const code = parseInt(hex, 16);
        return !isNaN(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
      });
  }

  return str;
}

/**
 * Strips leaked Material Icon ligature names and scraped button/UI noise
 */
export function stripUiAndIconNoise(input: string, options: { isTitle?: boolean } = {}): string {
  if (!input) return '';
  let text = decodeHtmlEntitiesClean(input);

  // Strip leaked Material icon tokens (case-sensitive or word-bounded)
  const iconPattern = new RegExp(`\\b(?:${MATERIAL_ICON_TOKENS.join('|')})\\b`, 'gi');
  text = text.replace(iconPattern, ' ');

  // Strip leading/trailing "New" badge artifacts leaked into scraped titles/snippets
  if (options.isTitle) {
    text = text
      .replace(/^(?:New|Hot|Featured|Urgent)\s*[•|\-:]\s*/i, '')
      .replace(/^(?:New)\s+(?=[A-Z])/g, '')
      .replace(/\s+(?:New|Save Job|Share)$/i, '');
  } else {
    text = text
      .replace(/^\s*(?:New|star_rate)\s+(?=[A-Z])/gm, '')
      .replace(/\bstar_rate\b/gi, '');
  }

  for (const pat of UI_NOISE_PHRASES) {
    text = text.replace(pat, ' ');
  }

  return text.replace(/[ \t]{2,}/g, ' ').trim();
}

/**
 * Removes synthetic editorial wrappers and fake widget boilerplate injected by legacy crawlers
 */
export function stripSyntheticWrapperSections(input: string): string {
  if (!input) return '';
  let text = String(input);

  // 1. If legacy description has "🎯 The FreshCommits Career Take:" ... "🏢 Role Overview:", unwrap to Role Overview
  if (text.includes('🏢 Role Overview:')) {
    const afterOverview = text.split('🏢 Role Overview:').slice(1).join('\n').trim();
    if (afterOverview.length > 25) {
      text = afterOverview;
    }
  }

  // 2. Strip Career Take + Candidate Preparation Checklist blocks cleanly
  text = text.replace(
    /🎯\s*The FreshCommits (?:Career|Editorial) Take:[\s\S]*?(?=💡\s*Candidate Preparation Checklist:|🏢\s*Role Overview:|$)/gi,
    ''
  );

  // 3. Strip Candidate Preparation Checklist block up to the next clear double-newline non-bullet section
  text = text.replace(
    /💡\s*Candidate Preparation Checklist:[\s\S]*?(?=\n\s*\n\s*(?![•\-\*])|$)/gi,
    ''
  );

  // 4. Strip fake interview roadmap / fake tech-stack matrix / fake stipend perks wrappers
  text = text.replace(
    /(?:^|\n)\s*(?:🎯\s*)?(?:Round\s*1\s*Interview\s*Drill(?:\s*&\s*Winning\s*Formula)?|FreshCommits\s*Tech[\s-]Stack\s*Matrix|Estimated\s*(?:Housing|Relocation)\s*Stipend\s*Perks)\b[\s\S]*?(?=\n\s*\n\s*[A-Z]|$)/gi,
    ''
  );

  // 5. Strip synthetic mad-libs red-box filler
  text = text.replace(
    /<p>\s*[^<]*?\b(?:is hiring|welcoming|actively seeking)\b[\s\S]*?(?:serving\s+(?:clients\s+and\s+)?teams|Greater\s+[^<]+Area|modern\s+cloud\s+architectures)\.?\s*<\/p>/gi,
    ''
  );
  text = text.replace(
    /^[A-Za-z0-9&.\-\s]+?\s+is\s+hiring\s+.*?to\s+join\s+its\s+.*?team\s+based\s+in\s+.*?serving\s+(?:clients\s+and\s+)?teams[^\n.]*\.\s*/gi,
    ''
  );

  return text.replace(/\n{3,}/g, '\n\n').trim();
}

export function sanitizeJobTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let clean = stripUiAndIconNoise(rawTitle, { isTitle: true });
  clean = clean
    .replace(/\s*\|\s*FreshCommits.*$/i, '')
    .replace(/\s*\(\s*\)\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return clean;
}

/**
 * Sanitizes raw ATS HTML descriptions:
 * - Strips <script>, <style>, <noscript>, <nav>, <header>, <footer>, <aside>, <form>, <button>,
 *   <img>, <svg>, <picture>, <figure>, <iframe>, <video>, <audio>
 * - Removes hidden elements (display:none, visibility:hidden, hidden attr, aria-hidden="true")
 * - Strips inline black-text, background-color, font-size/family styles so dark & light themes render cleanly
 * - Strips Material Icon ligatures and synthetic wrapper sections
 */
export function sanitizeAtsHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  let html = String(rawHtml);

  // If HTML entities were escaped (e.g. &lt;p&gt;), decode first
  if (!/<(?:p|div|ul|ol|li|h[1-6]|br)\b/i.test(html) && /&lt;(?:p|div|ul|ol|li|h[1-6]|br)/i.test(html)) {
    html = decodeHtmlEntitiesClean(html);
  }

  // Strip synthetic wrappers before tag cleanup
  html = stripSyntheticWrapperSections(html);

  // Remove dangerous / non-content containers completely (including their inner content)
  const blockedTagContainers = [
    'script',
    'style',
    'noscript',
    'nav',
    'header',
    'footer',
    'aside',
    'form',
    'button',
    'svg',
    'picture',
    'figure',
    'iframe',
    'object',
    'embed',
    'canvas',
    'video',
    'audio',
    'template',
  ];
  for (const tag of blockedTagContainers) {
    const pairRe = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    html = html.replace(pairRe, ' ');
    const selfRe = new RegExp(`<${tag}\\b[^>]*\\/?>`, 'gi');
    html = html.replace(selfRe, ' ');
  }

  // Remove standalone void media/input tags
  html = html.replace(/<(?:img|input|select|textarea|source|track|meta|link)\b[^>]*\/?>/gi, ' ');

  // Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, ' ');

  // Remove elements explicitly hidden via inline styles or hidden attribute
  html = html.replace(
    /<([a-z0-9]+)\b[^>]*(?:style\s*=\s*["'][^"']*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?\b)[^"']*["']|\bhidden\b)[^>]*>[\s\S]*?<\/\1>/gi,
    ' '
  );

  // Strip Material Icon spans (<span class="material-icons...">star_rate</span>)
  html = html.replace(
    /<(?:span|i)\b[^>]*class\s*=\s*["'][^"']*material-icons[^"']*["'][^>]*>[\s\S]*?<\/(?:span|i)>/gi,
    ' '
  );

  // Strip inline event handlers and unsafe attributes (style, class, id, data-*, onclick, etc.)
  // Preserve safe href on <a> tags only
  html = html.replace(/<([a-z0-9]+)\b([^>]*)>/gi, (match, rawTag, rawAttrs) => {
    const tag = rawTag.toLowerCase();
    const allowedTags = new Set([
      'p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'a', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
    ]);

    if (!allowedTags.has(tag)) {
      return '';
    }

    // Map h1 -> h2 to keep single H1 on page
    const outTag = tag === 'h1' ? 'h2' : tag;

    if (outTag === 'a') {
      const hrefMatch = rawAttrs.match(/href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const rawHref = (hrefMatch?.[1] || hrefMatch?.[2] || hrefMatch?.[3] || '').trim();
      if (/^https?:\/\//i.test(rawHref) || /^mailto:/i.test(rawHref)) {
        const safeHref = rawHref.replace(/"/g, '&quot;');
        return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">`;
      }
      return '<span>';
    }

    if (outTag === 'br' || outTag === 'hr') {
      return `<${outTag} />`;
    }

    // Strip all style/class/id/data-* attributes so inline black text & white backgrounds never leak
    return `<${outTag}>`;
  });

  // Replace closing tags for disallowed tags / h1 -> h2 / orphaned <a> mapped to <span>
  html = html.replace(/<\/([a-z0-9]+)\s*>/gi, (_, rawTag) => {
    const tag = rawTag.toLowerCase();
    if (tag === 'h1') return '</h2>';
    const allowedTags = new Set([
      'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u',
      'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
      'a', 'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ]);
    return allowedTags.has(tag) ? `</${tag}>` : '';
  });

  // Clean Material Icon ligature tokens & UI noise inside text nodes
  const iconPattern = new RegExp(`\\b(?:${MATERIAL_ICON_TOKENS.join('|')})\\b`, 'gi');
  html = html.replace(iconPattern, ' ');
  for (const pat of UI_NOISE_PHRASES) {
    html = html.replace(pat, ' ');
  }

  // Collapse empty wrapper tags like <p></p>, <div>   </div>, <span></span>
  for (let i = 0; i < 3; i++) {
    html = html.replace(/<(p|div|span|strong|b|em|i|li|h[2-6])\b[^>]*>(?:\s|&nbsp;)*<\/\1>/gi, '');
  }

  // Convert redundant outer <div> wrappers that only wrap plain text into clean <p> spacing
  html = html
    .replace(/\r?\n/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

  return html;
}

/**
 * Converts HTML into clean readable plain text while preserving paragraph & list line breaks
 */
export function htmlToReadableText(html: string): string {
  if (!html) return '';
  let text = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|section|article|blockquote|tr)>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '\n• ')
    .replace(/<\/li>/gi, '')
    .replace(/<[^>]+>/g, ' ');

  text = decodeHtmlEntitiesClean(text);
  text = stripUiAndIconNoise(text);
  text = stripSyntheticWrapperSections(text);

  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Fixes common ATS text flattening / missing whitespace issues around punctuation & headings
 */
export function normalizePlainTextSpacing(rawText: string): string {
  if (!rawText) return '';
  let text = decodeHtmlEntitiesClean(rawText);
  text = stripUiAndIconNoise(text);
  text = stripSyntheticWrapperSections(text);

  // Add spaces after sentence punctuation when immediately followed by a capital letter
  // Avoid breaking decimals (3.5), versions (v2.0), file extensions (.ts/.js/.py), or domain names (.com/.io)
  text = text.replace(/([a-z0-9])([.!?])([A-Z][a-z]{2,})/g, '$1$2\n\n$3');

  // Break common concatenated headings onto their own lines
  const headingMarkers = [
    'About the Role',
    'About the Team',
    'About Us',
    'Role Overview',
    'Position Summary',
    'Key Responsibilities',
    'Responsibilities',
    "What You'll Do",
    'What You Will Do',
    'Core Duties',
    'Qualifications',
    'Basic Qualifications',
    'Minimum Qualifications',
    'Preferred Qualifications',
    'Requirements',
    'Required Skills',
    'What We Look For',
    'Benefits & Perks',
    'Compensation & Benefits',
  ];
  const headingRegex = new RegExp(`([^\\n])\\s*(${headingMarkers.join('|')})\\s*:?\\s*(?=[A-Z•\\-\\d])`, 'g');
  text = text.replace(headingRegex, '$1\n\n$2:\n');

  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeHtmlSafe(str: string): string {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats plain-text descriptions into structured HTML paragraphs and splits out
 * Responsibilities and Qualifications & Requirements bullet lists when available.
 */
export function formatPlainTextJobDescription(
  rawText: string,
  existingResponsibilities: string[] = [],
  existingQualifications: string[] = []
): {
  html: string;
  text: string;
  paragraphs: string[];
  responsibilities: string[];
  qualifications: string[];
} {
  const normalized = normalizePlainTextSpacing(rawText);

  const sectionSplitRe =
    /(?:^|\n)\s*(Key Responsibilities|Responsibilities|What You(?:'ll| Will) Do|Core Duties|Position Responsibilities|Qualifications(?:\s*&\s*Requirements)?|Basic Qualifications|Minimum Qualifications|Preferred Qualifications|Requirements|Required Skills|What We Look For|Benefits(?:\s*&\s*Perks)?|Compensation(?:\s*&\s*Benefits)?)\s*:?\s*(?:\n|$)/gi;

  const matches: { heading: string; index: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = sectionSplitRe.exec(normalized)) !== null) {
    matches.push({ heading: m[1].trim(), index: m.index, end: m.index + m[0].length });
  }

  let introText = normalized;
  const extractedResp: string[] = [];
  const extractedQual: string[] = [];
  const extraSections: { title: string; items: string[] }[] = [];

  if (matches.length > 0) {
    introText = normalized.slice(0, matches[0].index).trim();
    for (let i = 0; i < matches.length; i++) {
      const cur = matches[i];
      const nextIdx = i + 1 < matches.length ? matches[i + 1].index : normalized.length;
      const body = normalized.slice(cur.end, nextIdx).trim();
      const lines = body
        .split(/\n+/)
        .map((l) => l.replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
        .filter((l) => l.length >= 6);

      const hLower = cur.heading.toLowerCase();
      if (hLower.includes('responsibilit') || hLower.includes('what you') || hLower.includes('duties')) {
        extractedResp.push(...lines);
      } else if (hLower.includes('qualif') || hLower.includes('require') || hLower.includes('skills') || hLower.includes('what we look')) {
        extractedQual.push(...lines);
      } else if (lines.length > 0) {
        extraSections.push({ title: cur.heading, items: lines });
      }
    }
  }

  // Fallback sentence chunking if intro is a single dense wall of text
  let paragraphs = introText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 1 && paragraphs[0].length > 420) {
    const sentences = paragraphs[0].match(/[^.!?]+[.!?]+(?:\s+|$)/g)?.map((s) => s.trim()).filter(Boolean) || [];
    if (sentences.length >= 4) {
      const chunked: string[] = [];
      let buf: string[] = [];
      for (const s of sentences) {
        buf.push(s);
        if (buf.length >= 3 || (buf.length >= 2 && buf.join(' ').length > 260)) {
          chunked.push(buf.join(' '));
          buf = [];
        }
      }
      if (buf.length > 0) chunked.push(buf.join(' '));
      paragraphs = chunked;
    }
  }

  const cleanList = (arr: string[]) =>
    arr
      .map((item) => stripUiAndIconNoise(item).replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
      .filter((item) => item.length >= 6);

  const finalResponsibilities = cleanList(extractedResp.length > 0 ? extractedResp : existingResponsibilities);
  const finalQualifications = cleanList(extractedQual.length > 0 ? extractedQual : existingQualifications);

  let html = paragraphs.map((p) => `<p>${escapeHtmlSafe(p).replace(/\n/g, '<br />')}</p>`).join('');

  if (finalResponsibilities.length > 0) {
    html += `<h3>Responsibilities</h3><ul>${finalResponsibilities
      .map((item) => `<li>${escapeHtmlSafe(item)}</li>`)
      .join('')}</ul>`;
  }

  if (finalQualifications.length > 0) {
    html += `<h3>Qualifications &amp; Requirements</h3><ul>${finalQualifications
      .map((item) => `<li>${escapeHtmlSafe(item)}</li>`)
      .join('')}</ul>`;
  }

  for (const sec of extraSections) {
    html += `<h3>${escapeHtmlSafe(sec.title)}</h3><ul>${sec.items
      .map((item) => `<li>${escapeHtmlSafe(item)}</li>`)
      .join('')}</ul>`;
  }

  return {
    html,
    text: normalized,
    paragraphs,
    responsibilities: finalResponsibilities,
    qualifications: finalQualifications,
  };
}

/**
 * Formats salary ONLY when officially disclosed; returns null if undisclosed (never returns "Market Rate").
 */
export function formatDisclosedSalary(
  salary?: JobPosting['salary'],
  salaryDisclosed?: boolean
): string | null {
  if (salaryDisclosed === false) return null;
  if (!salary || typeof salary.min !== 'number' || salary.min <= 0) return null;

  const curr = (salary.currency || 'USD').toUpperCase();
  const sym =
    curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : curr === 'CAD' ? 'CA$' : curr === 'INR' ? '₹' : curr === 'AUD' ? 'A$' : '$';

  if (salary.unit === 'HOUR') {
    const maxPart = salary.max && salary.max > salary.min ? `–${sym}${salary.max}` : '';
    return `${sym}${salary.min}${maxPart}/hr`;
  }
  if (salary.unit === 'MONTH') {
    const maxPart = salary.max && salary.max > salary.min ? `–${sym}${salary.max.toLocaleString()}` : '';
    return `${sym}${salary.min.toLocaleString()}${maxPart}/mo`;
  }
  const minK = salary.min >= 1000 ? `${Math.round(salary.min / 1000)}k` : `${salary.min}`;
  const maxK =
    salary.max && salary.max > salary.min
      ? salary.max >= 1000
        ? `–${sym}${Math.round(salary.max / 1000)}k`
        : `–${sym}${salary.max}`
      : '';
  return `${sym}${minK}${maxK}/yr`;
}

/**
 * Infers candidate work mode cleanly from job fields
 */
export function resolveWorkMode(job: Pick<JobPosting, 'workMode' | 'isRemote' | 'location'>): 'Remote' | 'Hybrid' | 'On-site' {
  if (job.workMode === 'Remote' || job.workMode === 'Hybrid' || job.workMode === 'On-site') {
    return job.workMode;
  }
  const loc = (job.location || '').toLowerCase();
  if (job.isRemote || /\bremote\b/.test(loc)) {
    return /\bhybrid\b/.test(loc) ? 'Hybrid' : 'Remote';
  }
  if (/\bhybrid\b/.test(loc)) {
    return 'Hybrid';
  }
  return 'On-site';
}

/**
 * Sanitizes an entire JobPosting record cleanly for storage/rendering
 */
export function sanitizeJobPosting(job: JobPosting): JobPosting {
  if (!job) return job;
  const cleanTitle = sanitizeJobTitle(job.title);
  const rawDesc = job.description || '';
  const cleanDesc = stripUiAndIconNoise(stripSyntheticWrapperSections(rawDesc));
  const cleanHtml = job.descriptionHtml ? sanitizeAtsHtml(job.descriptionHtml) : undefined;

  const cleanList = (items?: string[]) =>
    Array.isArray(items)
      ? items
          .map((item) => stripUiAndIconNoise(item).replace(/^[•\-\*–—\d\.\)]\s*/, '').trim())
          .filter((item) => item.length >= 6)
      : [];

  return {
    ...job,
    title: cleanTitle || job.title,
    location: stripUiAndIconNoise(job.location || ''),
    description: cleanDesc,
    descriptionHtml: cleanHtml,
    responsibilities: cleanList(job.responsibilities),
    qualifications: cleanList(job.qualifications),
  };
}
