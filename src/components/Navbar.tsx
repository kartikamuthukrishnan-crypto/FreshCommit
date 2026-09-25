import React, { useState } from 'react';
import { Shield, BarChart3, Lock, Menu, X, Sparkles, Users, Mail, BookOpen, Briefcase, Calculator, Linkedin, Twitter, Youtube, MessageSquare } from 'lucide-react';
import { FreshCommitsLogo } from './FreshCommitsLogo';
import { AppTab } from '../types';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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
    <header className="sticky top-0 z-30 bg-white border-b border-[#dadce0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('jobs')}
            className="flex items-center gap-3 cursor-pointer group select-none py-2"
            id="nav-brand"
          >
            <FreshCommitsLogo size="md" showWordmark={true} showDomainBadge={true} />
            <span className="hidden lg:inline-flex items-center text-[11px] font-medium bg-[#e8f0fe] text-[#1a73e8] px-2.5 py-0.5 rounded-full border border-[#d2e3fc]">
              0–2 YoE Verified
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            <button
              id="nav-tab-jobs"
              onClick={() => setActiveTab('jobs')}
              className={`h-full relative text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'jobs'
                  ? 'text-[#1a73e8] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#1a73e8] after:rounded-t-full'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>Job Feed</span>
              <span className="ml-1 text-[11px] bg-[#f1f3f4] text-[#5f6368] px-2 py-0.5 rounded-full font-mono font-medium">
                {jobCount}
              </span>
            </button>

            <button
              id="nav-tab-salary"
              onClick={() => setActiveTab('salary-guide')}
              className={`h-full relative text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'salary-guide'
                  ? 'text-[#1a73e8] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#1a73e8] after:rounded-t-full'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>Salary Index</span>
            </button>

            <button
              id="nav-tab-insights"
              onClick={() => setActiveTab('insights')}
              className={`h-full relative text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'insights'
                  ? 'text-[#1a73e8] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#1a73e8] after:rounded-t-full'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>Career Insights</span>
            </button>

            <button
              id="nav-tab-tools"
              onClick={() => setActiveTab('tools')}
              className={`h-full relative text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tools'
                  ? 'text-[#1a73e8] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#1a73e8] after:rounded-t-full'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>Career Tools</span>
              <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                New
              </span>
            </button>

            <button
              id="nav-tab-about"
              onClick={() => setActiveTab('about')}
              className={`h-full relative text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'about'
                  ? 'text-[#1a73e8] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#1a73e8] after:rounded-t-full'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>About Us</span>
            </button>

            <button
              id="nav-tab-contact"
              onClick={() => setActiveTab('contact')}
              className={`h-full relative text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'contact'
                  ? 'text-[#1a73e8] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#1a73e8] after:rounded-t-full'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <span>Contact</span>
            </button>

            {/* Social Channels & Share Bar */}
            <div className="hidden xl:flex items-center gap-1 pl-3 ml-2 border-l border-[#dadce0]">
              <a
                href="https://www.linkedin.com/company/freshcommits"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[#5f6368] hover:text-[#0A66C2] hover:bg-[#f1f3f4] transition-colors"
                title="Follow FreshCommits on LinkedIn for daily verified 0–2 YoE SWE job alerts"
              >
                <Linkedin className="w-4 h-4 fill-current" />
              </a>
              <a
                href="https://x.com/Jishaka4"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] transition-colors"
                title="Follow @Jishaka4 on X / Twitter for instant drop alerts"
              >
                <Twitter className="w-4 h-4 fill-current" />
              </a>
              <a
                href="https://www.youtube.com/@FreshCommits-t3l"
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-[#5f6368] hover:text-[#ea4335] hover:bg-[#f1f3f4] transition-colors"
                title="Subscribe to FreshCommits on YouTube (@FreshCommits-t3l)"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </nav>

          {/* Right Action: Admin / Action Button */}
          <div className="hidden md:flex items-center gap-3">
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-btn-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-[#1a73e8] text-white shadow-xs'
                      : 'bg-[#f1f3f4] text-[#202124] hover:bg-[#e8eaed]'
                  }`}
                  title="Site Owner Admin Portal"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Owner Admin</span>
                </button>
                <button
                  onClick={onLogoutAdmin}
                  className="px-2.5 py-1.5 text-xs text-[#5f6368] hover:text-[#d93025] font-medium transition-colors cursor-pointer"
                  title="Sign out of Admin"
                >
                  Lock
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const feed = document.getElementById('job-feed-section');
                  if (feed) feed.scrollIntoView({ behavior: 'smooth' });
                  else setActiveTab('jobs');
                }}
                className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-5 py-2 rounded-full font-medium text-sm transition-all shadow-xs cursor-pointer"
              >
                Explore Roles
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              id="nav-mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4]"
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
              setActiveTab('about');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'about' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-600" />
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

          {/* Social Communities */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-around py-2">
            <a
              href="https://www.linkedin.com/company/freshcommits"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0A66C2] px-2.5 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <Linkedin className="w-4 h-4 fill-current" />
              <span>LinkedIn</span>
            </a>
            <a
              href="https://x.com/Jishaka4"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <Twitter className="w-4 h-4 fill-current" />
              <span>Twitter / X</span>
            </a>
            <a
              href="https://www.youtube.com/@FreshCommits-t3l"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50"
              title="FreshCommits YouTube Channel"
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube</span>
            </a>
          </div>

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
