import { JobCategory } from '../types';

export interface MockQuestionItem {
  roundNumber: number;
  roundTitle: string;
  roundType: 'System Safety' | 'Tech Stack Deep-Dive' | 'Production Incident' | 'Behavioral & Culture' | 'Reverse Interview';
  question: string;
  interviewerObjective: string;
  winningAnswerFormula: string;
  interviewerVerdict: string;
  keyKeywordsToSay: string[];
}

export interface MockInterviewPlan {
  roleTitle: string;
  companyName: string;
  category: JobCategory | string;
  rounds: MockQuestionItem[];
}

export function generateFullMockInterview(params: {
  title: string;
  company?: string;
  category?: JobCategory | string;
  skills?: string[];
}): MockInterviewPlan {
  const company = (params.company || 'The Hiring Company').trim();
  const title = (params.title || 'Software Engineer (Entry-Level)').trim();
  const cat = (params.category || 'Full Stack').toLowerCase();
  const skills = (params.skills || []).map((s) => s.trim());
  const topSkill = skills[0] || (cat.includes('front') ? 'React' : cat.includes('data') ? 'SQL' : 'JavaScript');

  const rounds: MockQuestionItem[] = [];

  // -------------------------------------------------------------
  // ROUND 1: System Safety & Concurrency
  // -------------------------------------------------------------
  if (cat.includes('front') || cat.includes('mobile')) {
    rounds.push({
      roundNumber: 1,
      roundTitle: 'Round 1: Defensive UI & User Safety',
      roundType: 'System Safety',
      question: `If a user on a weak mobile network repeatedly taps the primary action button (like 'Checkout' or 'Submit') 3 times in 1 second, how do you prevent duplicated network requests and accidental multi-charges?`,
      interviewerObjective: `Evaluating whether you instinctively build defensive user interfaces to safeguard customer finances and server load rather than relying purely on hope.`,
      winningAnswerFormula: `Immediately disable the submit button upon first click and render a loading spinner state to block repeated user input. Concurrently, attach a unique client-generated transaction UUID (idempotency key) in the request headers so the backend safely ignores duplicate payloads if a retry occurs.`,
      interviewerVerdict: `This answer proves you have real-world empathy for customer frustration and prevents expensive billing support emergencies on Day 1.`,
      keyKeywordsToSay: ['Button disabling', 'Idempotency key', 'Optimistic UI', 'Debouncing']
    });
  } else if (cat.includes('data') || cat.includes('ai')) {
    rounds.push({
      roundNumber: 1,
      roundTitle: 'Round 1: Analytical Query Safety & Scale',
      roundType: 'System Safety',
      question: `You are tasked with querying a production database containing 20+ million user activity logs for an executive dashboard. How do you prevent your query from locking tables and causing website downtime?`,
      interviewerObjective: `Assessing if you understand read replicas, query locks, execution plans, and index coverage rather than running brute-force analytical queries in production.`,
      winningAnswerFormula: `Route analytical queries strictly to read-only database replicas rather than the primary transactional node. Run EXPLAIN ANALYZE to verify index lookups instead of sequential full-table scans, query specific partitions by date range, and select only required column names rather than SELECT *.`,
      interviewerVerdict: `The interviewer breathes a sigh of relief knowing you won't bring down the main production application during peak traffic hours.`,
      keyKeywordsToSay: ['Read replica', 'EXPLAIN ANALYZE', 'Table partitioning', 'Index scan']
    });
  } else {
    // Backend, Full Stack, DevOps, Others
    rounds.push({
      roundNumber: 1,
      roundTitle: 'Round 1: Concurrency & Database Race Conditions',
      roundType: 'System Safety',
      question: `How do you write a backend reservation endpoint so that if two users attempt to purchase the exact last available inventory item at the exact same millisecond, only one succeeds and the database never goes into negative inventory?`,
      interviewerObjective: `Testing whether you grasp database race conditions and transactional isolation (ACID) rather than writing naive check-then-insert code.`,
      winningAnswerFormula: `Execute the reservation inside an atomic database transaction using row-level locking (e.g. SELECT ... FOR UPDATE) or a conditional update with an atomic constraint (e.g. UPDATE inventory SET stock = stock - 1 WHERE id = item_id AND stock > 0). If 0 rows are affected, immediately return a polite 409 Conflict.`,
      interviewerVerdict: `Shows you understand data integrity and high-traffic concurrency—habits that even many mid-level engineers struggle with.`,
      keyKeywordsToSay: ['Atomic transaction', 'Row-level locking', 'ACID isolation', '409 Conflict']
    });
  }

  // -------------------------------------------------------------
  // ROUND 2: Tech Stack Deep-Dive & Practical Gotchas
  // -------------------------------------------------------------
  if (cat.includes('front')) {
    rounds.push({
      roundNumber: 2,
      roundTitle: `Round 2: Frontend Architecture & Performance`,
      roundType: 'Tech Stack Deep-Dive',
      question: `In modern ${topSkill} applications, what causes accidental infinite re-render loops or memory leaks, and how do you systematically diagnose and fix them?`,
      interviewerObjective: `Evaluating deep knowledge of component lifecycles, dependency arrays in hooks, stale closures, and cleanup routines.`,
      winningAnswerFormula: `Infinite re-renders usually occur when an object, function, or array is declared inline and passed into a dependency array without memoization, or setting state unconditionally during render. Memory leaks happen when asynchronous event listeners or polling intervals aren't cleaned up in the hook's unmount return function. I use browser DevTools profilers to catch runaway render cycles.`,
      interviewerVerdict: `Proves you won't build laggy interfaces or freeze low-end laptops with accidental memory leaks.`,
      keyKeywordsToSay: ['Dependency array', 'useEffect cleanup', 'useCallback / useMemo', 'Profiler']
    });
  } else if (cat.includes('data') || cat.includes('ai')) {
    rounds.push({
      roundNumber: 2,
      roundTitle: `Round 2: Data Pipeline Integrity & Missing Values`,
      roundType: 'Tech Stack Deep-Dive',
      question: `When ingesting third-party data streams containing unpredictable null values, dirty strings, and mismatched timestamps, how do you architect your transformation pipeline so it never silently corrupts downstream models?`,
      interviewerObjective: `Testing data validation hygiene (schema contracts) versus brittle ad-hoc parsing scripts.`,
      winningAnswerFormula: `I enforce strict schema validation at the ingestion boundary using validation libraries (e.g. Pydantic or Great Expectations). Records that fail validation are routed to a Dead Letter Queue (DLQ) with alert telemetry, ensuring downstream analytics run exclusively on sanitized, normalized data without silent drift.`,
      interviewerVerdict: `Shows you prioritize data trustworthiness and pipeline observability over quick-and-dirty scripting.`,
      keyKeywordsToSay: ['Dead Letter Queue (DLQ)', 'Schema validation', 'Idempotent ingestion', 'Data drift']
    });
  } else {
    // Backend & Full Stack
    rounds.push({
      roundNumber: 2,
      roundTitle: `Round 2: API Architecture & Error Handling Standards`,
      roundType: 'Tech Stack Deep-Dive',
      question: `How do you structure API error responses across ${company}'s microservices so that both frontend engineers and mobile apps can handle failures gracefully without showing raw database crashes to users?`,
      interviewerObjective: `Assessing API contract design, RFC 7807 error standards, and avoiding raw stack trace leaks to the client.`,
      winningAnswerFormula: `I standardize all error payloads using consistent structured schemas with machine-readable error codes (e.g. { error: 'INSUFFICIENT_FUNDS', message: 'User-friendly explanation', timestamp: '...' }). Internal server exceptions are intercepted by a global middleware that logs full traces to secure monitoring tools, returning a sanitized 500 without exposing internal database schemas to the public.`,
      interviewerVerdict: `Demonstrates disciplined API contract design and security awareness regarding sensitive internal stack traces.`,
      keyKeywordsToSay: ['Standardized error schema', 'Global middleware', 'Sanitized responses', 'Audit logging']
    });
  }

  // -------------------------------------------------------------
  // ROUND 3: Real Production Incident & Debugging
  // -------------------------------------------------------------
  rounds.push({
    roundNumber: 3,
    roundTitle: `Round 3: Live Production Incident Triage`,
    roundType: 'Production Incident',
    question: `It is 2:00 PM on a Tuesday. A new deployment goes live, and within 3 minutes customer support reports that users cannot log in. What is your exact step-by-step triage sequence?`,
    interviewerObjective: `Evaluating operational maturity: Does the junior engineer stay calm and stop customer bleeding first, or do they scramble to hotfix unverified code directly in production?`,
    winningAnswerFormula: `Step 1: Immediately notify the team and initiate an automated rollback to the previous stable release commit—customer uptime is priority #1. Step 2: Once production is stabilized, reproduce the issue in a staging/local environment using centralized error log traces. Step 3: Write an automated regression test covering the edge case, verify the fix passes all CI checks, and schedule a clean redeployment with peer code review.`,
    interviewerVerdict: `The interviewer knows they can trust you on the team because you understand that stopping customer downtime always comes before personal pride.`,
    keyKeywordsToSay: ['Immediate rollback', 'Stop customer impact', 'Reproduce in staging', 'Regression test']
  });

  // -------------------------------------------------------------
  // ROUND 4: Behavioral & Engineering Team Culture
  // -------------------------------------------------------------
  rounds.push({
    roundNumber: 4,
    roundTitle: `Round 4: Code Review Feedback & Team Collaboration`,
    roundType: 'Behavioral & Culture',
    question: `You spent 2 days writing what you felt was an elegant solution. A Senior Engineer reviews your Pull Request and leaves 6 critical comments asking you to rewrite the logic to be simpler. How do you respond?`,
    interviewerObjective: `Testing coachability, lack of ego, and understanding that maintainability across 5 years is more valuable than clever 1-line code.`,
    winningAnswerFormula: `I welcome the feedback as an opportunity to level up. Code reviews aren't personal evaluations; they protect the company's long-term maintainability. I review each comment thoughtfully, implement the requested simplifications, and if any point is unclear, I hop on a quick 5-minute huddle with the senior engineer to understand their architectural perspective before updating the PR.`,
    interviewerVerdict: `Signals exceptional maturity and coachability—the single most valued trait when hiring early-career software developers.`,
    keyKeywordsToSay: ['Ego-free mindset', 'Code maintainability', 'Active listening', 'Growth mindset']
  });

  // -------------------------------------------------------------
  // ROUND 5: Reverse-Interviewing Question to the Hiring Manager
  // -------------------------------------------------------------
  rounds.push({
    roundNumber: 5,
    roundTitle: `Round 5: What to Ask the Interviewer (The Closer)`,
    roundType: 'Reverse Interview',
    question: `At the end of round 1, the interviewer asks: "Do you have any questions for us about ${company} or this role?" What is the best question to ask?`,
    interviewerObjective: `Checking if the candidate has real curiosity about the company's engineering standards and engineering culture, rather than asking generic questions about vacation days.`,
    winningAnswerFormula: `"What does successful code review hygiene look like on this team, and what is one technical accomplishment an entry-level engineer achieved in their first 90 days at ${company} that really impressed you?"`,
    interviewerVerdict: `Leaves an unforgettable impression as a thoughtful, ambitious engineer who is already envisioning how to make an impact on their team.`,
    keyKeywordsToSay: ['90-day impact', 'Engineering hygiene', 'Team mentorship', 'Continuous learning']
  });

  return {
    roleTitle: title,
    companyName: company,
    category: params.category || 'Full Stack',
    rounds
  };
}
