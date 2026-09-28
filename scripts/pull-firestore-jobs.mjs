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
