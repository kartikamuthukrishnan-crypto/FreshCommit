import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
  GitBranch,
  Terminal,
  Cpu,
  Layers,
  FileCode2,
  HelpCircle,
  Lightbulb,
  Award
} from 'lucide-react';

interface DiagnosticSignal {
  id: string;
  category: 'Testing & CI/CD' | 'Code & Git Hygiene' | 'Security & Production' | 'Architecture & UX';
  title: string;
  question: string;
  whyRecruiterCares: string;
  howToFix: string;
  blueprintAnchor?: string;
  points: number;
}

const AUDIT_SIGNALS: DiagnosticSignal[] = [
  {
    id: 'tests',
    category: 'Testing & CI/CD',
    title: 'Automated Test Suite (Jest / PyTest / Vitest)',
    question: 'Does the repository contain automated unit or integration tests that can be run with a single command?',
    whyRecruiterCares: 'Hiring managers reject 80% of applicant repos because they contain zero automated tests. Tests prove you write software for teams, not just for yourself.',
    howToFix: 'Add at least 3-5 unit tests covering critical business logic or error edge cases.',
    blueprintAnchor: 'containerized-microservice-cicd',
    points: 10,
  },
  {
    id: 'git-history',
    category: 'Code & Git Hygiene',
    title: 'Conventional Git Commit History',
    question: 'Are your commit messages structured and semantic (e.g., "feat: add payment idempotency", "fix: resolve stale closure") rather than "update" or "bug fix"?',
    whyRecruiterCares: 'Messy commit logs ("commit 1", "test", "done") immediately signal a solo hobbyist rather than an engineer prepared for collaborative pull requests.',
    howToFix: 'Use Conventional Commits (feat:, fix:, chore:, refactor:) on all future commits and squash sloppy past histories.',
    blueprintAnchor: 'containerized-microservice-cicd',
    points: 10,
  },
  {
    id: 'env-secrets',
    category: 'Security & Production',
    title: 'Zero Hardcoded Secrets & .env.example Hygiene',
    question: 'Are all database strings, API keys, and auth secrets isolated in environment variables with an committed .env.example template?',
    whyRecruiterCares: 'Committed secrets in public repos are an immediate disqualifier for security-conscious tech leads and financial institutions.',
    howToFix: 'Add a .gitignore for .env and provide a sanitized .env.example showing all required variable names with dummy placeholders.',
    blueprintAnchor: 'containerized-microservice-cicd',
    points: 10,
  },
  {
    id: 'live-deployment',
    category: 'Security & Production',
    title: 'Working Live HTTPS Deployment',
    question: 'Is the project deployed on a live HTTPS link (Vercel, Render, Fly.io) that loads in < 2s without console error exceptions?',
    whyRecruiterCares: 'Most recruiters will never clone your code locally. If your live demo link is broken or throws Red 500 errors in DevTools, they move to the next candidate.',
    howToFix: 'Deploy the frontend to Vercel/Netlify and backend to Render/Fly.io. Verify browser DevTools console has zero unhandled exceptions.',
    blueprintAnchor: 'subsecond-search-engine',
    points: 10,
  },
  {
    id: 'ci-pipeline',
    category: 'Testing & CI/CD',
    title: 'GitHub Actions Automated CI Workflow',
    question: 'Is there a .github/workflows/ci.yml file that automatically runs linters, typechecks, and tests on every push/PR?',
    whyRecruiterCares: 'Proves you understand real engineering deployment gates and won’t break the team’s production build.',
    howToFix: 'Add a simple GitHub Actions workflow YAML file that triggers npm test and tsc --noEmit on every pull request.',
    blueprintAnchor: 'containerized-microservice-cicd',
    points: 10,
  },
  {
    id: 'error-handling',
    category: 'Security & Production',
    title: 'Defensive API Error Handling & Status Codes',
    question: 'Does the application return structured HTTP error payloads (400, 401, 404, 409) rather than crashing or leaking raw database stack traces?',
    whyRecruiterCares: 'Exposing internal database schemas or raw runtime stack traces to client requests is a major security vulnerability.',
    howToFix: 'Wrap async routes in a global error middleware and return sanitized JSON responses: { error: "CODE", message: "User explanation" }.',
    blueprintAnchor: 'webhook-ingestion-engine',
    points: 10,
  },
  {
    id: 'concurrency',
    category: 'Architecture & UX',
    title: 'Concurrency Safety & Race Condition Defense',
    question: 'Does the project prevent double-submits, debounce rapid user inputs, or use database locks / idempotency for state updates?',
    whyRecruiterCares: 'Tutorial clones crash or double-charge when a user clicks twice. Handling concurrency proves you anticipate real human behavior and network latency.',
    howToFix: 'Implement an Idempotency-Key header on mutations, debounce search inputs, and disable submit buttons during in-flight network requests.',
    blueprintAnchor: 'webhook-ingestion-engine',
    points: 10,
  },
  {
    id: 'docker',
    category: 'Testing & CI/CD',
    title: 'Containerization (Dockerfile or Docker Compose)',
    question: 'Can another engineer clone your repo and run the entire environment (app + database) with a single `docker compose up`?',
    whyRecruiterCares: 'Eliminates the "works on my machine" excuse. Signals intermediate DevOps maturity rare in 0–2 YoE applicants.',
    howToFix: 'Add a multi-stage Dockerfile and a docker-compose.yml file spinning up your app and local PostgreSQL/Redis service.',
    blueprintAnchor: 'containerized-microservice-cicd',
    points: 10,
  },
  {
    id: 'clean-architecture',
    category: 'Architecture & UX',
    title: 'Clean Separation of Concerns',
    question: 'Is business logic decoupled from HTTP routing and UI presentation (e.g. distinct controller, service, and data access layers)?',
    whyRecruiterCares: 'Spaghetti code with 800-line React components or SQL queries directly in route handlers indicates poor code maintainability.',
    howToFix: 'Refactor database queries into a dedicated service/repository layer and keep React components purely responsible for UI rendering.',
    blueprintAnchor: 'realtime-data-pipeline-dlq',
    points: 10,
  },
  {
    id: 'readme-diagram',
    category: 'Code & Git Hygiene',
    title: 'Executive README with Architecture Diagram',
    question: 'Does your GitHub README include an architectural diagram, technical trade-offs discussed, and clear 3-step setup instructions?',
    whyRecruiterCares: 'Recruiters and hiring managers spend 30 seconds scanning your README. A polished system flow diagram immediately differentiates your work.',
    howToFix: 'Include an ASCII or Mermaid flowchart showing how data moves through your system, plus a bullet list of trade-offs made.',
    blueprintAnchor: 'webhook-ingestion-engine',
    points: 10,
  },
];

export const CommercialReadinessAuditor: React.FC = () => {
  const [checkedSignals, setCheckedSignals] = useState<Record<string, boolean>>({
    'live-deployment': true,
    'env-secrets': true,
  });
  const [projectName, setProjectName] = useState<string>('My Primary Portfolio Project');
  const [copiedReport, setCopiedReport] = useState(false);

  const toggleSignal = (id: string) => {
    setCheckedSignals((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const score = useMemo(() => {
    return AUDIT_SIGNALS.reduce((acc, sig) => (checkedSignals[sig.id] ? acc + sig.points : acc), 0);
  }, [checkedSignals]);

  const missingSignals = useMemo(() => {
    return AUDIT_SIGNALS.filter((sig) => !checkedSignals[sig.id]);
  }, [checkedSignals]);

  const rating = useMemo(() => {
    if (score >= 80) {
      return {
        label: 'Commercial Grade (Top 5% Portfolio)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        badgeBg: 'bg-emerald-600',
        description:
          'Your project demonstrates professional engineering standards. Tech leads and engineering managers will immediately recognize production hygiene.',
      };
    }
    if (score >= 50) {
      return {
        label: 'Promising Foundation (Needs 2–3 Fixes)',
        color: 'text-amber-800 bg-amber-50 border-amber-300',
        badgeBg: 'bg-amber-600',
        description:
          'Good technical base, but missing automated testing, CI/CD, or concurrency guardrails that senior interviewers look for to filter out tutorial clones.',
      };
    }
    return {
      label: 'Tutorial Clone Risk (High Filter-Out Probability)',
      color: 'text-rose-800 bg-rose-50 border-rose-300',
      badgeBg: 'bg-rose-600',
      description:
        'Missing essential commercial signals (tests, clean commits, secrets isolation). Hiring managers may dismiss this as a YouTube or bootcamp follow-along.',
    };
  }, [score]);

  const handleCopyReport = () => {
    const text = `📋 FRESHCOMMITS COMMERCIAL READINESS AUDIT REPORT
Project: ${projectName}
Final Score: ${score}/100 (${rating.label})

Summary:
- Passing Signals: ${AUDIT_SIGNALS.length - missingSignals.length} / ${AUDIT_SIGNALS.length}
- Missing Production Signals: ${missingSignals.length}

${
  missingSignals.length > 0
    ? `Actionable Recommendations to Reach 100% Commercial Grade:
${missingSignals
  .map(
    (m, i) =>
      `${i + 1}. [${m.title}]
   Why It Matters: ${m.whyRecruiterCares}
   Quick Fix: ${m.howToFix}`
  )
  .join('\n\n')}`
    : '🎉 Congratulations! Your project satisfies all 10 commercial production checkpoints.'
}

Audited on FreshCommits Developer Career Tools – https://www.freshcommits.com/career-tools`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Configuration & Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              60-Second Portfolio &amp; GitHub Diagnostic
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Commercial Readiness Auditor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Audit your project repository against the 10 production signals engineering managers look for in code screens.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedReport ? 'Copied Audit Report!' : 'Copy Audit Report'}</span>
            </button>
          </div>
        </div>

        {/* Project Name Input */}
        <div className="max-w-md">
          <label className="block text-xs font-bold text-slate-700 mb-1">Project or Repository Name</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. distributed-webhook-engine, task-flow-api"
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Real-Time Scorecard Gauge */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm space-y-4 ${rating.color}`}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <span className="text-xs uppercase font-extrabold tracking-wider opacity-80">
              Commercial Readiness Index
            </span>
            <div className="flex items-center gap-3">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                {score}
                <span className="text-lg font-normal text-slate-500">/100</span>
              </span>
              <span className={`px-3 py-1 text-xs font-bold text-white rounded-full ${rating.badgeBg}`}>
                {rating.label}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-600 font-medium block">Checked Signals</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {AUDIT_SIGNALS.length - missingSignals.length} of {AUDIT_SIGNALS.length} Passed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${rating.badgeBg}`}
            style={{ width: `${score}%` }}
          />
        </div>

        <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
          {rating.description}
        </p>
      </div>

      {/* 10 Diagnostic Checkpoints */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" />
            <span>The 10 Production Quality Checkpoints</span>
          </h3>
          <span className="text-xs text-slate-500">Click any card to toggle check</span>
        </div>

        <div className="space-y-3">
          {AUDIT_SIGNALS.map((sig) => {
            const isChecked = Boolean(checkedSignals[sig.id]);

            return (
              <div
                key={sig.id}
                onClick={() => toggleSignal(sig.id)}
                className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer flex-shrink-0"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h4
                        className={`text-xs sm:text-sm font-bold ${
                          isChecked ? 'text-emerald-950' : 'text-slate-900'
                        }`}
                      >
                        {sig.title}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isChecked
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        +{sig.points} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{sig.question}</p>

                    <div className="pt-1.5 flex items-start gap-1.5 text-[11px] text-slate-500">
                      <span className="font-bold text-slate-700">Why it matters:</span>
                      <span>{sig.whyRecruiterCares}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Recommendations to Hit 100% */}
      {missingSignals.length > 0 && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 space-y-5 shadow-md">
          <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <span>Priority Action Items to Reach 100% Commercial Grade</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Fixing these {missingSignals.length} items will place your project in the top 5% of early-career applicants.
              </p>
            </div>
            <a
              href="/project-blueprints"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>View Full Code Blueprints</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4">
            {missingSignals.slice(0, 3).map((m, idx) => (
              <div
                key={m.id}
                className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>Fix: {m.title}</span>
                  </span>
                  <a
                    href="/project-blueprints"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-indigo-300 hover:text-white underline flex items-center gap-1"
                  >
                    <span>Inspect Example Architecture</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">{m.howToFix}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
