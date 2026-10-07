import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function parseFirestoreVal(v) {
  if (!v) return undefined;
  if ('stringValue' in v) return v.stringValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return parseFloat(v.doubleValue);
  if ('arrayValue' in v) {
    const vals = v.arrayValue.values || [];
    return vals.map(parseFirestoreVal);
  }
  if ('mapValue' in v) {
    const fields = v.mapValue.fields || {};
    const obj = {};
    for (const k in fields) {
      obj[k] = parseFirestoreVal(fields[k]);
    }
    return obj;
  }
  return undefined;
}

function inferRoleArchetype(title, category, skills = []) {
  const t = (title || '').toLowerCase();
  const allSkills = (skills || []).map((s) => s.toLowerCase()).join(' ');

  if (t.includes('intern') || t.includes('apprentice') || t.includes('co-op') || t.includes('stage') || t.includes('alternance')) {
    return 'internship';
  }
  if (t.includes('graduate') || t.includes('grad') || t.includes('university') || t.includes('campus') || t.includes('rotational') || t.includes('stem career fair')) {
    return 'graduate';
  }
  if (t.includes('fresher') || t.includes('freshers') || t.includes('open for freshers') || t.includes('no experience')) {
    return 'fresher';
  }
  if (t.includes('sql') || t.includes('data') || t.includes('database') || t.includes('bi') || t.includes('analytics') || category === 'Data & AI' || allSkills.includes('sql')) {
    return 'data_sql';
  }
  if (t.includes('solution') || t.includes('support') || t.includes('integration') || t.includes('specialist') || t.includes('consultant') || t.includes('service') || t.includes('it field') || t.includes('helpdesk') || t.includes('servicenow')) {
    return 'solutions_systems';
  }
  if (t.includes('frontend') || t.includes('front end') || t.includes('ui') || t.includes('react') || t.includes('web developer') || category === 'Frontend') {
    return 'frontend';
  }
  if (t.includes('backend') || t.includes('back end') || t.includes('api') || t.includes('cloud') || t.includes('devops') || t.includes('golang') || t.includes('python') || t.includes('java') || category === 'Backend' || category === 'DevOps') {
    return 'backend_cloud';
  }
  if (t.includes('qa') || t.includes('test') || t.includes('quality') || category === 'QA') {
    return 'qa_testing';
  }
  return 'fullstack_general';
}

function generateLeadEngineerTake(job) {
  const title = job.title || '';
  const company = job.company || 'The employer';
  const skills = job.skills || [];
  const topSkill = skills[0] || '';
  const archetype = inferRoleArchetype(title, job.category, skills);
  const seed = ((job.id || '') + title).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (archetype === 'data_sql') {
    const takes = [
      `A focused opportunity for junior engineers looking to deepen database architecture, query optimization, and enterprise data workflows. ${company} pairs this role with structured code reviews across active production systems.`,
      `Well-suited for early-career technologists focused on data reliability, reporting pipelines, and schema modeling. This opening at ${company} emphasizes hands-on data manipulation alongside senior database architects.`,
      `An exceptional launchpad for entry-level developers eager to build commercial fluency in ${topSkill ? `${topSkill} and ` : ''}backend data stores, contributing directly to high-volume business systems and data integrity.`
    ];
    return takes[seed % takes.length];
  }
  if (archetype === 'solutions_systems') {
    const takes = [
      `Well-suited for early-career technologists who thrive at the intersection of technical troubleshooting and client systems. This opening at ${company} emphasizes hands-on system integration and commercial velocity over isolated ticket queues.`,
      `A strong pathway for junior engineers looking to master end-to-end software configurations and enterprise integrations. ${company} provides dedicated senior guidance while giving candidates direct ownership of technical resolution workflows.`,
      `Tailored for entry-level problem-solvers who enjoy diagnosing complex technical issues across live applications, bridging engineering fixes with real-world user requirements.`
    ];
    return takes[seed % takes.length];
  }
  if (archetype === 'graduate') {
    const takes = [
      `Designed for new graduates transitioning theoretical computer science foundations into commercial production deployments. ${company}'s engineering cohort pairs candidates with dedicated staff mentors to build strong technical habits.`,
      `A structured runway for new graduates seeking broad engineering exposure, code review hygiene, and cross-functional agile development from day one at ${company}.`,
      `An exceptional starting point for new graduates ready to contribute to active codebases while receiving continuous architectural guidance and career progression milestones.`
    ];
    return takes[seed % takes.length];
  }
  if (archetype === 'fresher') {
    const takes = [
      `An accessible entry point for freshers eager to gain commercial technical credentials with guided senior mentorship and clear progression milestones at ${company}.`,
      `Tailored for freshers seeking a high-support team culture where curiosity, clean problem-solving, and continuous learning are actively nurtured.`,
      `A supportive bridge for freshers transitioning into professional tech teams, offering hands-on technical exposure without legacy corporate bureaucracy.`
    ];
    return takes[seed % takes.length];
  }
  if (archetype === 'internship') {
    const takes = [
      `An immersive opportunity for entry-level talent to experience authentic production sprints, version control workflows, and senior code reviews at ${company}.`,
      `A supportive program where aspiring engineers work on real product deliverables alongside seasoned mentors, gaining foundational industry credentials.`,
      `Designed for emerging developers ready for practical software development learning, offering direct exposure to modern engineering practices.`
    ];
    return takes[seed % takes.length];
  }
  if (archetype === 'frontend') {
    const takes = [
      `An engaging opening for junior engineers eager to build responsive user interfaces and modern component architectures. ${company} provides structured pair programming and active design-system collaboration.`,
      `A high-impact opportunity for early-career developers looking to write clean, accessible frontend code and optimize client-side web performance within an active sprint cadence.`,
      `Tailored for entry-level technologists passionate about user-facing feature delivery, working alongside product designers and seasoned UI architects at ${company}.`
    ];
    return takes[seed % takes.length];
  }
  if (archetype === 'backend_cloud') {
    const takes = [
      `A robust launchpad for junior engineers looking to build scalable backend services, RESTful APIs, and reliable database integrations under guided technical leadership at ${company}.`,
      `Designed for early-career developers seeking immersion in live server architectures, automated CI/CD pipelines, and rigorous code reviews.`,
      `An ideal position for entry-level technologists looking to strengthen foundational distributed system design, cloud primitives, and containerized deployments.`
    ];
    return takes[seed % takes.length];
  }
  const generalTakes = [
    `A well-rounded opportunity for junior engineers to touch both client-side interfaces and backend logic, shipping real features directly into production at ${company}.`,
    `Joining ${company} as a ${title} gives early-career developers practical experience with modern development workflows, automated testing, and agile team cadences.`,
    `Tailored for entry-level developers ready to move beyond tutorial projects and take ownership of user-facing features within a collaborative engineering culture.`,
    `An exciting opening for early-career technologists focused on clean code, software design patterns, and high-velocity team collaboration at ${company}.`
  ];
  return generalTakes[seed % generalTakes.length];
}

function humanizeCareerTake(text, job) {
  if (!text) return '';
  const leadTake = generateLeadEngineerTake(job);

  if (text.includes('🎯 The FreshCommits Career Take:')) {
    const parts = text.split('🎯 The FreshCommits Career Take:');
    const afterHeader = parts[1] || '';
    if (afterHeader.includes('💡 Candidate Preparation Checklist:')) {
      const rest = afterHeader.substring(afterHeader.indexOf('💡 Candidate Preparation Checklist:'));
      return `🎯 The FreshCommits Career Take:\n${leadTake}\n\n${rest}`;
    }
  }

  const isOldGeneric =
    text.includes('actively investing in early-career talent') ||
    text.includes('structured exposure to modern production tooling') ||
    text.includes('high-leverage launchpad') ||
    text.includes('0–2 YoE') ||
    text.includes('0-2 YoE');

  if (isOldGeneric) {
    return leadTake;
  }

  return text;
}

async function pullFirestoreJobs() {
  console.log('Fetching all live jobs from Firestore database...');
  const res = await fetch(
    'https://firestore.googleapis.com/v1/projects/centered-module-9smzh/databases/ai-studio-juniordevhubentr-9fce9c23-e540-412e-ae3f-aca1eaf015f5/documents:runQuery',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'jobs' }],
        },
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to query Firestore: ${res.status} ${res.statusText}`);
  }

  const queryResults = await res.json();
  const cloudJobs = [];

  for (const item of queryResults) {
    if (!item.document || !item.document.fields) continue;
    const doc = item.document;
    const fields = doc.fields;
    const jobObj = {};
    for (const f in fields) {
      jobObj[f] = parseFirestoreVal(fields[f]);
    }
    const docId = doc.name.split('/').pop();
    jobObj.id = jobObj.id || docId;

    if (jobObj.description) {
      jobObj.description = humanizeCareerTake(jobObj.description, jobObj);
    }

    // Clean dead Clearbit URLs and ensure crisp, non-hanging Google Favicon or UI-Avatar
    let logo = jobObj.companyLogo || '';
    if (!logo || logo.includes('logo.clearbit.com')) {
      let domain = '';
      if (jobObj.companyWebsite) {
        try {
          const u = new URL(jobObj.companyWebsite.startsWith('http') ? jobObj.companyWebsite : `https://${jobObj.companyWebsite}`);
          domain = u.hostname.replace(/^www\./, '');
        } catch {}
      }
      if (!domain && logo && logo.includes('logo.clearbit.com/')) {
        const parts = logo.split('logo.clearbit.com/');
        if (parts[1]) domain = parts[1].replace(/[^a-zA-Z0-9.-]/g, '');
      }
      if (!domain && jobObj.applyUrl) {
        try {
          const u = new URL(jobObj.applyUrl);
          const parts = u.hostname.replace(/^www\./, '').split('.');
          if (parts.length >= 2) domain = parts.slice(-2).join('.');
        } catch {}
      }
      if (domain && domain.includes('.')) {
        jobObj.companyLogo = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
      } else {
        jobObj.companyLogo = `https://ui-avatars.com/api/?name=${encodeURIComponent(jobObj.company || 'FC')}&background=0F172A&color=fff&size=128&bold=true`;
      }
    }

    if (jobObj.title && jobObj.company && jobObj.applyUrl) {
      cloudJobs.push(jobObj);
    }
  }

  console.log(`Successfully fetched and parsed ${cloudJobs.length} valid jobs from Firestore!`);

  // Sort latest first
  cloudJobs.sort((a, b) => {
    const timeA = new Date(a.datePosted || '2026-01-01').getTime() || 0;
    const timeB = new Date(b.datePosted || '2026-01-01').getTime() || 0;
    return timeB - timeA;
  });

  // 1. Write to src/data/initialJobs.ts
  const initialJobsPath = path.join(rootDir, 'src', 'data', 'initialJobs.ts');
  const fileContent = `import { JobPosting } from '../types';\n\nexport const INITIAL_JOBS: JobPosting[] = ${JSON.stringify(
    cloudJobs,
    null,
    2
  )};\n`;
  fs.writeFileSync(initialJobsPath, fileContent, 'utf8');
  console.log(`Updated src/data/initialJobs.ts with ${cloudJobs.length} jobs.`);

  // 2. Build SYNCHRONOUS_JOBS dictionary for index.html
  const syncJobsObj = {};
  for (const job of cloudJobs) {
    if (!job || !job.id) continue;
    syncJobsObj[job.id] = {
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo || '',
      companyWebsite: job.companyWebsite || '',
      location: job.location || 'Remote',
      isRemote: Boolean(job.isRemote),
      applicantLocationRequirements: job.applicantLocationRequirements || job.country || 'US',
      city: job.city || 'San Francisco',
      state: job.state || 'CA',
      country: job.country || 'US',
      postalCode: job.postalCode || '94105',
      experienceLevel: job.experienceLevel || 'Entry Level',
      maxYearsExperience: job.maxYearsExperience || 1,
      category: job.category || 'Full Stack',
      employmentType: job.employmentType || 'FULL_TIME',
      salary: job.salary || { min: 0, max: 0, currency: 'USD', unit: 'YEAR' },
      description: job.description || '',
      responsibilities: job.responsibilities || [],
      qualifications: job.qualifications || [],
      skills: job.skills || [],
      applyUrl: job.applyUrl || '',
      datePosted: job.datePosted || '2026-09-28',
      validThrough: job.validThrough || '2026-11-28',
    };
  }

  const syncJobsString = 'var SYNCHRONOUS_JOBS = ' + JSON.stringify(syncJobsObj, null, 2) + ';';
  const indexHtmlPath = path.join(rootDir, 'index.html');
  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  const regex = /var SYNCHRONOUS_JOBS\s*=\s*\{[\s\S]*?\};/;

  if (!regex.test(html)) {
    console.error('Could not find SYNCHRONOUS_JOBS in index.html!');
    process.exit(1);
  }

  html = html.replace(regex, syncJobsString);
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log(`Updated index.html SYNCHRONOUS_JOBS with all ${Object.keys(syncJobsObj).length} jobs!`);

  // 3. Build complete public/sitemap.xml with ALL live jobs, articles, and static routes
  const today = new Date().toISOString().split('T')[0];
  const staticRoutes = [
    { loc: 'https://www.freshcommits.com/', priority: '1.0', changefreq: 'daily' },
    { loc: 'https://www.freshcommits.com/salary-guide', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/project-blueprints', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/career-tools', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/tools', priority: '0.90', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/insights', priority: '0.95', changefreq: 'weekly' },
    { loc: 'https://www.freshcommits.com/about/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/contact/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/privacy/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/privacy-policy/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/terms/', priority: '0.80', changefreq: 'monthly' },
    { loc: 'https://www.freshcommits.com/disclaimer/', priority: '0.60', changefreq: 'monthly' }
  ];

  // Read career article IDs from all article data files
  const articleFiles = [
    path.join(rootDir, 'src', 'data', 'careerArticles.ts'),
    path.join(rootDir, 'src', 'data', 'articles', 'pathwaysAndInterviews.ts'),
    path.join(rootDir, 'src', 'data', 'articles', 'applicationAndOutreach.ts'),
    path.join(rootDir, 'src', 'data', 'articles', 'specializedAndWorkplace.ts'),
    path.join(rootDir, 'src', 'data', 'articles', 'expandedFlagshipArticles.ts'),
    path.join(rootDir, 'src', 'data', 'articles', 'technicalMasteryArticles.ts')
  ];
  const allArticleIds = [];
  for (const f of articleFiles) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      const matches = [...content.matchAll(/id:\s*'([a-z0-9-]+)'/g)]
        .map((m) => m[1])
        .filter((id) => !id.startsWith('doc-40')); // Exclude vector snippet IDs
      allArticleIds.push(...matches);
    }
  }
  const uniqueArticleIds = Array.from(new Set(allArticleIds));

  let sitemapXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  sitemapXml += '  <!-- Core Application & Index Hubs -->\n';

  for (const r of staticRoutes) {
    sitemapXml += `  <url>\n    <loc>${r.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>\n`;
  }

  sitemapXml += '\n  <!-- Editorial Career Insights Guides -->\n';
  for (const artId of uniqueArticleIds) {
    sitemapXml += `  <url>\n    <loc>https://www.freshcommits.com/insights/${artId}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  sitemapXml += '\n  <!-- Verified Job Postings (Google Search & Google for Jobs Direct Indexing) -->\n';
  for (const job of cloudJobs) {
    if (!job || !job.id || job.status === 'DRAFT' || job.status === 'EXPIRED') continue;
    const jobDate = job.datePosted || today;
    sitemapXml += `  <url>\n    <loc>https://www.freshcommits.com/job/${job.id}</loc>\n    <lastmod>${jobDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n  </url>\n`;
  }

  sitemapXml += '</urlset>\n';

  const sitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');
  console.log(`Generated public/sitemap.xml with ${staticRoutes.length + uniqueArticleIds.length + cloudJobs.length} URLs!`);
}

pullFirestoreJobs().catch((err) => {
  console.error('Error pulling Firestore jobs:', err);
  process.exit(1);
});
