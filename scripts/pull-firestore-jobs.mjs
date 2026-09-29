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

function humanizeCareerTake(text, job) {
  if (!text) return '';
  const seed = (job.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const titleLower = (job.title || '').toLowerCase();
  let phrase = '';

  if (titleLower.includes('graduate') || titleLower.includes('grad') || titleLower.includes('university') || titleLower.includes('campus') || titleLower.includes('trainee')) {
    const list = [
      'new graduates launching their software engineering careers',
      'new graduates seeking structured technical mentorship and velocity',
      'new graduates ready to transition academic foundations into production code'
    ];
    phrase = list[seed % list.length];
  } else if (titleLower.includes('fresher') || titleLower.includes('freshers') || titleLower.includes('open for freshers') || titleLower.includes('no experience')) {
    const list = [
      'freshers transitioning into commercial software teams',
      'freshers and aspiring developers eager for guided engineering mentorship',
      'freshers seeking a foundational, high-support technical environment'
    ];
    phrase = list[seed % list.length];
  } else if (titleLower.includes('junior') || titleLower.includes('jr.')) {
    const list = [
      'junior engineers building high-velocity production systems',
      'junior engineers and developers ready for hands-on technical ownership',
      'junior engineers seeking a collaborative team with dedicated code reviews',
      'junior engineers looking to deepen their system design and debugging capabilities'
    ];
    phrase = list[seed % list.length];
  } else if (titleLower.includes('intern') || titleLower.includes('apprentice') || titleLower.includes('co-op')) {
    const list = [
      'entry-level talent seeking immersive production exposure',
      'entry-level developers ready for practical software development learning',
      'entry-level builders eager for hands-on engineering mentorship'
    ];
    phrase = list[seed % list.length];
  } else {
    const list = [
      'entry-level developers looking to establish strong engineering habits',
      'early-career developers in their first one to two years of commercial experience',
      'entry-level technologists seeking a collaborative, high-growth engineering environment',
      'early-career engineers ready to make a tangible, measurable product impact',
      'junior engineers launching their commercial software journey',
      'new graduates and emerging technologists seeking structured team mentorship',
      'freshers and emerging candidates eager to build real-world engineering depth'
    ];
    phrase = list[seed % list.length];
  }

  return text
    .replace(/0[–-]2\s*YoE\s+(engineers\s+and\s+tech\s+professionals|engineers|developers|candidates|professionals)/gi, phrase)
    .replace(/for\s+0[–-]2\s*YoE\b/gi, `for ${phrase}`)
    .replace(/0[–-]2\s*YoE/gi, phrase);
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
}

pullFirestoreJobs().catch((err) => {
  console.error('Error pulling Firestore jobs:', err);
  process.exit(1);
});
