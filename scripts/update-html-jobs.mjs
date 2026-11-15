import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function syncJobs() {
  const publicJobsJsonPath = path.join(rootDir, 'public', 'data', 'jobs.json');
  const indexHtmlPath = path.join(rootDir, 'index.html');

  // Ensure index.html stays slim without inline SYNCHRONOUS_JOBS bloat
  if (fs.existsSync(indexHtmlPath)) {
    let html = fs.readFileSync(indexHtmlPath, 'utf8');
    const regex = /var SYNCHRONOUS_JOBS\s*=\s*\{[\s\S]*?\};/;
    if (regex.test(html)) {
      html = html.replace(regex, 'var SYNCHRONOUS_JOBS = {};');
      fs.writeFileSync(indexHtmlPath, html, 'utf8');
      console.log('Ensured SYNCHRONOUS_JOBS in index.html remains lightweight ({}).');
    }
  }

  if (fs.existsSync(publicJobsJsonPath)) {
    const jobs = JSON.parse(fs.readFileSync(publicJobsJsonPath, 'utf8'));
    console.log(`Verified public/data/jobs.json contains ${Array.isArray(jobs) ? jobs.length : 0} jobs.`);
  } else {
    console.warn('public/data/jobs.json does not exist yet. Run scripts/pull-firestore-jobs.mjs to populate it.');
  }
}

syncJobs().catch(console.error);
