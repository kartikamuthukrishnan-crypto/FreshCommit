import React from 'react';
import { AdSenseConfig } from '../types';

interface AdSlotProps {
  type: 'leaderboard' | 'in-feed' | 'sidebar';
  config: AdSenseConfig;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ type, config, className = '' }) => {
  // Never render any ad details or placeholders if disabled, in test mode, or without a real publisher ID
  const isRealPublisherId =
    Boolean(config?.publisherId) &&
    config.publisherId.startsWith('ca-pub-') &&
    config.publisherId !== 'ca-pub-9876543210123456' &&
    !config.publisherId.includes('configured-in-admin');

  if (!config?.enabled || config.testMode || !isRealPublisherId) {
    return null;
  }

  // Specific dimensions based on type conforming to IAB standards
  let containerStyle = '';
  if (type === 'leaderboard') {
    containerStyle = 'w-full max-w-4xl min-h-[90px] mx-auto';
  } else if (type === 'in-feed') {
    containerStyle = 'w-full min-h-[140px]';
  } else if (type === 'sidebar') {
    containerStyle = 'w-full max-w-[320px] min-h-[250px] mx-auto';
  }

  return (
    <aside
      aria-label="Sponsored Advertisement"
      className={`my-6 rounded-xl bg-transparent transition-all ${containerStyle} ${className}`}
    >
      <div className="flex items-center justify-between pb-1 mb-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
          Advertisement
        </span>
      </div>

      {/* Live Google AdSense Container - Only injected when explicitly enabled with real ID */}
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
    </aside>
  );
};
