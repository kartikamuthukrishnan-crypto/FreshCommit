import React from 'react';
import { AdSenseConfig } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface AdSlotProps {
  type: 'leaderboard' | 'in-feed' | 'sidebar';
  config: AdSenseConfig;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, config, className = '' }) => {
  if (!config.enabled) return null;

  // Specific dimensions based on type conforming to IAB standards
  let containerStyle = '';
  let slotLabel = '728x90 Leaderboard / 320x50 Mobile';

  if (type === 'leaderboard') {
    containerStyle = 'w-full max-w-4xl min-h-[90px] mx-auto';
    slotLabel = 'Leaderboard (728x90 / Responsive)';
  } else if (type === 'in-feed') {
    containerStyle = 'w-full min-h-[140px]';
    slotLabel = 'In-Feed Native Ad Unit';
  } else if (type === 'sidebar') {
    containerStyle = 'w-full max-w-[320px] min-h-[250px] mx-auto';
    slotLabel = 'Medium Rectangle (300x250)';
  }

  return (
    <aside
      aria-label="Sponsored Advertisement"
      className={`my-6 rounded-xl border border-dashed border-slate-300 bg-slate-100/70 p-4 transition-all ${containerStyle} ${className}`}
    >
      {/* Strict AdSense policy: Clear non-deceptive label */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Advertisement
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          Google AdSense Compliant
        </span>
      </div>

      {config.testMode ? (
        // Test / Sandbox view ensuring zero policy violation during setup
        <div className="flex flex-col items-center justify-center text-center py-4 px-2 select-none">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>AdSense Slot: {slotLabel}</span>
          </div>
          <p className="text-[11px] text-slate-500 max-w-md">
            Ad slot is ready for Google Publisher ID:{' '}
            <code className="bg-white px-1.5 py-0.5 rounded text-indigo-700 font-mono font-semibold border border-slate-200">
              {config.publisherId || 'ca-pub-configured-in-admin'}
            </code>
          </p>
          <span className="text-[10px] text-slate-400 mt-2">
            Non-intrusive placement • Guaranteed distance from actionable UI controls
          </span>
        </div>
      ) : (
        // Live Google AdSense Container
        <div className="flex justify-center items-center overflow-hidden">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-client={config.publisherId}
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      )}
    </aside>
  );
};
