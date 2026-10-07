import { JobPosting } from '../types';
import { CareerArticle } from '../data/careerArticles';

/**
 * Finds top contextual jobs from the active job database that match an article's
 * subject matter, technical stack, or role taxonomy.
 * This establishes an authoritative Internal Linking Mesh bridging editorial guidance
 * to actionable, live verified employment requisitions (0-2 YoE).
 */
export function getContextualJobsForArticle(
  article: CareerArticle,
  allJobs: JobPosting[],
  limit = 3
): JobPosting[] {
  if (!allJobs || allJobs.length === 0) return [];

  const text = `${article.title} ${article.subtitle} ${article.summary} ${(article.highlights || []).join(' ')}`.toLowerCase();
  const tag = article.tag.toLowerCase();

  const scored = allJobs.map((job) => {
    let score = 0;
    const cat = (job.category || '').toLowerCase();
    const title = (job.title || '').toLowerCase();
    const desc = (job.description || '').toLowerCase();
    const skills = (job.skills || []).map((s) => s.toLowerCase());

    // Role-specific matches
    if ((text.includes('frontend') || text.includes('react') || text.includes('css')) && (cat === 'frontend' || title.includes('frontend') || skills.includes('react'))) {
      score += 15;
    }
    if ((text.includes('backend') || text.includes('node') || text.includes('database') || text.includes('sql') || text.includes('api')) && (cat === 'backend' || title.includes('backend') || title.includes('api'))) {
      score += 14;
    }
    if ((text.includes('full stack') || text.includes('fullstack')) && (cat === 'full stack' || title.includes('full stack') || title.includes('fullstack'))) {
      score += 12;
    }
    if ((text.includes('devops') || text.includes('cloud') || text.includes('infrastructure') || text.includes('sre') || text.includes('docker') || text.includes('terraform') || text.includes('kubernetes')) && (cat.includes('devops') || title.includes('devops') || title.includes('cloud') || title.includes('sre'))) {
      score += 20;
    }
    if ((text.includes('cybersecurity') || text.includes('security') || text.includes('soc analyst') || text.includes('pentest')) && (title.includes('security') || desc.includes('security') || skills.includes('security'))) {
      score += 22;
    }
    if ((text.includes('mobile') || text.includes('ios') || text.includes('android') || text.includes('swift') || text.includes('kotlin')) && (cat === 'mobile' || title.includes('ios') || title.includes('android') || title.includes('mobile'))) {
      score += 18;
    }
    if ((text.includes('data') || text.includes('ai') || text.includes('machine learning') || text.includes('analytics')) && (cat.includes('data') || title.includes('data') || title.includes('ai') || title.includes('ml'))) {
      score += 14;
    }
    if ((text.includes('system design') || text.includes('architecture')) && (cat === 'backend' || cat === 'full stack' || title.includes('systems'))) {
      score += 10;
    }

    // Technology keywords
    const techKeywords = ['python', 'typescript', 'javascript', 'java', 'golang', 'c++', 'aws', 'docker', 'git'];
    for (const kw of techKeywords) {
      if (text.includes(kw) && (skills.includes(kw) || desc.includes(kw) || title.includes(kw))) {
        score += 4;
      }
    }

    // Keyword match on title terms
    const titleWords = title.split(/[\s,()/-]+/).filter((w) => w.length > 3);
    for (const tw of titleWords) {
      if (text.includes(tw)) {
        score += 3;
      }
    }

    // Strategy & Resume guides align generally with top active entry-level software openings
    if (tag.includes('resume') || tag.includes('screening') || tag.includes('job search') || tag.includes('application') || tag.includes('interview')) {
      if (job.status === 'ACTIVE') score += 5;
      if (job.experienceLevel === 'Entry Level' || job.experienceLevel === 'New Grad') score += 4;
    }

    // Prioritize active & recently verified postings
    if (job.status === 'ACTIVE') score += 5;
    if (job.atsVerified) score += 2;

    return { job, score };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.score - a.score);

  // Take top N distinct jobs
  const seenIds = new Set<string>();
  const results: JobPosting[] = [];

  for (const item of scored) {
    if (!seenIds.has(item.job.id)) {
      seenIds.add(item.job.id);
      results.push(item.job);
      if (results.length >= limit) break;
    }
  }

  return results;
}

/**
 * Finds top contextual career field guides for a specific job posting based on
 * its title, category, skills, and requirements.
 * Establishes the reverse direction of the Internal Linking Mesh:
 * Job Posting -> Relevant Preparation Field Guides
 */
export function getContextualArticlesForJob(
  job: JobPosting,
  allArticles: CareerArticle[],
  limit = 2
): CareerArticle[] {
  if (!allArticles || allArticles.length === 0) return [];

  const text = `${job.title} ${job.category} ${(job.skills || []).join(' ')} ${job.description || ''}`.toLowerCase();
  const cat = (job.category || '').toLowerCase();

  const scored = allArticles.map((art) => {
    let score = 0;
    const artText = `${art.title} ${art.subtitle} ${art.summary} ${art.tag}`.toLowerCase();

    // Direct category matches
    if (cat.includes('frontend') && (artText.includes('frontend') || artText.includes('react'))) score += 15;
    if (cat.includes('backend') && (artText.includes('backend') || artText.includes('system design') || artText.includes('database'))) score += 15;
    if (cat.includes('full stack') && (artText.includes('full stack') || artText.includes('portfolio') || artText.includes('system design'))) score += 14;
    if (cat.includes('devops') && (artText.includes('devops') || artText.includes('cloud') || artText.includes('infrastructure'))) score += 20;
    if (cat.includes('data') && (artText.includes('data') || artText.includes('python'))) score += 15;
    if (cat.includes('mobile') && (artText.includes('mobile') || artText.includes('portfolio'))) score += 15;

    // Technical skills matching
    const skills = (job.skills || []).map((s) => s.toLowerCase());
    for (const skill of skills) {
      if (artText.includes(skill)) score += 3;
    }

    // High-value preparation guides (ATS resume, take-home challenge, reverse interviewing)
    if (art.id === 'junior-swe-resume-ats-formula') score += 4;
    if (art.id === 'take-home-coding-challenge-playbook') score += 4;
    if (art.id === 'reverse-interviewing-engineering-teams') score += 3;

    return { article: art, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.article);
}
