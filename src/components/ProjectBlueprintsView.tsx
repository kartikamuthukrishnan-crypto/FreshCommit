import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Server,
  Layout,
  Database,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Cpu,
  ExternalLink,
  Target,
  FileCode2,
  AlertCircle
} from 'lucide-react';
import { JobCategory } from '../types';

export interface ProjectBlueprint {
  id: string;
  category: JobCategory | string;
  categoryTag: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner-Friendly' | 'Intermediate Early-Career' | 'Commercial-Ready';
  estTime: string;
  businessProblem: string;
  architectureDiagram: string[];
  techStack: string[];
  coreConcepts: string[];
  steps: {
    stepNum: number;
    title: string;
    description: string;
    codeSnippet?: string;
    verificationTip: string;
  }[];
  googleXyzResumeBullet: string;
  interviewerVerdict: string;
  targetRoles: string[];
}

export const BLUEPRINT_DATABASE: ProjectBlueprint[] = [
  // 1. BACKEND BLUEPRINT
  {
    id: 'webhook-ingestion-engine',
    category: 'Backend',
    categoryTag: 'Backend & Distributed Systems',
    title: 'The High-Throughput Webhook Ingestion Engine',
    subtitle: 'Idempotent transaction receiver with sliding-window rate limiting & dead letter queues',
    difficulty: 'Commercial-Ready',
    estTime: '6–8 Hours',
    businessProblem:
      'Payment processors (like Stripe or PayPal) send webhooks with retries. Naive backends crash under burst spikes or double-charge customers when network timeouts trigger duplicates. This project proves you can engineer fault-tolerant, zero-double-spend ingestion.',
    architectureDiagram: [
      'Client / Third-Party Webhook',
      '       ↓ (HTTP POST)',
      '[API Gateway Layer: HMAC Signature Verification]',
      '       ↓ (Valid Payload)',
      '[Redis Sliding-Window Rate Limiter: 100 req/sec limit]',
      '       ↓ (Quota OK)',
      '[Idempotency Store: Atomic UUID Lock Check in Postgres/Redis]',
      '       ↓ (New Request)',
      '[Worker Ingestion Queue: Async Job Processing]',
      '       ↓ (Failure after 3 retries)',
      '[Dead Letter Queue (DLQ) with Alert Observability]'
    ],
    techStack: ['Node.js / Express or Python / FastAPI', 'Redis', 'PostgreSQL', 'Docker', 'Jest / PyTest'],
    coreConcepts: [
      'HMAC-SHA256 Payload Verification',
      'Idempotency-Key Deduplication',
      'Sliding-Window Rate Limiting',
      'Atomic Database Transactions',
      'Dead Letter Queue (DLQ) Strategy'
    ],
    steps: [
      {
        stepNum: 1,
        title: 'Cryptographic Signature Verification Middleware',
        description: 'Verify the incoming HMAC-SHA256 webhook header against a shared secret to reject spoofed requests before hitting route handlers.',
        codeSnippet: `const verifyWebhookSignature = (req, secret) => {
  const signature = req.headers['x-webhook-signature'];
  const hash = crypto.createHmac('sha256', secret).update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(hash));
};`,
        verificationTip: 'Test with a mismatched secret in Postman; verify it returns an immediate HTTP 401 Unauthorized.'
      },
      {
        stepNum: 2,
        title: 'Redis Sliding-Window Rate Limiter',
        description: 'Implement a token-bucket or sliding-window log in Redis to cap incoming bursts from any single webhook tenant to 100 req/min.',
        verificationTip: 'Write an automated script firing 120 rapid requests; verify the 101st request returns HTTP 429 Too Many Requests with a Retry-After header.'
      },
      {
        stepNum: 3,
        title: 'Atomic Idempotency Guard in PostgreSQL',
        description: 'Store incoming event UUIDs in an idempotency table within a database transaction. If duplicate events arrive, return the cached result without re-executing business logic.',
        codeSnippet: `INSERT INTO idempotency_keys (key, response_payload, status)
VALUES ($1, $2, 'COMPLETED')
ON CONFLICT (key) DO NOTHING;`,
        verificationTip: 'Fire 3 concurrent requests with the identical UUID; verify exactly 1 succeeds and 2 return cached 200 responses with zero double-processing.'
      },
      {
        stepNum: 4,
        title: 'Exponential Backoff Worker with Dead Letter Queue',
        description: 'Process heavy tasks asynchronously. If a downstream service times out, retry at 1s, 2s, 4s before routing permanently unprocessable messages to a Dead Letter Queue.',
        verificationTip: 'Simulate a 500 error in the downstream worker; confirm the message retries 3 times then moves to the DLQ table with full error stack traces.'
      },
      {
        stepNum: 5,
        title: 'Automated Test Suite & Docker Compose Setup',
        description: 'Package the API, Redis, and Postgres into a one-command `docker compose up` with a 90%+ unit and integration test suite.',
        verificationTip: 'Run `npm test` or `pytest`; ensure all concurrency edge cases pass cleanly in under 5 seconds.'
      }
    ],
    googleXyzResumeBullet:
      'Architected an idempotent webhook ingestion service handling 1,200 req/sec with Redis sliding-window rate limiting and Dead Letter Queues, eliminating duplicate billing transactions and cutting API error rates by 99.4%.',
    interviewerVerdict:
      'Hiring managers immediately see that you understand data integrity, concurrency, and graceful degradation—qualities rarely found in junior resumes.',
    targetRoles: ['Backend Engineer', 'API Developer', 'Distributed Systems SWE']
  },

  // 2. FRONTEND BLUEPRINT
  {
    id: 'subsecond-search-engine',
    category: 'Frontend',
    categoryTag: 'Frontend & Web Architecture',
    title: 'The Sub-Second Search & Optimistic UI Engine',
    subtitle: 'High-speed searchable catalog with AbortController race mitigation & zero layout shift',
    difficulty: 'Commercial-Ready',
    estTime: '5–7 Hours',
    businessProblem:
      'Most early-career frontend apps freeze when typing fast because competing network requests finish out of order, or re-render excessively. This project proves you can architect accessible, sub-second search with zero race conditions and instant optimistic UI feedback.',
    architectureDiagram: [
      'User Types Rapid Query in Search Input',
      '       ↓ (300ms Debounce Delay)',
      '[AbortController: Cancels previous in-flight HTTP request]',
      '       ↓ (Stale Request Cleared)',
      '[Client LRU Memory Cache Check]',
      '  ├─ Hit: Return cached results in < 5ms',
      '  └─ Miss: Fetch fresh payload over network',
      '       ↓ (Data Returns)',
      '[Virtualized List Rendering: 10,000 items at 60 FPS]',
      '       ↓ (User Action: Save/Bookmark)',
      '[Optimistic Mutation with Automatic Rollback on Server 500]'
    ],
    techStack: ['React / TypeScript', 'Tailwind CSS', 'Vite', 'Vitest / React Testing Library'],
    coreConcepts: [
      'AbortController Network Cancellation',
      'Debouncing & Throttle Patterns',
      'Optimistic UI State Mutation & Rollback',
      'DOM Virtualization (Windowing)',
      'WCAG 2.1 AA Keyboard Navigation (ARIA)'
    ],
    steps: [
      {
        stepNum: 1,
        title: 'Asynchronous Race Condition Defense with AbortController',
        description: 'Tie the fetch logic to an AbortController inside an effect cleanup so when a user types a new character, previous pending HTTP requests are immediately aborted.',
        codeSnippet: `useEffect(() => {
  const controller = new AbortController();
  fetchResults(query, { signal: controller.signal })
    .catch((err) => { if (err.name !== 'AbortError') handleErr(err); });
  return () => controller.abort();
}, [query]);`,
        verificationTip: 'Simulate high latency (2000ms) on letter #1 and fast response (100ms) on letter #2; verify letter #1 results never overwrite letter #2.'
      },
      {
        stepNum: 2,
        title: 'Client-Side LRU Memory Cache',
        description: 'Cache query responses in an in-memory Map with a Maximum-Size eviction policy, serving back-to-back searches instantly without redundant network calls.',
        verificationTip: 'Type "react", clear it, and type "react" again; verify the second query renders in < 5ms with zero network requests in the Network tab.'
      },
      {
        stepNum: 3,
        title: 'Optimistic Action Mutation with Error Rollback',
        description: 'When the user bookmarks or saves an item, immediately flip the UI state. If the server returns an error, cleanly rollback the UI and notify the user with an accessible toast.',
        verificationTip: 'Block network in Chrome DevTools and click Bookmark; verify the UI rolls back safely to its previous state with an error banner.'
      },
      {
        stepNum: 4,
        title: 'DOM Virtualization for 10,000+ Items at 60 FPS',
        description: 'Render only the 15 items currently visible in the user viewport rather than mounting 10,000 DOM elements simultaneously.',
        verificationTip: 'Inspect DOM elements in DevTools; verify that scrolling 10,000 items keeps the active DOM node count below 30 at all times.'
      },
      {
        stepNum: 5,
        title: 'WCAG 2.1 AA Keyboard Traversal & ARIA Combobox',
        description: 'Implement full ArrowUp, ArrowDown, Enter, and Escape keyboard navigation with proper aria-expanded and aria-activedescendant attributes.',
        verificationTip: 'Disconnect your mouse; verify you can search, navigate, select, and bookmark any item using only the keyboard.'
      }
    ],
    googleXyzResumeBullet:
      'Engineered a sub-second search catalog interface using AbortController and optimistic cache invalidation, reducing interaction-to-next-paint (INP) to 38ms and eliminating asynchronous network race conditions across 50K items.',
    interviewerVerdict:
      'Proves you care deeply about real-world user experience, defensive network programming, and accessible web standards.',
    targetRoles: ['Frontend Engineer', 'UI/UX Developer', 'React / Web SWE']
  },

  // 3. FULL STACK BLUEPRINT
  {
    id: 'containerized-microservice-cicd',
    category: 'Full Stack',
    categoryTag: 'Full Stack & DevOps Hygiene',
    title: 'Production Microservice with Automated CI/CD & Docker',
    subtitle: 'Multi-stage containerized app with GitHub Actions quality gates and zero-downtime health probes',
    difficulty: 'Commercial-Ready',
    estTime: '6–8 Hours',
    businessProblem:
      'Many junior applicants can write code locally, but have never deployed a containerized app or configured automated CI/CD pipelines. This project proves you understand commercial software engineering hygiene and automated pre-merge testing.',
    architectureDiagram: [
      'Developer Commits Code to Git Branch',
      '       ↓ (git push origin feature/xyz)',
      '[GitHub Actions Pipeline Triggers]',
      '  ├─ Job 1: Linter & TypeScript Type Checking',
      '  ├─ Job 2: Automated Unit & Integration Tests (Jest / PyTest)',
      '  └─ Job 3: Security Vulnerability Dependency Audit (npm audit / Snyk)',
      '       ↓ (All Checks Pass 100%)',
      '[Docker Multi-Stage Build: Minified 40MB Alpine Image]',
      '       ↓ (Automated Deploy)',
      '[Live Production Environment with /healthz & /readyz Probes]'
    ],
    techStack: ['TypeScript', 'Node.js / Express', 'Docker & Docker Compose', 'GitHub Actions', 'PostgreSQL'],
    coreConcepts: [
      'Multi-Stage Dockerfile Optimization',
      'GitHub Actions Pre-Merge CI Gates',
      'Automated Integration Testing',
      'Secret Management & .env Isolation',
      'Liveness (/healthz) and Readiness (/readyz) Probes'
    ],
    steps: [
      {
        stepNum: 1,
        title: 'Multi-Stage Docker Build Optimization',
        description: 'Author a multi-stage Dockerfile that builds the application in a build stage and copies only compiled assets to a slim Alpine runtime, shrinking the final image from 1GB to < 50MB.',
        codeSnippet: `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/server.js"]`,
        verificationTip: 'Run `docker images`; verify the final container size is under 60MB and runs as a non-root user (`node`).'
      },
      {
        stepNum: 2,
        title: 'Automated GitHub Actions CI Workflow',
        description: 'Configure a `.github/workflows/ci.yml` pipeline that triggers on pull requests, executing linting, type checks, and tests in parallel containers.',
        verificationTip: 'Create a test pull request with a broken test; verify that GitHub Actions automatically blocks the PR merge.'
      },
      {
        stepNum: 3,
        title: 'Zero-Downtime Health Probes (/healthz & /readyz)',
        description: 'Implement a `/healthz` liveness probe and a `/readyz` readiness probe that checks database connectivity before accepting incoming traffic.',
        verificationTip: 'Stop the database container; verify `/readyz` immediately returns HTTP 503 Service Unavailable so orchestrators route traffic away.'
      },
      {
        stepNum: 4,
        title: 'Strict Environment Variable Configuration Hygiene',
        description: 'Enforce schema validation (e.g. Zod or envalid) on server boot so the application crashes fast with clear error messages if required variables are missing.',
        verificationTip: 'Start the container without `DATABASE_URL`; verify it outputs a helpful error log and exits with code 1 instead of silently hanging.'
      },
      {
        stepNum: 5,
        title: 'Live Deployment with SSL & GitHub Readme Architecture Badge',
        description: 'Deploy the containerized service to a live URL (Render, Fly.io, or Railway) and document the architecture with an interactive README and CI pass badge.',
        verificationTip: 'Click the live URL from your phone; verify the service responds with HTTPS and valid JSON status in < 100ms.'
      }
    ],
    googleXyzResumeBullet:
      'Built a containerized full-stack service with multi-stage Docker builds and automated GitHub Actions CI/CD pipelines, enforcing 85% test coverage and reducing staging deployment cycles from 40 mins to 3.2 mins.',
    interviewerVerdict:
      'Demonstrates that you can join an engineering team and ship code immediately without needing senior engineers to teach you Git PR hygiene or Docker.',
    targetRoles: ['Full Stack Engineer', 'Junior DevOps / SRE', 'Software Engineer']
  },

  // 4. DATA / AI BLUEPRINT
  {
    id: 'realtime-data-pipeline-dlq',
    category: 'Data / AI',
    categoryTag: 'Data Engineering & AI Pipelines',
    title: 'The Real-Time Telemetry Pipeline with Schema Validation & DLQ',
    subtitle: 'High-throughput event ingestion with Pydantic contracts and automated data corruption quarantine',
    difficulty: 'Commercial-Ready',
    estTime: '6–8 Hours',
    businessProblem:
      'Companies lose millions when dirty third-party data or unexpected schema mutations silently corrupt downstream AI models and analytical reports. This project proves you know how to build contract-driven data ingestion that never silently drops or corrupts records.',
    architectureDiagram: [
      'Unpredictable Event Stream (IoT / Web Analytics)',
      '       ↓ (JSON Payloads)',
      '[Ingestion Gateway: Timestamp Normalization]',
      '       ↓ (Schema Boundary)',
      '[Contract Validator: Strict Pydantic / Zod Schema Enforcer]',
      '  ├─ Pass: Route to Clean Partitioned Columnar Storage (Parquet/PostgreSQL)',
      '  └─ Fail: Route to Dead Letter Queue (DLQ) with Telemetry Alert',
      '       ↓ (Analytical Consumer)',
      '[Materialized Aggregate Views: Pre-Calculated Fast Metrics]',
      '       ↓ (Fast Query)',
      '[Executive Dashboard: Query Runtime Optimized via B-Tree Indexing]'
    ],
    techStack: ['Python / FastAPI', 'PostgreSQL or DuckDB', 'Pydantic', 'Pandas / Polars', 'Docker'],
    coreConcepts: [
      'Data Contract Validation (Schema Enforcement)',
      'Dead Letter Queue (DLQ) Quarantine',
      'Materialized View Pre-aggregation',
      'B-Tree & Compound Indexing Strategy',
      'EXPLAIN ANALYZE Performance Profiling'
    ],
    steps: [
      {
        stepNum: 1,
        title: 'Strict Data Contract Validation Model',
        description: 'Define strong schemas using Pydantic or Zod with custom validators for date formats, positive numeric ranges, and sanitized strings.',
        codeSnippet: `class UserEventContract(BaseModel):
    event_id: UUID
    user_id: str = Field(min_length=3)
    amount_cents: int = Field(gt=0)
    timestamp: datetime`,
        verificationTip: 'Send a payload with a negative price or missing UUID; verify it is caught immediately before touching the database.'
      },
      {
        stepNum: 2,
        title: 'Dead Letter Queue (DLQ) Quarantine Mechanism',
        description: 'Route malformed payloads to a quarantine table with full error metadata and stack trace, ensuring zero data loss while preventing downstream model corruption.',
        verificationTip: 'Inspect the DLQ table after sending dirty test data; confirm the raw payload is saved alongside the exact validation error explanation.'
      },
      {
        stepNum: 3,
        title: 'Partitioned Storage & Compound Indexing',
        description: 'Partition the events table by year/month and create compound indexes on `(event_type, created_at DESC)` to eliminate expensive full-table scans.',
        verificationTip: 'Run `EXPLAIN ANALYZE` on 1,000,000 seeded rows; verify query cost drops from 45,000 to < 100 with an Index Scan.'
      },
      {
        stepNum: 4,
        title: 'Automated Materialized View Refresh',
        description: 'Pre-calculate high-traffic hourly and daily metric aggregates into a materialized view, enabling instant dashboard loading.',
        verificationTip: 'Query the materialized view; verify aggregation queries return in < 15ms even over millions of underlying rows.'
      },
      {
        stepNum: 5,
        title: 'Data Quality Healthcheck & Alerting Script',
        description: 'Write a nightly automated sanity check script that alerts if DLQ volume exceeds 1% of total ingestion volume.',
        verificationTip: 'Simulate high failure rate; confirm the script logs an alert with the exact anomaly ratio.'
      }
    ],
    googleXyzResumeBullet:
      'Constructed an automated event processing pipeline enforcing Pydantic schema validation and Dead Letter Queues, quarantining malformed telemetry with zero data loss and reducing analytical query runtime by 64% using partitioned B-tree indexing.',
    interviewerVerdict:
      'Signals strong data engineering rigor and data trustworthiness—essential skills that immediately differentiate you from boot-camp graduates.',
    targetRoles: ['Data Engineer', 'Analytics Engineer', 'Machine Learning / AI SWE']
  }
];

interface ProjectBlueprintsViewProps {
  onNavigateJobs?: (category?: string) => void;
}

export const ProjectBlueprintsView: React.FC<ProjectBlueprintsViewProps> = ({ onNavigateJobs }) => {
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedDiagramId, setExpandedDiagramId] = useState<string | null>(null);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('freshcommits_blueprint_progress');
      if (saved) {
        setCheckedSteps(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed loading blueprint progress', e);
    }
  }, []);

  const handleToggleStep = (stepKey: string) => {
    setCheckedSteps((prev) => {
      const next = { ...prev, [stepKey]: !prev[stepKey] };
      try {
        localStorage.setItem('freshcommits_blueprint_progress', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed saving blueprint progress', e);
      }
      return next;
    });
  };

  const handleCopyBullet = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredBlueprints =
    selectedTrack === 'all'
      ? BLUEPRINT_DATABASE
      : BLUEPRINT_DATABASE.filter((b) => b.category.toLowerCase().includes(selectedTrack.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Production-Ready Portfolio Blueprints &bull; 0–2 YoE Advantage
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Commercial Engineering Project Blueprints
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Replace generic tutorial clones (to-do lists, weather apps) with 4 real-world architectures hiring managers actively look for when screening early-career candidates.
        </p>
      </div>

      {/* Track Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTrack('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedTrack === 'all'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Engineering Tracks ({BLUEPRINT_DATABASE.length})
        </button>
        <button
          onClick={() => setSelectedTrack('backend')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedTrack === 'backend'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Backend &amp; API
        </button>
        <button
          onClick={() => setSelectedTrack('frontend')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedTrack === 'frontend'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Frontend &amp; UX
        </button>
        <button
          onClick={() => setSelectedTrack('full stack')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedTrack === 'full stack'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Full Stack &amp; DevOps
        </button>
        <button
          onClick={() => setSelectedTrack('data')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            selectedTrack === 'data'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Data &amp; AI
        </button>
      </div>

      {/* Blueprint Cards Grid */}
      <div className="space-y-8">
        {filteredBlueprints.map((bp) => {
          const completedCount = bp.steps.filter((s) => checkedSteps[`${bp.id}-${s.stepNum}`]).length;
          const progressPercent = Math.round((completedCount / bp.steps.length) * 100);
          const isDiagramExpanded = expandedDiagramId === bp.id;

          return (
            <div
              key={bp.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden hover:border-slate-300 transition-all"
            >
              {/* Card Header Banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-7 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase font-bold tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-800">
                      {bp.categoryTag}
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                      {bp.difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Est. Build: {bp.estTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
                      {completedCount} / {bp.steps.length} Steps Complete ({progressPercent}%)
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{bp.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">{bp.subtitle}</p>
                </div>

                {/* Tech Stack Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-2">
                  <span className="text-[11px] font-bold text-slate-400 mr-1">Stack:</span>
                  {bp.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-md border border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 1. The Business Problem */}
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>The Commercial Problem this Project Solves:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950 leading-relaxed font-normal">
                    {bp.businessProblem}
                  </p>
                </div>

                {/* 2. Architecture Diagram (Collapsible or Preview) */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100">
                  <div className="flex items-center justify-between p-3.5 px-4 bg-slate-950 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Commercial Architecture Flowchart</span>
                    </span>
                    <button
                      onClick={() => setExpandedDiagramId(isDiagramExpanded ? null : bp.id)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-semibold"
                    >
                      <span>{isDiagramExpanded ? 'Collapse Flow' : 'View Full Flow'}</span>
                      {isDiagramExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto text-xs font-mono text-emerald-400 space-y-1 leading-snug">
                    {(isDiagramExpanded ? bp.architectureDiagram : bp.architectureDiagram.slice(0, 4)).map(
                      (line, idx) => (
                        <div key={idx}>{line}</div>
                      )
                    )}
                    {!isDiagramExpanded && bp.architectureDiagram.length > 4 && (
                      <div className="text-slate-500 italic text-[11px] pt-1">
                        + {bp.architectureDiagram.length - 4} more stages (click View Full Flow above)...
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. The Interactive Implementation Steps */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>Interactive 5-Step Build Checklist</span>
                  </h3>

                  <div className="space-y-3">
                    {bp.steps.map((st) => {
                      const stepKey = `${bp.id}-${st.stepNum}`;
                      const isDone = Boolean(checkedSteps[stepKey]);

                      return (
                        <div
                          key={st.stepNum}
                          className={`p-4 rounded-xl border transition-all ${
                            isDone ? 'bg-emerald-50/40 border-emerald-300' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleToggleStep(stepKey)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                            />
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h4
                                  onClick={() => handleToggleStep(stepKey)}
                                  className={`text-xs sm:text-sm font-bold cursor-pointer select-none ${
                                    isDone ? 'line-through text-slate-500' : 'text-slate-900'
                                  }`}
                                >
                                  Step {st.stepNum}: {st.title}
                                </h4>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">{st.description}</p>

                              {st.codeSnippet && (
                                <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto my-2 border border-slate-800">
                                  <code>{st.codeSnippet}</code>
                                </pre>
                              )}

                              <div className="flex items-center gap-1.5 text-[11px] text-indigo-700 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                <span>
                                  <strong>How to Verify:</strong> {st.verificationTip}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Google XYZ Resume Bullet (1-Click Copy) */}
                <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span>Ready-to-Paste Google XYZ Resume Bullet:</span>
                    </span>
                    <button
                      onClick={() => handleCopyBullet(bp.id, bp.googleXyzResumeBullet)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      {copiedId === bp.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === bp.id ? 'Copied to Clipboard!' : 'Copy Resume Bullet'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed bg-slate-950 p-3.5 rounded-lg border border-slate-800 italic">
                    &ldquo;{bp.googleXyzResumeBullet}&rdquo;
                  </p>
                </div>

                {/* 5. Interviewer Perspective & Hiring Verdict */}
                <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    💡
                  </div>
                  <div className="space-y-0.5 text-xs text-slate-900">
                    <strong className="block text-emerald-950 font-bold text-xs uppercase tracking-wide">
                      Recruiter &amp; Engineering Lead Verdict:
                    </strong>
                    <p className="text-slate-700 leading-relaxed italic text-xs sm:text-sm">
                      &ldquo;{bp.interviewerVerdict}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 flex-wrap">
                  <div className="text-xs text-slate-500 font-medium">
                    Recommended For:{' '}
                    <strong className="text-slate-800">{bp.targetRoles.join(', ')}</strong>
                  </div>

                  {onNavigateJobs && (
                    <button
                      onClick={() => onNavigateJobs(bp.category)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      <span>Explore 0–2 YoE {bp.category} Jobs on FreshCommits</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
