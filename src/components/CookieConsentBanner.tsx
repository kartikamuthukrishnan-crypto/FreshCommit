import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Settings, X, Check } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacyModal: () => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onOpenPrivacyModal }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [advertisingEnabled, setAdvertisingEnabled] = useState(true);

  useEffect(() => {
    // Check if user has already made a consent choice
    const consent = localStorage.getItem('freshcommits_cookie_consent_v1');
    if (!consent) {
      // Small timeout so it slides in smoothly after page load
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      necessary: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('freshcommits_cookie_consent_v1', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const preferences = {
      necessary: true,
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('freshcommits_cookie_consent_v1', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const preferences = {
      necessary: true,
      analytics: analyticsEnabled,
      advertising: advertisingEnabled,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('freshcommits_cookie_consent_v1', JSON.stringify(preferences));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie Consent Banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-slate-900/98 backdrop-blur-md text-white border border-slate-700/80 rounded-2xl shadow-2xl p-5 space-y-4 shadow-black/40">
        {/* Banner Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Cookie &amp; Privacy Preferences</h3>
              <span className="text-[10px] text-slate-400 font-mono">GDPR, CCPA &amp; Google Policy</span>
            </div>
          </div>
          <button
            onClick={handleRejectNonEssential}
            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
            title="Dismiss &amp; decline non-essential cookies"
            aria-label="Close cookie banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner Body */}
        {!showPreferences ? (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              We and trusted partners (like Google AdSense) use cookies and identifiers to analyze traffic, remember preferences, and serve relevant developer job opportunities and non-intrusive advertisements.{' '}
              <button
                onClick={onOpenPrivacyModal}
                className="text-emerald-400 underline hover:text-emerald-300 transition-colors font-medium"
              >
                Read our Privacy Policy
              </button>
              .
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <button
                onClick={handleAcceptAll}
                className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm hover:shadow-emerald-500/25 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                Accept All
              </button>

              <button
                onClick={handleRejectNonEssential}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 transition-colors"
              >
                Reject Non-Essential
              </button>

              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors shrink-0 flex items-center justify-center"
                title="Customize preferences"
                aria-label="Customize cookie preferences"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Detailed Category Preferences */
          <div className="space-y-3 pt-1">
            <div className="space-y-2.5 text-xs">
              {/* Strictly Necessary */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
                <div className="space-y-0.5 pr-2">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Essential &amp; Security
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Required for ATS routing, session security, and preferences.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <div className="font-semibold text-slate-200">Analytics &amp; Performance</div>
                  <p className="text-[11px] text-slate-400">
                    Helps us understand which job postings and tools developers use most.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 border-slate-600 bg-slate-700"
                />
              </label>

              {/* Advertising */}
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors">
                <div className="space-y-0.5 pr-2">
                  <div className="font-semibold text-slate-200">Google AdSense / DART</div>
                  <p className="text-[11px] text-slate-400">
                    Allows non-intrusive sponsor and career tool ads via Google.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={advertisingEnabled}
                  onChange={(e) => setAdvertisingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 focus:ring-offset-slate-900 border-slate-600 bg-slate-700"
                />
              </label>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSavePreferences}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 rounded-xl"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default CookieConsentBanner;
