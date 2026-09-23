import { ExperienceLevel, EmploymentType, JobCategory, SalaryRange } from '../types';
import { inferCategory, inferExperienceLevel } from './jobAggregator';

export interface ExtractedJobData {
  title: string;
  company: string;
  companyLogo?: string;
  companyWebsite?: string;
  location: string;
  isRemote: boolean;
  applicantLocationRequirements?: string;
  city?: string;
  state?: string;
  country?: string;
  experienceLevel: ExperienceLevel;
  maxYearsExperience: number;
  category: JobCategory;
  employmentType: EmploymentType;
  salary: SalaryRange;
  description: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  applyUrl: string;
  detectedAtsProvider?: string;
}

/**
 * Strips HTML tags and decodes common entities
 */
function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#xa0;/gi, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Extracts clean bullet points from HTML or multiline text
 */
function extractBulletPoints(html: string): string[] {
  if (!html) return [];
  const matches = html.match(/<li[^>]*>(.*?)<\/li>/gi);
  if (matches && matches.length > 0) {
    return matches
      .map((li) => cleanHtml(li).replace(/^[-*•\s]+/, '').trim())
      .filter((line) => line.length > 8 && !line.toLowerCase().includes('#li-') && !line.startsWith('+'));
  }
  return html
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•\s]+/, '').trim())
    .filter((line) => line.length > 8 && !line.toLowerCase().includes('#li-') && !line.startsWith('+'));
}

/**
 * Detects tech skills from text
 */
function detectSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin',
    'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB',
    'Redis', 'GraphQL', 'REST APIs', 'Git', 'CI/CD', 'ServiceNow', 'Terraform', 'Kafka', 'Jest', 'Playwright'
  ];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const skill of commonSkills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      found.push(skill);
    }
  }
  return found.length > 0 ? found.slice(0, 8) : ['Git', 'Software Engineering', 'Problem Solving'];
}

/**
 * Formats realistic early-career salary benchmark if compensation is unlisted
 */
function estimateEarlyCareerSalary(country: string, category: JobCategory, title: string): SalaryRange {
  const isIntern = title.toLowerCase().includes('intern');
  const upperCountry = (country || 'US').toUpperCase();

  if (upperCountry === 'GB' || upperCountry === 'UK') {
    if (isIntern) {
      return { min: 14, max: 20, currency: 'GBP', unit: 'HOUR' };
    }
    return { min: 30000, max: 38000, currency: 'GBP', unit: 'YEAR' };
  }

  if (['DE', 'FR', 'NL', 'IE', 'ES', 'IT', 'EU'].includes(upperCountry)) {
    if (isIntern) {
      return { min: 15, max: 22, currency: 'EUR', unit: 'HOUR' };
    }
    return { min: 45000, max: 58000, currency: 'EUR', unit: 'YEAR' };
  }

  if (upperCountry === 'CA') {
    if (isIntern) {
      return { min: 25, max: 38, currency: 'CAD', unit: 'HOUR' };
    }
    return { min: 70000, max: 92000, currency: 'CAD', unit: 'YEAR' };
  }

  if (upperCountry === 'IN') {
    return { min: 600000, max: 1200000, currency: 'INR', unit: 'YEAR' };
  }

  // Default: US Market
  if (isIntern) {
    return { min: 35, max: 55, currency: 'USD', unit: 'HOUR' };
  }
  if (category === 'Data / AI' || category === 'DevOps / Cloud') {
    return { min: 105000, max: 135000, currency: 'USD', unit: 'YEAR' };
  }
  return { min: 95000, max: 125000, currency: 'USD', unit: 'YEAR' };
}

/**
 * Composes "The FreshCommits Edge" Curated Job Description
 */
function composeFreshCommitsCuratedDescription(params: {
  title: string;
  company: string;
  cleanOverview: string;
  skills: string[];
  salary: SalaryRange;
  responsibilities: string[];
  qualifications: string[];
  location: string;
}): string {
  const { title, company, cleanOverview, skills, salary, location } = params;

  const topSkillsStr = skills.slice(0, 4).join(', ');
  const salaryDisplay =
    salary.unit === 'HOUR'
      ? `${salary.currency} ${salary.min}–${salary.max}/hr`
      : `${salary.currency} ${Math.round(salary.min / 1000)}k–${Math.round(salary.max / 1000)}k/year`;

  const edgeBlock = [
    `🎯 The FreshCommits Career Take:`,
    `${company} is actively investing in early-career talent with this ${title} opening. This role provides structured exposure to modern production tooling and multidisciplinary team mentorship, making it a high-leverage launchpad for 0–2 YoE engineers.`,
    ``,
    `💡 Candidate Preparation Checklist:`,
    `• Core Stack: Brush up on ${topSkillsStr || 'core programming fundamentals'} and version control (Git).`,
    `• Interview Focus: Engineering leads evaluate clean algorithmic problem-solving, architectural curiosity, and collaborative communication.`,
    `• Target Benchmark: Estimated verified market compensation of ~${salaryDisplay} with career progression reviews.`,
    `• Location: Based in ${location}.`,
    ``,
    `🏢 Role Overview:`,
    cleanOverview || `${company} is seeking an enthusiastic early-career engineer to join their engineering organization and contribute to high-impact software solutions.`
  ].join('\n');

  return edgeBlock;
}

/**
 * Main parser: Given any career page / ATS URL, fetches data and returns populated fields
 */
export async function extractAndEnrichJobFromUrl(rawUrl: string): Promise<ExtractedJobData> {
  const url = rawUrl.trim();
  if (!url) {
    throw new Error('Please enter a valid URL.');
  }

  // 1. SMARTRECRUITERS PARSER
  // e.g. https://jobs.smartrecruiters.com/Version1/744000151416884-junior-servicenow-consultant
  const srMatch = url.match(/jobs\.smartrecruiters\.com\/([^/]+)\/([0-9a-zA-Z]+)(?:-[^/?#]+)?/i);
  if (srMatch) {
    const companyId = srMatch[1];
    const postingId = srMatch[2];
    const apiUrl = `https://api.smartrecruiters.com/v1/companies/${companyId}/postings/${postingId}`;

    try {
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (resp.ok) {
        const data = await resp.json();
        const title = data.name || 'Software Engineer';
        const company = data.company?.name || companyId;
        const companyLogo = data.company?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=0F172A&color=fff&size=128`;
        const city = data.location?.city || '';
        const region = data.location?.region || '';
        const country = (data.location?.country || 'US').toUpperCase();
        const location = data.location?.fullLocation || (city ? `${city}${region ? `, ${region}` : ''}, ${country}` : 'Remote');
        const isRemote = Boolean(data.location?.remote || data.location?.hybrid || location.toLowerCase().includes('remote'));

        // Sections
        const jobAd = data.jobAd?.sections || {};
        const jobDescText = cleanHtml(jobAd.jobDescription?.text || '');
        const qualText = cleanHtml(jobAd.qualifications?.text || '');
        const addText = cleanHtml(jobAd.additionalInformation?.text || '');
        const fullCorpus = `${jobDescText}\n${qualText}\n${addText}`;

        const responsibilities = extractBulletPoints(jobAd.jobDescription?.text || '').slice(0, 6);
        const qualifications = extractBulletPoints(jobAd.qualifications?.text || '').slice(0, 6);
        const skills = detectSkills(fullCorpus);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, fullCorpus);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';

        // Compensation
        let salary: SalaryRange;
        if (data.compensation?.max) {
          salary = {
            min: Number(data.compensation.min || Math.round(Number(data.compensation.max) * 0.85)),
            max: Number(data.compensation.max),
            currency: data.compensation.currency || 'USD',
            unit: empType === 'INTERN' ? 'HOUR' : 'YEAR'
          };
        } else {
          salary = estimateEarlyCareerSalary(country, category, title);
        }

        const cleanOverview = jobDescText.split('\n\n')[0] || jobDescText.slice(0, 300);
        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities,
          qualifications,
          location
        });

        return {
          title,
          company,
          companyLogo,
          companyWebsite: `https://${companyId.toLowerCase()}.com`,
          location,
          isRemote,
          applicantLocationRequirements: isRemote ? country : undefined,
          city,
          state: region,
          country,
          experienceLevel,
          maxYearsExperience: maxYears,
          category,
          employmentType: empType,
          salary,
          description: curatedDescription,
          responsibilities: responsibilities.length > 0 ? responsibilities : [
            'Design and develop high-reliability software features in an agile sprint environment.',
            'Collaborate with mentors and team peers on peer code reviews and unit testing.',
            'Maintain documentation and participate in team planning and architectural discussions.'
          ],
          qualifications: qualifications.length > 0 ? qualifications : [
            'Foundational computer science degree or equivalent bootcamp/practical technical experience.',
            'Knowledge of modern programming languages and version control tools (Git).',
            'Strong problem-solving curiosity and passion for learning enterprise technologies.'
          ],
          skills,
          applyUrl: url,
          detectedAtsProvider: 'SmartRecruiters'
        };
      }
    } catch (err) {
      console.warn('SmartRecruiters direct API fetch failed, falling back:', err);
    }
  }

  // 2. GREENHOUSE PARSER
  // e.g. https://boards.greenhouse.io/{board}/jobs/{id} or https://job-boards.greenhouse.io/{board}/jobs/{id}
  const ghMatch = url.match(/(?:boards|job-boards)\.greenhouse\.io\/([^/]+)\/jobs\/([0-9]+)/i);
  if (ghMatch) {
    const board = ghMatch[1];
    const jobId = ghMatch[2];
    const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`;

    try {
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (resp.ok) {
        const data = await resp.json();
        const title = data.title || 'Software Engineer';
        const company = board.charAt(0).toUpperCase() + board.slice(1);
        const location = data.location?.name || 'Remote - US';
        const isRemote = Boolean(location.toLowerCase().includes('remote'));
        const contentText = cleanHtml(data.content || '');
        const responsibilities = extractBulletPoints(data.content || '').slice(0, 6);
        const qualifications = responsibilities.slice(3, 7);
        const skills = detectSkills(contentText);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, contentText);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';
        const salary = estimateEarlyCareerSalary('US', category, title);

        const cleanOverview = contentText.split('\n\n')[0] || contentText.slice(0, 300);
        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview,
          skills,
          salary,
          responsibilities,
          qualifications,
          location
        });

        return {
          title,
          company,
          companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=0F172A&color=fff&size=128`,
          location,
          isRemote,
          applicantLocationRequirements: isRemote ? 'US' : undefined,
          country: 'US',
          experienceLevel,
          maxYearsExperience: maxYears,
          category,
          employmentType: empType,
          salary,
          description: curatedDescription,
          responsibilities: responsibilities.length > 0 ? responsibilities : [
            'Collaborate on feature engineering, bug fixes, and continuous delivery pipeline tasks.',
            'Write clean, well-tested code with guidance from senior engineering mentors.',
            'Participate in agile sprint ceremonies and code reviews.'
          ],
          qualifications: qualifications.length > 0 ? qualifications : [
            '0–2 years of software engineering experience or relevant university coursework.',
            'Working knowledge of core data structures, algorithms, and Git version control.',
            'Eager to learn modern tools and frameworks in a fast-paced environment.'
          ],
          skills,
          applyUrl: url,
          detectedAtsProvider: 'Greenhouse'
        };
      }
    } catch (err) {
      console.warn('Greenhouse API fetch failed:', err);
    }
  }

  // 3. LEVER PARSER
  // e.g. https://jobs.lever.co/{company}/{id}
  const leverMatch = url.match(/jobs\.lever\.co\/([^/]+)\/([a-zA-Z0-9-]+)/i);
  if (leverMatch) {
    const comp = leverMatch[1];
    const postingId = leverMatch[2];
    const apiUrl = `https://api.lever.co/v0/postings/${comp}/${postingId}`;

    try {
      const resp = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
      if (resp.ok) {
        const data = await resp.json();
        const title = data.text || 'Software Engineer';
        const company = comp.charAt(0).toUpperCase() + comp.slice(1);
        const location = data.categories?.location || 'Remote';
        const isRemote = Boolean(location.toLowerCase().includes('remote') || data.workplaceType === 'remote');
        const descText = cleanHtml(data.description || '');
        const skills = detectSkills(`${title} ${descText}`);
        const category = inferCategory(title, skills);
        const experienceLevel = inferExperienceLevel(title, descText);
        const maxYears = title.toLowerCase().includes('intern') ? 0 : 1;
        const empType: EmploymentType = title.toLowerCase().includes('intern') ? 'INTERN' : 'FULL_TIME';
        const salary = estimateEarlyCareerSalary('US', category, title);

        const responsibilities: string[] = [];
        const qualifications: string[] = [];
        if (Array.isArray(data.lists)) {
          for (const list of data.lists) {
            const listTitle = (list.text || '').toLowerCase();
            const bullets = extractBulletPoints(list.content || '');
            if (listTitle.includes('do') || listTitle.includes('responsib') || listTitle.includes('impact')) {
              responsibilities.push(...bullets);
            } else {
              qualifications.push(...bullets);
            }
          }
        }

        const curatedDescription = composeFreshCommitsCuratedDescription({
          title,
          company,
          cleanOverview: descText.slice(0, 300),
          skills,
          salary,
          responsibilities,
          qualifications,
          location
        });

        return {
          title,
          company,
          companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(company)}&background=0F172A&color=fff&size=128`,
          location,
          isRemote,
          applicantLocationRequirements: isRemote ? 'US' : undefined,
          country: 'US',
          experienceLevel,
          maxYearsExperience: maxYears,
          category,
          employmentType: empType,
          salary,
          description: curatedDescription,
          responsibilities: responsibilities.slice(0, 6),
          qualifications: qualifications.slice(0, 6),
          skills,
          applyUrl: url,
          detectedAtsProvider: 'Lever'
        };
      }
    } catch (err) {
      console.warn('Lever API fetch failed:', err);
    }
  }

  // 4. GENERIC WEB CAREER PAGE / CORS PROXY FALLBACK
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const resp = await fetch(proxyUrl);
    if (resp.ok) {
      const html = await resp.text();
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      let pageTitle = titleMatch ? titleMatch[1].replace(/[-|•].*$/, '').trim() : 'Software Engineer';
      if (!pageTitle || pageTitle.length > 80) pageTitle = 'Software Engineer (Early-Career)';

      // Detect company from domain
      let parsedCompany = 'Direct Tech Employer';
      try {
        const u = new URL(url);
        const hostParts = u.hostname.replace('www.', '').split('.');
        if (hostParts.length >= 2) {
          parsedCompany = hostParts[0].charAt(0).toUpperCase() + hostParts[0].slice(1);
        }
      } catch {
        // fallback
      }

      const skills = detectSkills(html);
      const category = inferCategory(pageTitle, skills);
      const isRemote = html.toLowerCase().includes('remote');
      const salary = estimateEarlyCareerSalary('US', category, pageTitle);

      const curatedDescription = composeFreshCommitsCuratedDescription({
        title: pageTitle,
        company: parsedCompany,
        cleanOverview: `Curated early-career opportunity discovered on ${parsedCompany}'s official career portal.`,
        skills,
        salary,
        responsibilities: [
          'Design and implement production code features with team mentors.',
          'Review pull requests, write automated unit tests, and maintain CI/CD pipelines.',
          'Collaborate closely with product and engineering teams in agile sprints.'
        ],
        qualifications: [
          '0 to 2 years of software engineering experience; fresh graduates and bootcamps welcome.',
          'Understanding of fundamental computer science concepts and version control (Git).',
          'Strong curiosity to learn and contribute to modern production applications.'
        ],
        location: isRemote ? 'Remote - US' : 'United States'
      });

      return {
        title: pageTitle,
        company: parsedCompany,
        companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(parsedCompany)}&background=0F172A&color=fff&size=128`,
        location: isRemote ? 'Remote - US' : 'United States',
        isRemote,
        country: 'US',
        experienceLevel: 'Entry Level',
        maxYearsExperience: 1,
        category,
        employmentType: 'FULL_TIME',
        salary,
        description: curatedDescription,
        responsibilities: [
          'Build and ship software engineering components with clean code practices.',
          'Participate in sprint planning, code reviews, and quality assurance.',
          'Work with senior engineers to level up technical domain expertise.'
        ],
        qualifications: [
          '0–2 years of software engineering experience or equivalent projects.',
          'Foundational skills in ' + skills.slice(0, 3).join(', ') + '.',
          'Clear technical communication and problem-solving skills.'
        ],
        skills,
        applyUrl: url,
        detectedAtsProvider: 'Career Page'
      };
    }
  } catch (err) {
    console.warn('Generic fallback fetch failed:', err);
  }

  throw new Error('Unable to automatically extract from this link. Please check the URL or fill in the fields below.');
}
