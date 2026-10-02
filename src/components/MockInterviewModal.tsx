import React, { useState, useMemo } from 'react';
import {
  X,
  Target,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Building2,
  Briefcase,
  Share2,
  BookOpen
} from 'lucide-react';
import { JobPosting } from '../types';
import { generateFullMockInterview, MockQuestionItem } from '../utils/mockInterviewEngine';
import { resolveCompanyLogo } from '../utils/logoHelper';

interface MockInterviewModalProps {
  job: JobPosting;
  onClose: () => void;
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({ job, onClose }) => {
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [masteredRounds, setMasteredRounds] = useState<Record<number, boolean>>({});
  const [userNotes, setUserNotes] = useState<Record<number, string>>({});
  const [copiedAll, setCopiedAll] = useState(false);

  const plan = useMemo(() => {
    return generateFullMockInterview({
      title: job.title,
      company: job.company,
      category: job.category,
      skills: job.skills
    });
  }, [job]);

  const currentRound: MockQuestionItem = plan.rounds[currentRoundIdx];
  const isRevealed = Boolean(revealedAnswers[currentRoundIdx]);
  const isMastered = Boolean(masteredRounds[currentRoundIdx]);

  const masteredCount = Object.values(masteredRounds).filter(Boolean).length;
  const progressPct = Math.round((masteredCount / plan.rounds.length) * 100);

  const toggleReveal = (idx: number) => {
    setRevealedAnswers((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleMastered = (idx: number) => {
    setMasteredRounds((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyFullPrepSheet = () => {
    const text = `🎯 FreshCommits 5-Round Mock Interview Prep for ${job.company} (${job.title})
Category: ${job.category}
Verified Preparation Sheet (0–2 YoE)

${plan.rounds
  .map(
    (r) =>
      `--------------------------------------------------
${r.roundTitle} (${r.roundType})
QUESTION:
"${r.question}"

WHAT THEY ARE REALLY TESTING:
${r.interviewerObjective}

WINNING ANSWER FORMULA:
"${r.winningAnswerFormula}"

THE INTERVIEWER'S VERDICT:
${r.interviewerVerdict}

KEY POWER KEYWORDS:
${r.keyKeywordsToSay.join(', ')}
`
  )
  .join('\n')}

Practiced on FreshCommits – https://www.freshcommits.com/job/${encodeURIComponent(job.id)}`;

    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const logoUrl = resolveCompanyLogo(job.company, job.companyLogo, job.companyWebsite);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center flex-shrink-0 shadow-xs border border-slate-700">
              <img
                src={logoUrl}
                alt={job.company}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    job.company
                  )}&background=0F172A&color=fff&size=128&bold=true`;
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Mock Interview Simulator
                </span>
                <span className="text-xs text-slate-300 font-medium truncate">{job.company}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                {job.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopyFullPrepSheet}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors border border-slate-700 cursor-pointer"
              title="Copy complete 5-round cheat sheet to clipboard"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied Sheet!' : 'Copy Prep Sheet'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Round Selector Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 sm:px-6">
          <div className="flex items-center justify-between gap-3 text-xs mb-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Round {currentRoundIdx + 1} of {plan.rounds.length}:{' '}
                <strong className="text-slate-900">{currentRound.roundType}</strong>
              </span>
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {masteredCount} / 5 Mastered ({progressPct}%)
            </span>
          </div>

          {/* Stepper Tabs */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {plan.rounds.map((r, idx) => {
              const active = idx === currentRoundIdx;
              const mastered = Boolean(masteredRounds[idx]);
              return (
                <button
                  key={idx}
                  onClick={() => setCurrentRoundIdx(idx)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer truncate ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : mastered
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {mastered ? <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : null}
                  <span>R{r.roundNumber}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question & Practice Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Round Header & Type */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              {currentRound.roundTitle}
            </span>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isMastered}
                onChange={() => toggleMastered(currentRoundIdx)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
              />
              <span className={isMastered ? 'text-emerald-700 font-bold' : ''}>
                {isMastered ? '✓ Mastered' : 'Mark as Mastered'}
              </span>
            </label>
          </div>

          {/* The Core Question Card */}
          <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-xl shadow-md space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Interviewer's Question:</span>
            </div>
            <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-100">
              &ldquo;{currentRound.question}&rdquo;
            </p>
          </div>

          {/* What the Interviewer is Really Testing */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>What the Interviewer is Really Testing:</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-normal">
              {currentRound.interviewerObjective}
            </p>
          </div>

          {/* Self-Practice Area (Optional Notes) */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              Your Quick Thought / Outline (Try answering in your head or jot down notes):
            </label>
            <textarea
              rows={2}
              value={userNotes[currentRoundIdx] || ''}
              onChange={(e) =>
                setUserNotes((prev) => ({ ...prev, [currentRoundIdx]: e.target.value }))
              }
              placeholder="e.g. 1. Disable submit button, 2. Send idempotency key..."
              className="w-full p-2.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Reveal Ideal Answer Button or Card */}
          {!isRevealed ? (
            <button
              onClick={() => toggleReveal(currentRoundIdx)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Reveal Winning Answer Formula &amp; Interviewer Perspective</span>
            </button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* The Winning Answer Formula */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>The Winning Answer Formula:</span>
                  </span>
                  <button
                    onClick={() => toggleReveal(currentRoundIdx)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Hide
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed bg-white/90 p-3 rounded-lg border border-emerald-200/80">
                  &ldquo;{currentRound.winningAnswerFormula}&rdquo;
                </p>
              </div>

              {/* The Result / Interviewer Verdict */}
              <div className="bg-gradient-to-r from-emerald-100/90 via-teal-50 to-indigo-50 border border-emerald-300/80 rounded-xl p-3.5 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  💡
                </div>
                <div className="space-y-0.5 text-xs text-slate-900">
                  <strong className="block text-emerald-950 font-bold text-xs uppercase tracking-wide">
                    The Result / Interviewer Perspective:
                  </strong>
                  <p className="text-slate-800 leading-relaxed italic">
                    &ldquo;{currentRound.interviewerVerdict}&rdquo;
                  </p>
                </div>
              </div>

              {/* Power Keywords to Mention */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] font-bold text-slate-600 mr-1">Power Keywords to drop:</span>
                {currentRound.keyKeywordsToSay.map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full"
                  >
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-3.5 sm:p-4 px-4 sm:px-6 flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentRoundIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentRoundIdx === 0}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous Round</span>
          </button>

          <div className="flex items-center gap-2">
            {currentRoundIdx < plan.rounds.length - 1 ? (
              <button
                onClick={() => setCurrentRoundIdx((prev) => Math.min(plan.rounds.length - 1, prev + 1))}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Next: Round {currentRoundIdx + 2}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Finish Practice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
