import React from 'react';

interface FreshCommitsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showDomainBadge?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
}

/**
 * High-fidelity representation of the official FreshCommits logo:
 * - A beveled deep steel-blue code bracket (<) on the left with gold filigree edging.
 * - An organic, upward-reaching vibrant green double-leaf sprout emerging from the center with gold outlines and inner leaf rib accents.
 */
export const FreshCommitsLogoMark: React.FC<{ sizePx?: number; className?: string }> = ({
  sizePx = 40,
  className = '',
}) => {
  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className={`relative flex items-center justify-center shrink-0 select-none rounded-xl bg-slate-900/90 shadow-md shadow-emerald-950/20 border border-slate-800 overflow-hidden group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/20 transition-all duration-300 p-1 ${className}`}
    >
      {/* Background subtle radial glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-blue-500/10 pointer-events-none" />

      {/* SVG Brand Mark */}
      <svg
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-sm"
      >
        <defs>
          {/* Deep Steel-Blue for Bracket */}
          <linearGradient id="fc-bracket-grad" x1="80" y1="120" x2="230" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2F6694" />
            <stop offset="50%" stopColor="#1C4066" />
            <stop offset="100%" stopColor="#122A44" />
          </linearGradient>

          {/* Metallic Gold Trim */}
          <linearGradient id="fc-gold-border" x1="60" y1="60" x2="460" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5D78E" />
            <stop offset="35%" stopColor="#D8B23C" />
            <stop offset="70%" stopColor="#AA820A" />
            <stop offset="100%" stopColor="#E9C55E" />
          </linearGradient>

          {/* Sprout Stem */}
          <linearGradient id="fc-sprout-grad" x1="200" y1="480" x2="260" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A7543" />
            <stop offset="45%" stopColor="#3C965A" />
            <stop offset="100%" stopColor="#4EAC6D" />
          </linearGradient>

          {/* Top Primary Leaf */}
          <linearGradient id="fc-leaf-top" x1="180" y1="260" x2="280" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#286E3F" />
            <stop offset="40%" stopColor="#3B9058" />
            <stop offset="85%" stopColor="#52AF72" />
            <stop offset="100%" stopColor="#6BC68A" />
          </linearGradient>

          {/* Right Lateral Leaf */}
          <linearGradient id="fc-leaf-right" x1="280" y1="360" x2="440" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#24673B" />
            <stop offset="50%" stopColor="#358750" />
            <stop offset="85%" stopColor="#4AA266" />
            <stop offset="100%" stopColor="#5DBA7A" />
          </linearGradient>
        </defs>

        {/* 1. LEFT CODE BRACKET '<' (Steel-Blue with Gold Trim & 3D Bevel) */}
        <g>
          {/* Bevel Shadow */}
          <path
            d="M174 126 L64 266 L194 446 L204 428 L94 268 L188 142 Z"
            fill="#091421"
            opacity="0.85"
          />

          {/* Main Bracket Diamond Body */}
          <path
            d="M176 122 L62 264 C58 269 58 277 62 282 L194 448 C198 453 206 454 211 449 L217 443 C221 438 220 430 215 425 L108 274 L196 142 C200 137 199 129 194 125 L187 120 C183 118 179 119 176 122 Z"
            fill="url(#fc-bracket-grad)"
            stroke="url(#fc-gold-border)"
            strokeWidth="7"
            strokeLinejoin="round"
          />

          {/* Top-edge Specular Highlight */}
          <path
            d="M174 125 L65 264 C64 265 64 267 65 268 L84 290 L188 138 Z"
            fill="#568EC2"
            opacity="0.5"
          />
        </g>

        {/* 2. CENTRAL SPROUT STEM */}
        <g>
          <path
            d="M198 472 C198 472 205 385 228 290 C242 232 250 180 248 135 C242 185 224 240 200 310 C186 352 178 418 198 472 Z"
            fill="url(#fc-sprout-grad)"
            stroke="url(#fc-gold-border)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Inner Stem Vein */}
          <path
            d="M199 465 C206 380 225 300 246 140"
            stroke="#174A29"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.75"
          />
        </g>

        {/* 3. TOP VERTICAL LEAF */}
        <g>
          {/* Inner Leaf Base */}
          <path
            d="M246 138 C238 88 210 40 186 26 C176 96 182 178 238 236 C248 196 250 162 246 138 Z"
            fill="url(#fc-leaf-top)"
            stroke="url(#fc-gold-border)"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {/* Outer Curved Crown */}
          <path
            d="M186 26 C226 40 278 88 288 184 C256 188 244 162 246 138 C250 102 230 52 186 26 Z"
            fill="url(#fc-leaf-top)"
            stroke="url(#fc-gold-border)"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {/* Central Leaf Spine with Gold Accent */}
          <path
            d="M236 230 C228 175 218 105 188 32"
            stroke="url(#fc-gold-border)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Leaf Shine Accent */}
          <path
            d="M192 38 C198 84 216 142 242 196"
            stroke="#FBF0CC"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* 4. RIGHT LATERAL LEAF */}
        <g>
          {/* Leaf Joint / Branch */}
          <path
            d="M235 244 C268 250 318 244 366 218 C332 260 286 288 240 292 Z"
            fill="url(#fc-sprout-grad)"
            stroke="url(#fc-gold-border)"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          {/* Right Leaf Main Blade */}
          <path
            d="M364 218 C318 200 274 212 252 236 C272 284 322 320 428 304 C440 262 422 232 364 218 Z"
            fill="url(#fc-leaf-right)"
            stroke="url(#fc-gold-border)"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          {/* Lower Lobe */}
          <path
            d="M252 236 C284 278 338 316 428 304 C390 318 340 318 288 296 C264 284 252 258 252 236 Z"
            fill="#236339"
            stroke="url(#fc-gold-border)"
            strokeWidth="6.5"
            strokeLinejoin="round"
          />
          {/* Lateral Leaf Spine */}
          <path
            d="M256 240 C306 244 362 248 424 302"
            stroke="url(#fc-gold-border)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Lateral Shine Highlight */}
          <path
            d="M276 230 C316 234 366 248 410 290"
            stroke="#FBF0CC"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
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
    sm: { px: 32, textClass: 'text-base', badgeClass: 'text-[9px] px-1 py-0.2', subText: false },
    md: { px: 42, textClass: 'text-lg', badgeClass: 'text-[10px] px-1.5 py-0.5', subText: true },
    lg: { px: 50, textClass: 'text-2xl', badgeClass: 'text-xs px-2 py-0.5', subText: true },
    xl: { px: 62, textClass: 'text-3xl', badgeClass: 'text-xs px-2.5 py-1', subText: true },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Logo Mark matching official user artwork */}
      <FreshCommitsLogoMark sizePx={currentSize.px} />

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold tracking-tight ${currentSize.textClass} ${
                variant === 'dark' ? 'text-white' : 'text-[#202124]'
              }`}
            >
              Fresh<span className="text-[#1a73e8]">Commits</span>
            </span>

            {showDomainBadge && (
              <span className="inline-flex items-center font-mono font-medium text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-1.5 py-0.5 rounded border border-[#d2e3fc]">
                .com
              </span>
            )}
          </div>

          {currentSize.subText && size !== 'sm' && (
            <span className="text-[11px] font-normal text-[#5f6368] tracking-normal hidden sm:block">
              Entry-Level &amp; New Grad Careers
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FreshCommitsLogo;
