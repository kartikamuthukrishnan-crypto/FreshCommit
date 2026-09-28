import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function syncJobs() {
  const initialJobsPath = path.join(rootDir, 'src', 'data', 'initialJobs.ts');
  const indexHtmlPath = path.join(rootDir, 'index.html');

  const content = fs.readFileSync(initialJobsPath, 'utf8');
  
  // Extract INITIAL_JOBS array using tsx / dynamic import
  const { execSync } = await import('node:child_process');
  const jobsJson = execSync(
    `npx tsx -e 'import { INITIAL_JOBS } from "./src/data/initialJobs"; console.log(JSON.stringify(INITIAL_JOBS));'`,
    { cwd: rootDir }
  ).toString();

  const jobs = JSON.parse(jobsJson);
  console.log(`Loaded ${jobs.length} jobs from INITIAL_JOBS.`);

  const syncJobsObj = {};
  for (const job of jobs) {
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
      validThrough: job.validThrough || '2026-11-28'
    };
  }

  const syncJobsString = 'var SYNCHRONOUS_JOBS = ' + JSON.stringify(syncJobsObj, null, 2) + ';';

  let html = fs.readFileSync(indexHtmlPath, 'utf8');
  const regex = /var SYNCHRONOUS_JOBS\s*=\s*\{[\s\S]*?\};/;
  
  if (!regex.test(html)) {
    console.error('Could not find SYNCHRONOUS_JOBS in index.html!');
    process.exit(1);
  }

  html = html.replace(regex, syncJobsString);
  fs.writeFileSync(indexHtmlPath, html, 'utf8');
  console.log('Successfully updated SYNCHRONOUS_JOBS in index.html with all ' + Object.keys(syncJobsObj).length + ' jobs!');
}

syncJobs().catch(console.error);
