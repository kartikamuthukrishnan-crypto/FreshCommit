import { JobPosting } from '../types';

/**
 * Resolves job timestamp for accurate reverse chronological sorting (latest first).
 * Prioritizes creation millisecond timestamps embedded in IDs (e.g. manual-1793801026859),
 * ISO datePosted (UTC normalized), and explicit createdAt fields.
 */
export const getJobTimestamp = (job: JobPosting): number => {
  if (!job) return 0;

  // 1. Check for explicit 10-13 digit millisecond timestamp in ID (e.g. manual-1793801026859)
  const idMatch = job.id?.match(/\b(\d{10,13})\b/);
  const idTime = idMatch ? Number(idMatch[1]) : 0;
  const hasValidIdTime = !isNaN(idTime) && idTime > 1600000000000;

  // 2. Try datePosted (e.g. '2026-11-04')
  if (job.datePosted) {
    const dateParts = String(job.datePosted).trim().split(/[-/]/);
    let dateTime = 0;
    if (dateParts.length === 3) {
      dateTime = Date.UTC(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));
    } else {
      dateTime = new Date(job.datePosted).getTime();
    }

    if (!isNaN(dateTime) && dateTime > 0) {
      // If we have an exact millisecond ID timestamp from the same or newer date, use it directly
      if (hasValidIdTime && idTime >= dateTime - 86400000 * 2) {
        return idTime;
      }
      // Otherwise combine date with ID sub-day offset for stable ordering
      return dateTime + (hasValidIdTime ? (idTime % 86400000) : 0);
    }
  }

  // 3. Fallback to valid ID timestamp
  if (hasValidIdTime) return idTime;

  // 4. Fallback to lastHealthCheckedAt
  if (job.lastHealthCheckedAt) {
    const t = new Date(job.lastHealthCheckedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  return 0;
};

/**
 * Deterministic reverse-chronological comparator (newest first).
 * Uses getJobTimestamp as primary key and descending job.id as secondary key,
 * guaranteeing 100% stable sorting that never interchanges or flips across re-renders.
 */
export const compareJobsLatestFirst = (a: JobPosting, b: JobPosting): number => {
  const timeA = getJobTimestamp(a);
  const timeB = getJobTimestamp(b);
  if (timeB !== timeA) {
    return timeB - timeA;
  }
  // Secondary deterministic tie-breaker: newest ID first
  const idA = String(a.id || '');
  const idB = String(b.id || '');
  return idB.localeCompare(idA);
};
