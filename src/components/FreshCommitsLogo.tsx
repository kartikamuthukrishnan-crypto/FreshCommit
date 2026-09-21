import React from 'react';

interface FreshCommitsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showDomainBadge?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

export const FreshCommitsLogoMark: React.FC<{ sizePx?: number; className?: string }> = ({
  sizePx = 40,
  className = '',
}) => {
  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className={`relative flex items-center justify-center shrink-0 select-none rounded-xl bg-slate-900 shadow-md shadow-emerald-950/20 border border-slate-800/80 overflow-hidden group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/20 transition-all duration-300 ${className}`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/10 pointer-events-none" />

      {/* High-Definition SVG Brand Symbol */}
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[82%] h-[82%] relative z-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="fc-leaf-grad" x1="14" y1="12" x2="38" y2="34" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="fc-stem-grad" x1="10" y1="36" x2="28" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>

          <linearGradient id="fc-commit-ring" x1="8" y1="32" x2="20" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* 1. Git Trunk Branch (The root commit lineage) */}
        <path
          d="M14 8 V40"
          stroke="#334155"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 2. Active Branch Line curving off towards the new career commit */}
        <path
          d="M14 28 C14 20, 24 16, 32 16"
          stroke="url(#fc-stem-grad)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* 3. Base Commit Node (The foundation) */}
        <circle cx="14" cy="34" r="5" fill="#0F172A" stroke="#64748B" strokeWidth="2.5" />
        <circle cx="14" cy="34" r="2.2" fill="#94A3B8" />

        {/* 4. The "Fresh Commit" Node + Sprout Leaf Motif */}
        {/* The target commit circle */}
        <circle cx="33" cy="16" r="6" fill="#064E3B" stroke="url(#fc-commit-ring)" strokeWidth="2.8" />
        <circle cx="33" cy="16" r="2.8" fill="#6EE7B7" />

        {/* 5. The Fresh Sprout / Upward Blooming Career Leaf emerging from the commit */}
        <path
          d="M33 11 C34 6, 42 6, 42 6 C42 6, 42 14, 37 15 C35 15.5, 33 13.5, 33 11 Z"
          fill="url(#fc-leaf-grad)"
          stroke="#A7F3D0"
          strokeWidth="0.8"
        />

        {/* 6. Subtle Code Bracket angle cue on top-left of the branch */}
        <path
          d="M8 18 L5 21 L8 24"
          stroke="#475569"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export const FreshCommitsLogo: React.FC<FreshCommitsLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showDomainBadge = true,
  className = '',
  variant = 'auto',
}) => {
  const sizeMap = {
    sm: { px: 28, textClass: 'text-base', badgeClass: 'text-[9px] px-1 py-0.2', subText: false },
    md: { px: 38, textClass: 'text-lg', badgeClass: 'text-[10px] px-1.5 py-0.5', subText: true },
    lg: { px: 46, textClass: 'text-2xl', badgeClass: 'text-xs px-2 py-0.5', subText: true },
    xl: { px: 56, textClass: 'text-3xl', badgeClass: 'text-xs px-2.5 py-1', subText: true },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Logo Mark */}
      <FreshCommitsLogoMark sizePx={currentSize.px} />

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight ${currentSize.textClass} ${
                variant === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Fresh<span className="text-emerald-600">Commits</span>
            </span>

            {showDomainBadge && (
              <span className="inline-flex items-center font-mono font-bold tracking-wider text-[10px] bg-slate-900 text-emerald-400 px-1.5 py-0.5 rounded-md border border-slate-700 shadow-xs">
                .com
              </span>
            )}
          </div>

          {currentSize.subText && size !== 'sm' && (
            <span className="text-[10.5px] font-medium text-slate-500 tracking-normal hidden sm:block">
              Entry-Level &amp; New Grad SWE Careers
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FreshCommitsLogo;
