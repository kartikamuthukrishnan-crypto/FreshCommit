import React, { useState } from 'react';
import { Shield, BarChart3, Lock, Menu, X, Sparkles, Users, Mail, BookOpen, Briefcase, Calculator } from 'lucide-react';
import { FreshCommitsLogo } from './FreshCommitsLogo';

interface NavbarProps {
  activeTab: 'jobs' | 'salary-guide' | 'insights' | 'tools' | 'adsense-policy' | 'about' | 'contact' | 'admin';
  setActiveTab: (tab: 'jobs' | 'salary-guide' | 'insights' | 'tools' | 'adsense-policy' | 'about' | 'contact' | 'admin') => void;
  jobCount: number;
  isAdminAuthenticated: boolean;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  jobCount,
  isAdminAuthenticated,
  onLogoutAdmin,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('jobs')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            id="nav-brand"
          >
            <FreshCommitsLogo size="md" showWordmark={true} showDomainBadge={true} />
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              0–2 YoE Only
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-tab-jobs"
              onClick={() => setActiveTab('jobs')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'jobs'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Job Feed</span>
              <span className="ml-1 text-xs bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                {jobCount}
              </span>
            </button>

            <button
              id="nav-tab-salary"
              onClick={() => setActiveTab('salary-guide')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'salary-guide'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Salary Index &amp; Guides</span>
            </button>

            <button
              id="nav-tab-insights"
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'insights'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-violet-600" />
              <span>Career Insights</span>
            </button>

            <button
              id="nav-tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Career Tools</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                New
              </span>
            </button>

            <button
              id="nav-tab-policy"
              onClick={() => setActiveTab('adsense-policy')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'adsense-policy'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Shield className="w-4 h-4 text-amber-600" />
              <span>Policy &amp; Trust</span>
            </button>

            <button
              id="nav-tab-about"
              onClick={() => setActiveTab('about')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'about'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span>About Us</span>
            </button>

            <button
              id="nav-tab-contact"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'contact'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-4 h-4 text-blue-600" />
              <span>Contact</span>
            </button>
          </nav>

          {/* Admin Portal Button - Only visible when site owner is authenticated */}
          {isAdminAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <button
                id="nav-btn-admin"
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                    : 'bg-slate-900 text-slate-100 hover:bg-slate-800'
                }`}
                title="Owner Admin Panel"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Owner Admin</span>
              </button>
              <button
                onClick={onLogoutAdmin}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-rose-600 font-semibold transition-colors"
                title="Sign out of Admin"
              >
                Lock
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              id="nav-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <button
            onClick={() => {
              setActiveTab('jobs');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'jobs' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Job Feed
            </span>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{jobCount}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('salary-guide');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'salary-guide' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-teal-600" />
            Salary Index &amp; Guides
          </button>

          <button
            onClick={() => {
              setActiveTab('insights');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'insights' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4 text-violet-600" />
            Career Insights &amp; Articles
          </button>

          <button
            onClick={() => {
              setActiveTab('tools');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'tools' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Career Tools &amp; TC Calculator
            </span>
            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              New
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('adsense-policy');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'adsense-policy' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-600" />
            AdSense Policy &amp; Trust
          </button>

          <button
            onClick={() => {
              setActiveTab('about');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'about' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            About Us &amp; Editorial Standards
          </button>

          <button
            onClick={() => {
              setActiveTab('contact');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'contact' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Mail className="w-4 h-4 text-blue-600" />
            Contact &amp; Support Desk
          </button>

          {/* Mobile Owner Admin Button - Only shown when authenticated */}
          {isAdminAuthenticated && (
            <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('admin');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 text-white"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Owner Admin Panel
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Active
                </span>
              </button>
              <button
                onClick={() => {
                  onLogoutAdmin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 font-semibold hover:bg-rose-50 rounded"
              >
                Sign out of Admin
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
