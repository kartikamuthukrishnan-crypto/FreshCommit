import React, { useState, useEffect, useMemo } from 'react';
import { CareerArticle } from '../data/careerArticles';
import { JobPosting } from '../types';
import { INITIAL_JOBS } from '../data/initialJobs';
import { getContextualJobsForArticle } from '../utils/relatedJobsMatcher';
import {
  ArrowLeft,
  Clock,
  Calendar,
  Share2,
  Copy,
  Check,
  Lightbulb,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronRight,
  User,
  ArrowRight,
  BookOpen,
  Briefcase,
  ShieldCheck,
  Linkedin,
  ExternalLink,
  Award,
  Sparkles,
  MapPin,
  Building2,
  DollarSign,
  TrendingUp,
  Flame,
  CheckCircle
} from 'lucide-react';

interface CareerArticleReaderProps {
  article: CareerArticle;
  onBack: () => void;
  onSelectArticle: (id: string) => void;
  allArticles: CareerArticle[];
  jobs?: JobPosting[];
  onSelectJob?: (job: JobPosting) => void;
}

export const CareerArticleReader: React.FC<CareerArticleReaderProps> = ({
  article,
  onBack,
  onSelectArticle,
  allArticles,
  jobs = INITIAL_JOBS,
  onSelectJob,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top, set title, description, canonical tag, and Google E-E-A-T JSON-LD Schema
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const originalTitle = document.title;
    document.title = `${article.title} – FreshCommits Career Guide`;

    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const originalDesc = metaDesc ? metaDesc.content : '';
    if (metaDesc) {
      metaDesc.content = article.summary;
    }

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const originalCanonical = canonical ? canonical.href : '';
    if (canonical) {
      canonical.href = `https://www.freshcommits.com/insights/${article.id}`;
    }

    // Google E-E-A-T Article Schema.org structured data injection
    const schemaScriptId = 'google-article-eeat-schema';
    let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaScriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const isoPublished = '2026-09-01T08:00:00Z';
    const isoModified = '2026-10-06T12:00:00Z';

    const articleJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      'headline': article.title,
      'description': article.summary,
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `https://www.freshcommits.com/insights/${article.id}`
      },
      'datePublished': isoPublished,
      'dateModified': isoModified,
      'inLanguage': 'en-US',
      'author': {
        '@type': 'Person',
        'name': article.author.name,
        'jobTitle': article.author.role,
        'url': article.author.linkedinUrl,
        'sameAs': [article.author.linkedinUrl],
        'description': article.author.bio,
        'knowsAbout': article.author.expertise || [],
        'worksFor': {
          '@type': 'Organization',
          'name': 'FreshCommits',
          'url': 'https://www.freshcommits.com'
        }
      },
      ...(article.reviewer ? {
        'reviewedBy': {
          '@type': 'Person',
          'name': article.reviewer.name,
          'jobTitle': article.reviewer.role,
          'url': article.reviewer.linkedinUrl,
          'sameAs': [article.reviewer.linkedinUrl],
          'worksFor': {
            '@type': 'Organization',
            'name': 'FreshCommits',
            'url': 'https://www.freshcommits.com'
          }
        }
      } : {}),
      'publisher': {
        '@type': 'Organization',
        'name': 'FreshCommits',
        'url': 'https://www.freshcommits.com',
        'logo': {
          '@type': 'ImageObject',
          'url': 'https://www.freshcommits.com/favicon.svg'
        }
      }
    };

    schemaScript.textContent = JSON.stringify(articleJsonLd, null, 2);

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) metaDesc.content = originalDesc;
      if (canonical && originalCanonical) canonical.href = originalCanonical;
      const scriptToRemove = document.getElementById(schemaScriptId);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, [article.id, article.title, article.summary, article.author, article.reviewer, article.publishedDate]);

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Find next and previous articles for bottom pagination
  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in duration-200">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>Back to All Insights</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            title="Copy link to this article"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[11px] text-slate-400 mt-6 mb-4 overflow-x-auto">
        <span>FreshCommits</span>
        <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
        <button onClick={onBack} className="hover:text-slate-700 transition-colors whitespace-nowrap">
          Career Insights
        </button>
        <ChevronRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
        <span className="text-emerald-700 font-medium whitespace-nowrap">{article.tag}</span>
      </nav>

      {/* Article Header */}
      <header className="space-y-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {article.tag}
          </span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {article.readTime}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {article.publishedDate}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {article.subtitle}
        </p>

        {/* Author Card & Editorial Attribution */}
        <div className="pt-3 pb-1 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-full ${article.author.avatarBg || 'bg-slate-900'} text-white flex items-center justify-center font-extrabold text-sm shadow-sm ring-2 ring-white`}>
              {article.author.initials || article.author.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-extrabold text-slate-900">{article.author.name}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Verified Domain Expert
                </span>
                {article.author.linkedinUrl && (
                  <a
                    href={article.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-200 transition-colors shadow-2xs"
                    title={`View ${article.author.name}'s verified LinkedIn profile`}
                  >
                    <Linkedin className="w-3 h-3 fill-current" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 font-medium">{article.author.role}</p>
            </div>
          </div>

          {article.reviewer && (
            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>
                Reviewed &amp; Fact-Checked by{' '}
                <a
                  href={article.reviewer.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-slate-900 hover:text-emerald-700 underline"
                >
                  {article.reviewer.name}
                </a>{' '}
                <span className="text-slate-400">({article.reviewer.shortRole || article.reviewer.role})</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Mandatory Editorial & Google E-E-A-T Disclosure */}
      <div className="my-6 p-4 bg-slate-50/90 border border-slate-200/90 rounded-2xl flex items-start gap-3 shadow-2xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center gap-2 mb-0.5">
            <strong className="text-slate-900 font-bold">
              Google E-E-A-T &amp; Editorial Verification Standards
            </strong>
            <span className="text-[10px] font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
              Human-Authored
            </span>
          </div>
          <span>
            This career guide is authored by <strong>{article.author.name}</strong> ({article.author.shortRole || article.author.role})
            {article.reviewer ? ` and independently peer-reviewed by ${article.reviewer.name} (${article.reviewer.shortRole || article.reviewer.role})` : ''}.
            Every recommendation is grounded in verified applicant tracking system data, unparaphrased employer specifications, and direct early-career engineering mentorship.
          </span>
        </div>
      </div>

      {/* Executive Summary & Key Takeaways Card */}
      <div className="my-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 shadow-sm">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Executive Summary</span>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Core Takeaways for 0–2 YoE</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {article.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{h}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10 text-slate-800 leading-relaxed">
        {article.sections.map((section, idx) => (
          <section key={idx} className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-2 border-t border-slate-100">
              {section.heading}
            </h2>

            {section.content.map((paragraph, pIdx) => (
              <p key={pIdx} className="text-xs sm:text-sm leading-relaxed text-slate-700">
                {paragraph}
              </p>
            ))}

            {/* Code Block if Present */}
            {section.codeBlock && (
              <div className="my-4 rounded-xl overflow-hidden border border-slate-800 shadow-md">
                <div className="bg-slate-950 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono border-b border-slate-800">
                  <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px]">
                    {section.codeBlock.language}
                  </span>
                  <button
                    onClick={() => handleCopyCode(section.codeBlock!.code, idx)}
                    className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
                  >
                    {copiedCodeIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed">
                  {section.codeBlock.code}
                </pre>
                {section.codeBlock.caption && (
                  <div className="bg-slate-950/80 px-4 py-1.5 text-[11px] text-slate-400 font-sans border-t border-slate-800">
                    {section.codeBlock.caption}
                  </div>
                )}
              </div>
            )}

            {/* Comparison Table if Present */}
            {section.table && (
              <div className="my-5 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      {section.table.headers.map((th, thIdx) => (
                        <th key={thIdx} className="py-2.5 px-3.5 border-b border-slate-200">
                          {th}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {section.table.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-3 px-3.5 text-slate-700">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Callout Box if Present */}
            {section.callout && (
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 my-4 text-xs leading-relaxed ${
                  section.callout.type === 'tip'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : section.callout.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-sky-50 border-sky-200 text-sky-950'
                }`}
              >
                {section.callout.type === 'tip' ? (
                  <Lightbulb className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : section.callout.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-bold block mb-0.5">{section.callout.title}</span>
                  <span>{section.callout.text}</span>
                </div>
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Google E-E-A-T Author Entity & Fact-Checking Verification Box */}
      <section className="my-12 p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900 block">
                Google E-E-A-T Verified Author Entity
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Experience &bull; Expertise &bull; Authoritativeness &bull; Trustworthiness
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold">
            FreshCommits Editorial Board
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className={`w-16 h-16 rounded-2xl ${article.author.avatarBg || 'bg-slate-900'} text-white flex items-center justify-center font-black text-xl shadow-md ring-4 ring-slate-100 flex-shrink-0`}>
            {article.author.initials || article.author.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {article.author.name}
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Primary Author
                </span>
                {article.author.linkedinUrl && (
                  <a
                    href={article.author.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0A66C2] hover:bg-[#004182] px-3 py-1 rounded-lg transition-all shadow-xs"
                  >
                    <Linkedin className="w-3.5 h-3.5 fill-current" />
                    <span>Connect on LinkedIn</span>
                    <ExternalLink className="w-3 h-3 opacity-80" />
                  </a>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1">{article.author.role}</p>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              {article.author.fullBio || article.author.bio}
            </p>

            {article.author.expertise && article.author.expertise.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Core Technical &amp; Recruiting Expertise:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {article.author.expertise.map((exp, expIdx) => (
                    <span
                      key={expIdx}
                      className="text-[11px] font-semibold bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200/90 shadow-2xs"
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Peer Reviewer Attribution Box */}
        {article.reviewer && (
          <div className="pt-5 border-t border-slate-200/80 bg-slate-50/80 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-5 sm:p-6 rounded-b-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${article.reviewer.avatarBg || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}>
                {article.reviewer.initials || article.reviewer.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    Peer-Reviewed &amp; Fact-Checked by {article.reviewer.name}
                  </span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-semibold">
                    Technical Assessor
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {article.reviewer.role} &bull; Verified against 2026 hiring benchmarks
                </p>
              </div>
            </div>

            {article.reviewer.linkedinUrl && (
              <a
                href={article.reviewer.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0A66C2] bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-slate-200 transition-colors shadow-2xs whitespace-nowrap"
              >
                <Linkedin className="w-3 h-3 fill-current" />
                <span>View LinkedIn</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
              </a>
            )}
          </div>
        )}
      </section>

      {/* Internal Linking Mesh: Contextual Verified Live Job Requisitions (0-2 YoE) */}
      {(() => {
        const contextualJobs = getContextualJobsForArticle(article, jobs, 3);
        if (contextualJobs.length === 0) return null;

        return (
          <section className="my-10 p-6 sm:p-7 bg-white rounded-2xl border-2 border-emerald-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Target Openings: Relevant Early-Career Requisitions</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                      0–2 YoE Verified
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Apply this guide&apos;s benchmarks directly to active openings hiring across our verified repository.
                  </p>
                </div>
              </div>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  if (onBack) onBack();
                  window.history.pushState(null, '', '/');
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
              >
                <span>View all {jobs.length} jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {contextualJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between group text-left"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 truncate">
                        {job.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                        {job.experienceLevel}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      <a
                        href={`/job/${job.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onSelectJob) {
                            onSelectJob(job);
                          } else {
                            window.open(`/job/${job.id}`, '_blank');
                          }
                        }}
                        className="hover:underline"
                      >
                        {job.title}
                      </a>
                    </h4>

                    <div className="text-[11px] text-slate-600 font-medium flex items-center gap-1 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.company}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.isRemote ? 'Remote / ' : ''}{job.location}</span>
                    </div>

                    {job.salary && job.salary.min > 0 && (
                      <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>${(job.salary.min / 1000).toFixed(0)}k – ${(job.salary.max / 1000).toFixed(0)}k / {job.salary.unit.toLowerCase()}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Max {job.maxYearsExperience}y exp
                    </span>
                    <a
                      href={`/job/${job.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        if (onSelectJob) {
                          onSelectJob(job);
                        } else {
                          window.open(`/job/${job.id}`, '_blank');
                        }
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-slate-900 group-hover:bg-emerald-600 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                    >
                      <span>View Role</span>
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })()}

      {/* Topical Cluster & Contextual Internal Links (SOP Step 1 & 3 Compliance) */}
      {(() => {
        const relatedArticles = allArticles
          .filter((a) => a.id !== article.id)
          .sort((a, b) => (a.tag === article.tag ? -1 : 1))
          .slice(0, 3);
        if (relatedArticles.length === 0) return null;
        return (
          <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Related Guides &amp; Topical Cluster
              </span>
              <span className="text-[11px] text-slate-500 font-medium">Internal Reference Library</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedArticles.map((rel) => (
                <a
                  key={rel.id}
                  href={`/insights/${rel.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectArticle(rel.id);
                  }}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between group block text-left"
                >
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      {rel.tag}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h3>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>{rel.readTime}</span>
                    <span className="text-emerald-600 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Read &rarr;
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Pagination: Next & Previous Articles */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Continue Reading Career Guides
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevArticle ? (
            <button
              onClick={() => onSelectArticle(prevArticle.id)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-left transition-all group"
            >
              <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                Previous Guide
              </span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block line-clamp-2">
                {prevArticle.title}
              </span>
            </button>
          ) : (
            <div />
          )}

          {nextArticle ? (
            <button
              onClick={() => onSelectArticle(nextArticle.id)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-right transition-all group"
            >
              <span className="text-[10px] font-bold text-slate-400 block mb-1 flex items-center justify-end gap-1">
                Next Guide
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors block line-clamp-2">
                {nextArticle.title}
              </span>
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Bottom CTA to return or view jobs */}
      <div className="mt-10 p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-extrabold text-base tracking-tight">Ready to Put This Advice into Practice?</h3>
          <p className="text-xs text-slate-300">
            Browse our curated, verified entry-level SWE jobs with 0–2 YoE filter validation.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-1.5 whitespace-nowrap"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Explore All Guides</span>
        </button>
      </div>
    </div>
  );
};
