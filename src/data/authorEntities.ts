/**
 * Verified Author Entities for Google E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
 * Optimization across FreshCommits Career Insights, Job Verification Standards, and Editorial Governance.
 */

export interface AuthorEntity {
  id: 'akhil-vasu' | 'dilli-babu' | 'jishaka-jose';
  name: string;
  role: string;
  shortRole: string;
  title: string;
  initials: string;
  linkedinUrl: string;
  bio: string;
  fullBio: string;
  expertise: string[];
  avatarBg: string;
  accentColor: string;
}

export const AUTHOR_ENTITIES: Record<string, AuthorEntity> = {
  'akhil-vasu': {
    id: 'akhil-vasu',
    name: 'Akhil Vasu',
    role: 'Lead Technical Architect & Systems Engineer',
    shortRole: 'Lead Technical Architect',
    title: 'Lead Software Architect',
    initials: 'AV',
    linkedinUrl: 'https://www.linkedin.com/in/akhil-vasu-63a973110/',
    bio: 'Lead Software Architect specializing in full-stack cloud applications, distributed systems, and production engineering practices. Oversees technical resume blueprints, Git workflow hygiene, and code review rubrics for early-career developers.',
    fullBio: 'Akhil Vasu leads engineering architecture and technical content validation at FreshCommits. With extensive experience across cloud platforms, microservices, and distributed backend systems, Akhil audits software engineering guides, portfolio project architectures, and developer onboarding roadmaps to ensure strict alignment with production engineering standards.',
    expertise: [
      'Full-Stack Architecture',
      'Distributed Systems & APIs',
      'Cloud & CI/CD Pipelines',
      'Technical Portfolio Projects',
      'Production Code Quality & Git Hygiene'
    ],
    avatarBg: 'bg-emerald-600',
    accentColor: 'text-emerald-700'
  },
  'dilli-babu': {
    id: 'dilli-babu',
    name: 'Dilli Babu',
    role: 'Senior Engineering Director & Technical Assessor',
    shortRole: 'Senior Engineering Director',
    title: 'Senior Engineering Director',
    initials: 'DB',
    linkedinUrl: 'https://www.linkedin.com/in/dilli-babu-a9b14878/',
    bio: 'Senior Technical Leader and Systems Evaluator with deep experience conducting high-stakes technical screens, architecting distributed enterprise systems, and establishing engineering hiring benchmarks across global technology hubs.',
    fullBio: 'Dilli Babu oversees technical assessment rubrics, system design curriculum, and coding interview benchmark analyses at FreshCommits. Having screened hundreds of software engineering candidates across enterprise and scale-up environments, Dilli ensures all interview preparation strategies reflect the authentic evaluation criteria of senior engineering hiring committees.',
    expertise: [
      'System Design & Scalability',
      'Data Structures & Algorithmic Rigor',
      'Technical Interview Benchmarking',
      'Data & AI Engineering',
      'Engineering Career Laddering'
    ],
    avatarBg: 'bg-indigo-600',
    accentColor: 'text-indigo-700'
  },
  'jishaka-jose': {
    id: 'jishaka-jose',
    name: 'Jishaka Jose',
    role: 'Technical Talent Strategist & Early-Career Recruiter',
    shortRole: 'Technical Talent Strategist',
    title: 'Technical Talent Acquisition Strategist',
    initials: 'JJ',
    linkedinUrl: 'https://www.linkedin.com/in/jishaka-jose-28b3531aa/',
    bio: 'Engineering Talent Acquisition Strategist focused on technical recruiting pipelines, automated ATS resume screening mechanics, compensation negotiation (RSUs & equity), and direct hiring manager outreach strategies for early-career technologists.',
    fullBio: 'Jishaka Jose spearheads candidate outreach methodologies, ATS compliance research, and early-career compensation analysis at FreshCommits. Specializing in recruiter workflow mechanics and hiring manager psychology, Jishaka crafts actionable frameworks for cold messaging, technical resume optimization, and offer negotiation for 0–2 YoE engineers.',
    expertise: [
      'ATS Resume Screening Mechanics',
      'Technical Sourcing & Cold Outreach',
      'Salary & Equity (RSU) Negotiation',
      'Behavioral STAR Interviews',
      'Early-Career Career Strategy'
    ],
    avatarBg: 'bg-violet-600',
    accentColor: 'text-violet-700'
  }
};
