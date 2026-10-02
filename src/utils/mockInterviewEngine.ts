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
  companyDomain: string;
  category: JobCategory | string;
  rounds: MockQuestionItem[];
}

type CompanyDomainType =
  | 'fintech'
  | 'ecommerce'
  | 'collaboration'
  | 'cloud_infra'
  | 'streaming_iot'
  | 'ai_search'
  | 'healthcare_enterprise'
  | 'general';

function inferCompanyDomain(company: string): { domain: CompanyDomainType; label: string } {
  const c = (company || '').toLowerCase();

  if (c.includes('stripe') || c.includes('coinbase') || c.includes('jpmorgan') || c.includes('chase') || c.includes('pimco') || c.includes('paypal') || c.includes('robinhood') || c.includes('bank') || c.includes('fintech') || c.includes('wealth') || c.includes('capital') || c.includes('pay')) {
    return { domain: 'fintech', label: 'Payments & Financial Systems' };
  }

  if (c.includes('amazon') || c.includes('shopify') || c.includes('walmart') || c.includes('target') || c.includes('ebay') || c.includes('patterson') || c.includes('retail') || c.includes('commerce') || c.includes('store')) {
    return { domain: 'ecommerce', label: 'E-Commerce & High-Volume Logistics' };
  }

  if (c.includes('figma') || c.includes('slack') || c.includes('meta') || c.includes('canva') || c.includes('notion') || c.includes('discord') || c.includes('snap') || c.includes('pinterest') || c.includes('zoom') || c.includes('collab')) {
    return { domain: 'collaboration', label: 'Real-Time Collaboration & Interactive UX' };
  }

  if (c.includes('cloudflare') || c.includes('datadog') || c.includes('crowdstrike') || c.includes('palo alto') || c.includes('red hat') || c.includes('hashicorp') || c.includes('docker') || c.includes('infra') || c.includes('security') || c.includes('sre')) {
    return { domain: 'cloud_infra', label: 'Distributed Infrastructure & Telemetry' };
  }

  if (c.includes('peloton') || c.includes('netflix') || c.includes('spotify') || c.includes('apple') || c.includes('roku') || c.includes('paramount') || c.includes('elevenlabs') || c.includes('stream') || c.includes('media') || c.includes('audio') || c.includes('video')) {
    return { domain: 'streaming_iot', label: 'Media Streaming & Connected Devices' };
  }

  if (c.includes('google') || c.includes('openai') || c.includes('anthropic') || c.includes('nvidia') || c.includes('microsoft') || c.includes('deepmind') || c.includes('search') || c.includes('ai')) {
    return { domain: 'ai_search', label: 'High-Scale Search & AI Model Serving' };
  }

  if (c.includes('mindex') || c.includes('regeneron') || c.includes('oneoncology') || c.includes('peoplecert') || c.includes('cgi') || c.includes('health') || c.includes('medical') || c.includes('pharma') || c.includes('enterprise') || c.includes('consulting')) {
    return { domain: 'healthcare_enterprise', label: 'Enterprise Security, Compliance & Healthcare' };
  }

  // Deterministic seed for any custom company name
  const seed = (c || 'freshcommits').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const fallbacks: { domain: CompanyDomainType; label: string }[] = [
    { domain: 'fintech', label: 'Financial Services & Core Ledger' },
    { domain: 'cloud_infra', label: 'Cloud Infrastructure & High-Availability' },
    { domain: 'ecommerce', label: 'High-Scale Transactions & Catalog' },
    { domain: 'collaboration', label: 'Distributed Systems & Live Client Sync' }
  ];
  return fallbacks[seed % fallbacks.length];
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

  const { domain, label } = inferCompanyDomain(company);
  const rounds: MockQuestionItem[] = [];

  // =============================================================
  // ROUND 1: Company Domain System Safety & Concurrency
  // =============================================================
  if (domain === 'fintech') {
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: Payment Idempotency & Financial Safety (${company})`,
      roundType: 'System Safety',
      question: `At ${company}, thousands of payment webhooks and transfer requests arrive simultaneously. How do you design the transaction endpoint so that network timeouts or duplicate webhook deliveries never cause a customer to be charged twice or create balance inconsistencies?`,
      interviewerObjective: `Evaluating whether you instinctively grasp Idempotency Keys, distributed lock mechanisms, and double-entry accounting safety in high-stakes financial systems.`,
      winningAnswerFormula: `I enforce an Idempotency-Key header on all state-mutating requests. Before executing a ledger update, we record the key in Redis or Postgres within an atomic transaction. If a subsequent retry arrives with the same key, we immediately return the cached original response without reprocessing. For balance updates, we use strict double-entry ledger entries rather than simple in-place integer arithmetic.`,
      interviewerVerdict: `The interviewer immediately realizes: 'This candidate won't trigger billing discrepancies or customer balance disputes on Day 1.'`,
      keyKeywordsToSay: ['Idempotency-Key', 'Double-entry ledger', 'Atomic transaction', 'Deduplication']
    });
  } else if (domain === 'ecommerce') {
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: High-Volume Flash Sale Concurrency (${company})`,
      roundType: 'System Safety',
      question: `During a major flash sale at ${company}, 5,000 shoppers attempt to check out the final 10 inventory units in the same second. How do you structure the inventory reservation so stock never drops below 0 and the database doesn't lock up?`,
      interviewerObjective: `Testing concurrency controls, database row contention, and graceful 409 Conflict handling under extreme transactional burst loads.`,
      winningAnswerFormula: `I avoid long-lived database locks. Instead, I use atomic conditional updates with constraints (e.g. UPDATE inventory SET stock = stock - 1 WHERE item_id = :id AND stock > 0) or an in-memory Redis token bucket with DECR. If zero units remain, we return a fast 409 Conflict immediately to free the HTTP worker.`,
      interviewerVerdict: `Shows you understand high-concurrency database contention—a critical skill for e-commerce and logistics platforms.`,
      keyKeywordsToSay: ['Conditional UPDATE', 'Atomic decrement', '409 Conflict', 'Stock lock contention']
    });
  } else if (domain === 'collaboration') {
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: Real-Time Collaborative State Sync (${company})`,
      roundType: 'System Safety',
      question: `In an interactive app like ${company}, two remote teammates edit the exact same document or canvas element at the same millisecond while offline, then reconnect. How do you resolve the conflicting updates without clobbering either user's work?`,
      interviewerObjective: `Evaluating knowledge of Conflict-free Replicated Data Types (CRDTs), Operational Transformation (OT), and optimistic local state reconciliation.`,
      winningAnswerFormula: `I rely on CRDTs (like Yjs or Automerge) or Operational Transformation with monotonic vector clocks. The client updates locally with optimistic UI for instant feedback, then broadcasts serialized delta mutations over WebSockets. The server acts as a lightweight sequencer, guaranteeing eventual consistency across all connected peers.`,
      interviewerVerdict: `Proves you understand modern collaborative web architecture and won't build apps that overwrite customer edits.`,
      keyKeywordsToSay: ['CRDTs', 'Vector clocks', 'Optimistic UI', 'Delta mutations']
    });
  } else if (domain === 'cloud_infra') {
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: Distributed Rate-Limiting & Edge Defense (${company})`,
      roundType: 'System Safety',
      question: `At ${company}, an unexpected spike of 500,000 requests per second hits your edge gateways from an unknown IP cluster. How do you implement distributed rate-limiting without adding latency to legitimate traffic?`,
      interviewerObjective: `Assessing knowledge of token-bucket and sliding-window rate limit algorithms running on low-latency memory stores (Redis/Envoy) at the network edge.`,
      winningAnswerFormula: `I implement a sliding-window rate limiter using Redis sorted sets or token-bucket counters at the API gateway layer before hitting origin microservices. Traffic exceeding the quota receives an immediate HTTP 429 Too Many Requests with a Retry-After header, protecting upstream services while healthy users experience zero performance degradation.`,
      interviewerVerdict: `Demonstrates systems engineering maturity and the ability to safeguard infrastructure against traffic avalanches.`,
      keyKeywordsToSay: ['Sliding window counter', 'HTTP 429 Too Many Requests', 'Token bucket', 'Gateway layer']
    });
  } else if (domain === 'streaming_iot') {
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: Real-Time Telemetry & Device Ingestion (${company})`,
      roundType: 'System Safety',
      question: `At ${company}, tens of thousands of connected devices stream heart rate, cadence, and video telemetry continuously. What happens if a device experiences intermittent WiFi dropouts, and how do you ensure zero data loss without stalling live metrics?`,
      interviewerObjective: `Testing device buffer design, local SQLite spooling, idempotent batch uploads, and asynchronous message queues (Kafka/RabbitMQ).`,
      winningAnswerFormula: `The client/device buffers metrics locally in a ring-buffer on flash storage with timestamps. When connectivity restores, it flushes telemetry in compressed, timestamped batches with exponential backoff. On the backend, we ingest via message queues like Kafka to decouple high-speed ingestion from downstream database writes.`,
      interviewerVerdict: `The interviewer sees you understand hardware-software edge constraints and resilient IoT/streaming telemetry.`,
      keyKeywordsToSay: ['Ring-buffer', 'Message queue (Kafka)', 'Exponential backoff', 'Timestamped batches']
    });
  } else if (domain === 'ai_search') {
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: High-Throughput Search & Model Serving (${company})`,
      roundType: 'System Safety',
      question: `At ${company}, thousands of concurrent queries request vector embeddings and search indexing. How do you handle sudden model latency spikes or upstream inference timeouts without cascading into a total system freeze?`,
      interviewerObjective: `Evaluating circuit breaker patterns, semantic response caching, and timeout budgets in modern AI and search architectures.`,
      winningAnswerFormula: `I implement a Circuit Breaker pattern (with libraries like Resilience4j or Polly) alongside strict timeout budgets (e.g. 500ms max). If the vector model exceeds the latency threshold, we fall back to a warm semantic cache or cached keyword search results, logging a warning while preserving a sub-second response for the user.`,
      interviewerVerdict: `Shows you design resilient AI and search architectures that degrade gracefully instead of failing catastrophically.`,
      keyKeywordsToSay: ['Circuit breaker', 'Semantic caching', 'Timeout budget', 'Graceful degradation']
    });
  } else {
    // Healthcare & Enterprise
    rounds.push({
      roundNumber: 1,
      roundTitle: `Round 1: PII Protection, Encryption & Compliance (${company})`,
      roundType: 'System Safety',
      question: `At ${company}, applications handle sensitive customer PII and enterprise records. How do you architect database queries and audit logs so that sensitive patient or client data is never accidentally leaked into error logs, monitoring tools, or third-party APMs?`,
      interviewerObjective: `Testing security hygiene, data sanitization middlewares, column-level encryption, and zero-trust audit compliance.`,
      winningAnswerFormula: `I enforce strict PII redaction middlewares that scrub fields like SSN, medical notes, and credentials before serialization. In databases, sensitive attributes use envelope encryption at rest. Audit logs record who accessed what record and when, but log only pseudonymous entity IDs rather than plaintext personal information.`,
      interviewerVerdict: `Signals exceptional security hygiene—a must-have for enterprise, government, and healthcare engineering organizations.`,
      keyKeywordsToSay: ['Field-level encryption', 'PII redaction middleware', 'Audit trail', 'Zero-trust access']
    });
  }

  // =============================================================
  // ROUND 2: Company-Specific Tech Stack & Architectural Gotchas
  // =============================================================
  if (cat.includes('front')) {
    rounds.push({
      roundNumber: 2,
      roundTitle: `Round 2: Frontend Architecture & Sub-Second UX (${company})`,
      roundType: 'Tech Stack Deep-Dive',
      question: `In ${company}'s web applications, how do you prevent large client-side bundles and heavy UI components from degrading Time to Interactive (TTI) on entry-level mobile devices?`,
      interviewerObjective: `Evaluating code splitting, lazy loading, route chunking, and bundle analysis in modern web engineering.`,
      winningAnswerFormula: `I configure route-level code splitting using dynamic imports (React.lazy / import()) and tree-shaking to keep the initial critical JavaScript bundle under 150KB. Heavy non-critical assets (like analytics, modals, or charts) are deferred until user interaction or viewport intersection via IntersectionObserver.`,
      interviewerVerdict: `Proves you build fast, accessible web apps that won't make ${company}'s homepage feel sluggish.`,
      keyKeywordsToSay: ['Dynamic import()', 'Route code splitting', 'IntersectionObserver', 'Bundle budget']
    });
  } else if (cat.includes('data') || cat.includes('ai')) {
    rounds.push({
      roundNumber: 2,
      roundTitle: `Round 2: Data Pipeline Reliability & Missing Values (${company})`,
      roundType: 'Tech Stack Deep-Dive',
      question: `When feeding raw production data into ${company}'s analytical models, how do you handle unexpected schema changes (e.g. an upstream API suddenly renames a column or sends null values)?`,
      interviewerObjective: `Assessing contract testing, Dead Letter Queues (DLQ), and automated schema enforcement tools.`,
      winningAnswerFormula: `I implement explicit contract validation at the ingestion boundary using tools like Pydantic or Great Expectations. If a batch contains schema anomalies, it is routed to a Dead Letter Queue (DLQ) with alert telemetry, ensuring bad records are quarantined while healthy data continues processing without silent downstream corruption.`,
      interviewerVerdict: `Demonstrates that you value data integrity and pipeline observability over brittle ad-hoc scripts.`,
      keyKeywordsToSay: ['Dead Letter Queue (DLQ)', 'Schema contract', 'Data quarantine', 'Validation boundary']
    });
  } else {
    rounds.push({
      roundNumber: 2,
      roundTitle: `Round 2: Microservice API Design & Error Hygiene (${company})`,
      roundType: 'Tech Stack Deep-Dive',
      question: `How do you structure microservice API error responses at ${company} so that client apps receive actionable feedback without exposing internal database schemas or sensitive stack traces to attackers?`,
      interviewerObjective: `Testing API design standards (RFC 7807 Problem Details), global exception interceptors, and security against information disclosure.`,
      winningAnswerFormula: `I standardize error responses using RFC 7807 Problem Details with predictable error codes and user-friendly messages (e.g. { type: 'VALIDATION_ERROR', code: 'INVALID_PARAMETERS', message: '...' }). A global exception middleware intercepts uncaught exceptions, assigns a unique Correlation ID for internal tracing, and returns a generic 500 to the client to prevent security leaks.`,
      interviewerVerdict: `Demonstrates disciplined API contract hygiene and strong security awareness.`,
      keyKeywordsToSay: ['RFC 7807', 'Correlation ID', 'Global exception middleware', 'Information leakage']
    });
  }

  // =============================================================
  // ROUND 3: Production Incident Triage at That Company
  // =============================================================
  rounds.push({
    roundNumber: 3,
    roundTitle: `Round 3: Live Production Incident Triage at ${company}`,
    roundType: 'Production Incident',
    question: `It's 2:15 PM on a Thursday. You just merged a pull request into ${company}'s main branch. Within 4 minutes, Datadog alerts show HTTP 500 error rates jumping to 14% and user logins failing. What is your exact triage sequence?`,
    interviewerObjective: `Evaluating operational calm and priority setting: Does the junior engineer immediately stop customer impact with an automated rollback, or do they scramble to hotfix code on live servers?`,
    winningAnswerFormula: `Step 1: Immediately notify the on-call engineer and execute an automated rollback to the previous healthy deployment commit—customer uptime is priority #1. Step 2: Once production is stabilized, isolate the error stack traces in Datadog/CloudWatch using the release commit SHA. Step 3: Reproduce the bug in a local sandbox, write an automated regression test, and submit a vetted patch with senior peer review.`,
    interviewerVerdict: `The interviewer knows they can trust you on production deployments because you prioritize stopping customer downtime over personal ego.`,
    keyKeywordsToSay: ['Automated rollback', 'Mitigate customer impact', 'Regression test', 'Centralized error logs']
  });

  // =============================================================
  // ROUND 4: Code Review Feedback & Engineering Culture
  // =============================================================
  rounds.push({
    roundNumber: 4,
    roundTitle: `Round 4: Code Review Feedback & Team Collaboration (${company})`,
    roundType: 'Behavioral & Culture',
    question: `You spent 3 days writing a clever caching algorithm for ${company}. A Staff Engineer leaves a review comment: "This is clever, but it adds too much cognitive complexity. Please replace this with standard library primitives." How do you handle this?`,
    interviewerObjective: `Testing coachability, lack of ego, and recognizing that maintainability across 5 years is vastly more valuable than clever code.`,
    winningAnswerFormula: `I thank the Staff Engineer for their perspective and embrace the feedback. Code reviews are not personal critiques—they protect long-term team maintainability. I replace the custom logic with the simpler standard library approach. If I'm curious about the specific edge-case trade-offs they considered, I'll ask for a quick 5-minute coffee chat or huddle to learn their architectural perspective.`,
    interviewerVerdict: `Signals exceptional maturity, coachability, and humility—the single most sought-after personality traits when hiring early-career developers.`,
    keyKeywordsToSay: ['Code maintainability', 'Humility', 'Constructive feedback', 'Team first']
  });

  // =============================================================
  // ROUND 5: Tailored Reverse-Interview Question for That Company
  // =============================================================
  let customCloser = `"What does successful code review hygiene look like on ${company}'s engineering team, and what is one technical project a junior engineer completed in their first 90 days that really impressed you?"`;
  if (domain === 'fintech') {
    customCloser = `"Given ${company}'s zero-tolerance for transaction discrepancies, how does your engineering team safely test payment edge cases and rollback financial migrations in staging?"`;
  } else if (domain === 'ecommerce') {
    customCloser = `"How does ${company}'s engineering team simulate peak Black Friday traffic spikes in pre-production to test inventory lock contention?"`;
  } else if (domain === 'collaboration') {
    customCloser = `"What architectural challenges around real-time latency and WebSockets is ${company}'s team actively working to solve over the next 12 months?"`;
  } else if (domain === 'cloud_infra') {
    customCloser = `"How does ${company} balance high-velocity feature shipping with the rigorous uptime SLAs required by enterprise infrastructure customers?"`;
  }

  rounds.push({
    roundNumber: 5,
    roundTitle: `Round 5: What to Ask the ${company} Interviewer (The Closer)`,
    roundType: 'Reverse Interview',
    question: `At the end of round 1, the hiring manager smiles and says: "We have 5 minutes left. What questions do you have for me about ${company} or this engineering team?"`,
    interviewerObjective: `Checking if the candidate has real intellectual curiosity about ${company}'s engineering reality, or if they only care about generic questions like vacation days.`,
    winningAnswerFormula: `${customCloser}`,
    interviewerVerdict: `Leaves an unforgettable impression as a serious, ambitious engineer who is already thinking like a contributing member of ${company}'s team.`,
    keyKeywordsToSay: ['Engineering culture', 'Pre-production testing', 'First 90-day impact', 'System reliability']
  });

  return {
    roleTitle: title,
    companyName: company,
    companyDomain: label,
    category: params.category || 'Full Stack',
    rounds
  };
}
