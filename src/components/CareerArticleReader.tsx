import React, { useState, useEffect } from 'react';
import { CareerArticle } from '../data/careerArticles';
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
  Briefcase
} from 'lucide-react';

interface CareerArticleReaderProps {
  article: CareerArticle;
  onBack: () => void;
  onSelectArticle: (id: string) => void;
  allArticles: CareerArticle[];
}

export const CareerArticleReader: React.FC<CareerArticleReaderProps> = ({
  article,
  onBack,
  onSelectArticle,
  allArticles,
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top when opening a new article
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

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

        {/* Author Card */}
        <div className="pt-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>{article.author.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                Verified Expert
              </span>
            </div>
            <p className="text-[11px] text-slate-500">{article.author.role}</p>
          </div>
        </div>
      </header>

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

      {/* Pagination: Next & Previous Articles */}
      <div className="mt-12 pt-8 border-t border-slate-200">
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
