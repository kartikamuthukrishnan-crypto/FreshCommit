import React from 'react';
import {
  Search,
  LayoutList,
  LayoutGrid,
  Bookmark,
  X,
  RotateCcw,
} from 'lucide-react';
import { JobPosting } from '../types';
import { getJobTimestamp } from '../utils/jobSorting';
import { resolveWorkMode } from '../utils/jobSanitizer';

export type WorkModeFilter = 'All' | 'Remote' | 'Hybrid' | 'On-site';
export type ExperienceFilter = 'All' | 'Junior 0-2 YoE' | 'Entry-Level 0 YoE' | 'New Grad' | 'Internships';
export type WorkAuthFilter = 'All' | 'STEM OPT' | 'E-Verify' | 'Visa Sponsorship' | 'US Citizen Only';
export type PostedWindowFilter = 'any' | '24h' | '3d' | '7d' | '30d';
export type JobSortOption = 'latest' | 'oldest' | 'company-az' | 'title-az' | 'salary';
export type ViewModeOption = 'list' | 'grid';

export const FEED_TECH_HUBS = [
  { label: 'All Locations', value: 'All' },
  { label: 'United States (Nationwide)', value: 'US' },
  { label: 'Worldwide Remote', value: 'Worldwide' },
  { label: 'San Francisco Bay Area, CA', value: 'San Francisco' },
  { label: 'New York City, NY', value: 'New York' },
  { label: 'Seattle / Bellevue, WA', value: 'Seattle' },
  { label: 'Austin / Dallas, TX', value: 'Austin' },
  { label: 'Boston, MA', value: 'Boston' },
  { label: 'Denver / Boulder, CO', value: 'Denver' },
  { label: 'United Kingdom / London', value: 'GB' },
  { label: 'Canada / Toronto', value: 'Canada' },
  { label: 'India / Bengaluru', value: 'India' },
];

export const FEED_CATEGORIES = [
  { label: 'All Roles', value: 'All' },
  { label: 'Full Stack', value: 'Full Stack' },
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Data & AI', value: 'Data / AI' },
  { label: 'DevOps & Cloud', value: 'DevOps / Cloud' },
  { label: 'Mobile (iOS/Android)', value: 'Mobile' },
  { label: 'QA & Automation', value: 'QA / Test' },
  { label: 'Others', value: 'Others' },
];

export interface JobFilterState {
  searchQuery: string;
  selectedHub: string;
  selectedCategory: string;
  workMode: WorkModeFilter;
  experience: ExperienceFilter;
  workAuth: WorkAuthFilter;
  postedWithin: PostedWindowFilter;
  sortBy: JobSortOption;
  savedOnly: boolean;
}

export function applyJobFiltersAndSort(
  activeJobs: JobPosting[],
  state: JobFilterState,
  savedJobIds: string[]
): JobPosting[] {
  const now = Date.now();
  const cutoffMs: Record<PostedWindowFilter, number> = {
    any: 0,
    '24h': 24 * 3600 * 1000,
    '3d': 3 * 24 * 3600 * 1000,
    '7d': 7 * 24 * 3600 * 1000,
    '30d': 30 * 24 * 3600 * 1000,
  };

  const filtered = activeJobs.filter((job) => {
    // 1. Search Query
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase().trim();
      const matchesTitle = job.title?.toLowerCase().includes(q);
      const matchesCompany = job.company?.toLowerCase().includes(q);
      const matchesLocation = job.location?.toLowerCase().includes(q);
      const matchesSkills = Array.isArray(job.skills) && job.skills.some((s) => s?.toLowerCase().includes(q));
      const matchesDesc = job.description?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesCompany && !matchesLocation && !matchesSkills && !matchesDesc) {
        return false;
      }
    }

    // 2. Work Mode
    if (state.workMode !== 'All') {
      const mode = resolveWorkMode(job);
      if (mode !== state.workMode) return false;
    }

    // 3. Experience Level
    if (state.experience !== 'All') {
      const tLow = (job.title || '').toLowerCase();
      if (state.experience === 'Internships') {
        if (job.experienceLevel !== 'Internship' && !/\b(?:intern|internship|co-op)\b/i.test(tLow)) return false;
      } else if (state.experience === 'New Grad') {
        if (job.experienceLevel !== 'New Grad' && !/\b(?:new\s*grad|graduate|campus)\b/i.test(tLow)) return false;
      } else if (state.experience === 'Entry-Level 0 YoE') {
        if (job.experienceLevel === 'Internship') return false;
        if (typeof job.maxYearsExperience === 'number' && job.maxYearsExperience > 1) return false;
      } else if (state.experience === 'Junior 0-2 YoE') {
        if (job.experienceLevel === 'Internship') return false;
      }
    }

    // 4. Work Authorization
    if (state.workAuth !== 'All') {
      if (state.workAuth === 'STEM OPT' && !job.stemOptEVerified) return false;
      if (state.workAuth === 'E-Verify' && !job.eVerify && !job.stemOptEVerified) return false;
      if (state.workAuth === 'Visa Sponsorship' && !job.visaSponsorship) return false;
      if (state.workAuth === 'US Citizen Only' && !job.usCitizenOnly) return false;
    }

    // 5. Location Hub
    if (state.selectedHub !== 'All') {
      const loc = (job.location || '').toLowerCase();
      const cty = (job.city || '').toLowerCase();
      const cntry = (job.country || '').toUpperCase();
      const req = (job.applicantLocationRequirements || '').toUpperCase();

      if (state.selectedHub === 'US') {
        const isUS =
          cntry === 'US' ||
          req === 'US' ||
          /,\s*(?:ca|ny|tx|wa|co|ma|il|fl|nc|va|ga|or|az|oh|pa|nj)\b/i.test(loc) ||
          loc.includes('united states');
        if (!isUS) return false;
      } else if (state.selectedHub === 'Worldwide') {
        const isWw =
          loc.includes('worldwide') ||
          loc.includes('global') ||
          loc.includes('anywhere') ||
          req === 'WORLDWIDE' ||
          req === 'GLOBAL';
        if (!isWw) return false;
      } else if (state.selectedHub === 'GB') {
        if (cntry !== 'GB' && req !== 'GB' && !loc.includes('london') && !loc.includes('united kingdom')) return false;
      } else if (state.selectedHub === 'Canada') {
        if (cntry !== 'CA' && req !== 'CA' && !loc.includes('toronto') && !loc.includes('vancouver') && !loc.includes('canada')) return false;
      } else if (state.selectedHub === 'India') {
        if (cntry !== 'IN' && req !== 'IN' && !loc.includes('india') && !loc.includes('bengaluru') && !loc.includes('hyderabad')) return false;
      } else {
        const q = state.selectedHub.toLowerCase();
        if (!loc.includes(q) && !cty.includes(q)) return false;
      }
    }

    // 6. Category
    if (state.selectedCategory !== 'All') {
      const matchesCat =
        job.category === state.selectedCategory ||
        (state.selectedCategory === 'Others' && (job.category === 'Others' || job.category === 'Other'));
      if (!matchesCat) return false;
    }

    // 7. Posted Date Window
    if (state.postedWithin !== 'any') {
      const ts = getJobTimestamp(job);
      const maxAge = cutoffMs[state.postedWithin];
      if (!ts || now - ts > maxAge) return false;
    }

    // 8. Saved Only
    if (state.savedOnly && !savedJobIds.includes(job.id)) {
      return false;
    }

    return true;
  });

  return filtered.sort((a, b) => {
    if (state.sortBy === 'oldest') {
      return getJobTimestamp(a) - getJobTimestamp(b);
    }
    if (state.sortBy === 'company-az') {
      return (a.company || '').localeCompare(b.company || '') || getJobTimestamp(b) - getJobTimestamp(a);
    }
    if (state.sortBy === 'title-az') {
      return (a.title || '').localeCompare(b.title || '') || getJobTimestamp(b) - getJobTimestamp(a);
    }
    if (state.sortBy === 'salary') {
      const salA = a.salaryDisclosed === false ? 0 : (a.salary?.max || a.salary?.min || 0);
      const salB = b.salaryDisclosed === false ? 0 : (b.salary?.max || b.salary?.min || 0);
      if (salB !== salA) return salB - salA;
    }
    // Latest First default
    const diff = getJobTimestamp(b) - getJobTimestamp(a);
    if (diff !== 0) return diff;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });
}

interface JobFeedControlsProps {
  state: JobFilterState;
  onChange: (patch: Partial<JobFilterState>) => void;
  onReset: () => void;
  viewMode: ViewModeOption;
  onViewModeChange: (mode: ViewModeOption) => void;
  savedCount: number;
  searchInputId?: string;
}

export const JobFeedControls: React.FC<JobFeedControlsProps> = ({
  state,
  onChange,
  onReset,
  viewMode,
  onViewModeChange,
  savedCount,
  searchInputId = 'job-search-input',
}) => {
  const activeChips: { key: string; label: string; clear: () => void }[] = [];

  if (state.searchQuery.trim()) {
    activeChips.push({
      key: 'search',
      label: `Search: "${state.searchQuery.trim()}"`,
      clear: () => onChange({ searchQuery: '' }),
    });
  }
  if (state.workMode !== 'All') {
    activeChips.push({
      key: 'mode',
      label: `Mode: ${state.workMode}`,
      clear: () => onChange({ workMode: 'All' }),
    });
  }
  if (state.experience !== 'All') {
    activeChips.push({
      key: 'exp',
      label: `Level: ${state.experience}`,
      clear: () => onChange({ experience: 'All' }),
    });
  }
  if (state.workAuth !== 'All') {
    activeChips.push({
      key: 'auth',
      label: `Work Auth: ${state.workAuth}`,
      clear: () => onChange({ workAuth: 'All' }),
    });
  }
  if (state.selectedCategory !== 'All') {
    activeChips.push({
      key: 'cat',
      label: `Role: ${state.selectedCategory}`,
      clear: () => onChange({ selectedCategory: 'All' }),
    });
  }
  if (state.selectedHub !== 'All') {
    activeChips.push({
      key: 'hub',
      label: `Location: ${state.selectedHub}`,
      clear: () => onChange({ selectedHub: 'All' }),
    });
  }
  if (state.postedWithin !== 'any') {
    const labelMap: Record<PostedWindowFilter, string> = {
      any: 'Any Time',
      '24h': 'Last 24h',
      '3d': 'Last 3 Days',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
    };
    activeChips.push({
      key: 'posted',
      label: `Posted: ${labelMap[state.postedWithin]}`,
      clear: () => onChange({ postedWithin: 'any' }),
    });
  }
  if (state.savedOnly) {
    activeChips.push({
      key: 'saved',
      label: 'Saved Only',
      clear: () => onChange({ savedOnly: false }),
    });
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Full-width Search Bar */}
      <div className="bg-white border border-[#dadce0] hover:border-[#1a73e8]/70 focus-within:border-[#1a73e8] focus-within:ring-3 focus-within:ring-[#1a73e8]/15 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-2xs transition-all">
        <Search className="w-5 h-5 text-[#1a73e8] shrink-0" />
        <input
          id={searchInputId}
          type="text"
          placeholder="Search jobs by title, company, location, or skills..."
          value={state.searchQuery}
          onChange={(e) => onChange({ searchQuery: e.target.value })}
          className="w-full text-sm sm:text-[15px] text-[#202124] placeholder-[#5f6368] bg-transparent focus:outline-none font-normal"
        />
        {state.searchQuery && (
          <button
            type="button"
            onClick={() => onChange({ searchQuery: '' })}
            className="text-xs text-[#5f6368] hover:text-[#202124] px-2.5 py-1 rounded-lg hover:bg-[#f1f3f4] cursor-pointer font-medium whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {/* Row 2: Compact Filter Selectors + Sort + List/Grid Toggle */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Work Mode */}
          <select
            aria-label="Filter by work mode"
            value={state.workMode}
            onChange={(e) => onChange({ workMode: e.target.value as WorkModeFilter })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            <option value="All">All Modes</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site</option>
          </select>

          {/* Experience Level */}
          <select
            aria-label="Filter by experience level"
            value={state.experience}
            onChange={(e) => onChange({ experience: e.target.value as ExperienceFilter })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            <option value="All">All &lt; 3 YoE</option>
            <option value="Junior 0-2 YoE">Junior 0–2 YoE</option>
            <option value="Entry-Level 0 YoE">Entry-Level 0 YoE</option>
            <option value="New Grad">New Grad</option>
            <option value="Internships">Internships</option>
          </select>

          {/* Work Authorization */}
          <select
            aria-label="Filter by work authorization"
            value={state.workAuth}
            onChange={(e) => onChange({ workAuth: e.target.value as WorkAuthFilter })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            <option value="All">Work Auth: All</option>
            <option value="STEM OPT">STEM OPT Eligible</option>
            <option value="E-Verify">E-Verify</option>
            <option value="Visa Sponsorship">Visa Sponsorship</option>
            <option value="US Citizen Only">US Citizen Only</option>
          </select>

          {/* Role Category */}
          <select
            aria-label="Filter by role category"
            value={state.selectedCategory}
            onChange={(e) => onChange({ selectedCategory: e.target.value })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            {FEED_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          {/* Location Hub */}
          <select
            aria-label="Filter by location"
            value={state.selectedHub}
            onChange={(e) => onChange({ selectedHub: e.target.value })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            {FEED_TECH_HUBS.map((hub) => (
              <option key={hub.value} value={hub.value}>
                {hub.label}
              </option>
            ))}
          </select>

          {/* Posted Date */}
          <select
            aria-label="Filter by posted date"
            value={state.postedWithin}
            onChange={(e) => onChange({ postedWithin: e.target.value as PostedWindowFilter })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            <option value="any">Posted: Any Time</option>
            <option value="24h">Last 24h</option>
            <option value="3d">Last 3 Days</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>

          {/* Saved Toggle */}
          {savedCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ savedOnly: !state.savedOnly })}
              className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer border ${
                state.savedOnly
                  ? 'bg-[#fef7e0] border-[#f9ab00] text-[#b06000] font-semibold'
                  : 'bg-white border-[#dadce0] text-[#3c4043] hover:bg-[#f8f9fa]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${state.savedOnly ? 'fill-[#f9ab00]' : ''}`} />
              <span>Saved ({savedCount})</span>
            </button>
          )}
        </div>

        {/* Sort & List/Grid Toggle */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            aria-label="Sort jobs"
            value={state.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as JobSortOption })}
            className="h-9 px-3 rounded-lg text-xs font-medium border border-[#dadce0] bg-white text-[#3c4043] focus:outline-none focus:border-[#1a73e8] cursor-pointer hover:bg-[#f8f9fa]"
          >
            <option value="latest">Sort: Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="company-az">Company A–Z</option>
            <option value="title-az">Title A–Z</option>
            <option value="salary">Highest Salary</option>
          </select>

          <div
            className="inline-flex items-center rounded-lg border border-[#dadce0] bg-white p-0.5"
            role="group"
            aria-label="Layout view mode"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              title="List view"
              aria-label="List view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#e8f0fe] text-[#1a73e8]'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              title="Grid view"
              aria-label="Grid view"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#e8f0fe] text-[#1a73e8]'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] text-xs font-medium hover:bg-[#d2e3fc]/70 transition-colors cursor-pointer"
            >
              <span>{chip.label}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#5f6368] hover:text-[#d93025] hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear all filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
