import React from 'react';
import { BookOpen, ArrowRight, Sparkles, Clock, CheckCircle2, User, ChevronRight, Award } from 'lucide-react';
import { CAREER_ARTICLES } from '../data/careerArticles';

interface FeaturedEditorialSectionProps {
  onOpenArticle: (articleId: string) => void;
  onViewAllGuides: () => void;
}

export const FeaturedEditorialSection: React.FC<FeaturedEditorialSectionProps> = ({
  onOpenArticle,
  onViewAllGuides,
}) => {
  // Select 3 premier flagship guides representing Technical Assessments, Compensation, and AI Engineering
  const featuredIds = [
    'how-to-pass-codesignal-gca-tech-online-assessments-2026',
    'entry-level-swe-salary-negotiation-scripts-2026',
    'ai-assisted-coding-interviews-junior-swe-2026',
  ];

  const featuredArticles = featuredIds
    .map((id) => CAREER_ARTICLES.find((a) => a.id === id))
    .filter(Boolean);

  // Fallback to first 3 articles if any ID differs
  const displayArticles = featuredArticles.length === 3 
    ? featuredArticles 
    : CAREER_ARTICLES.slice(0, 3);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white border-y border-slate-200/80 py-10 my-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-100 text-violet-800 border border-violet-200 mb-2.5">
              <BookOpen className="w-3.5 h-3.5 text-violet-600" />
              <span>Publisher Spotlight &bull; Original Research</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Essential 2026 Software Engineering Playbooks
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Comprehensive, peer-reviewed technical guides, salary negotiation scripts, and assessment benchmarks authored by technical recruiters and engineering directors.
            </p>
          </div>

          <button
            onClick={onViewAllGuides}
            className="inline-flex items-center gap-1.5 self-start md:self-auto px-4 py-2 rounded-xl text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <span>Explore All 25+ Career Guides</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayArticles.map((article, idx) => {
            if (!article) return null;

            // Distinct badge coloring based on index/tag
            const badgeThemes = [
              {
                bg: 'bg-violet-50',
                border: 'border-violet-200',
                text: 'text-violet-800',
                accent: 'bg-violet-600',
              },
              {
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-800',
                accent: 'bg-emerald-600',
              },
              {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                accent: 'bg-blue-600',
              },
            ];
            const theme = badgeThemes[idx % badgeThemes.length];

            return (
              <article
                key={article.id}
                onClick={() => onOpenArticle(article.id)}
                className="group relative flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 hover:border-violet-300 hover:shadow-lg transition-all duration-200 cursor-pointer p-6 overflow-hidden"
              >
                {/* Top Category and Read Time */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md border ${theme.bg} ${theme.border} ${theme.text}`}>
                      <Sparkles className="w-3 h-3" />
                      {article.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {article.readTime}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-violet-700 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>
                  
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {article.subtitle || article.summary}
                  </p>

                  {/* Highlight pill */}
                  {article.highlights && article.highlights.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-slate-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{article.highlights[0]}</span>
                    </div>
                  )}
                </div>

                {/* Footer: Author Info & CTA */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0">
                      {article.author.initials || article.author.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {article.author.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {article.author.shortRole || article.author.role}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 group-hover:text-violet-800 group-hover:translate-x-0.5 transition-all shrink-0">
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom Editorial Trust Bar */}
        <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
              <Award className="w-4 h-4 text-emerald-600" />
              100% Original Editorial Content
            </span>
            <span>&bull;</span>
            <span>No AI Scraping / No Automated Placeholders</span>
            <span>&bull;</span>
            <span>Verified 2026 US Compensation &amp; Coding Data</span>
          </div>
          <button
            onClick={onViewAllGuides}
            className="text-xs font-semibold text-violet-700 hover:text-violet-900 hover:underline cursor-pointer"
          >
            Browse All Guides &rarr;
          </button>
        </div>

      </div>
    </section>
  );
};

export default FeaturedEditorialSection;
