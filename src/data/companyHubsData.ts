import { CompanyHub, CompanySalaryTier, InterviewStage, CompanyCategory } from './companyHubTypes';
import { FAANG_HUBS } from './hubs/faangHubs';
import { ENTERPRISE_HUBS } from './hubs/enterpriseHubs';
import { UNICORN_HUBS } from './hubs/unicornHubs';
import { REMOTE_HUBS } from './hubs/remoteHubs';

export type { CompanyHub, CompanySalaryTier, InterviewStage, CompanyCategory };

/**
 * Aggregated 39 US Tech Employer Hubs across:
 * 1. FAANG & Big Tech (Google, Amazon, Microsoft, Apple, Meta, Nvidia, Netflix, Tesla, IBM)
 * 2. Enterprise, Cloud & Consulting (Accenture, Deloitte, Cognizant, Oracle, Infosys, TCS, Capgemini, Cisco, Intel, Qualcomm)
 * 3. High-Growth Unicorns & FinTech (Stripe, Uber, Airbnb, Palantir, Databricks, Snowflake, Coinbase, Block, ServiceNow, Lyft)
 * 4. Remote-First & Scale-Ups (Shopify, Atlassian, GitHub, Discord, GitLab, Reddit, Spotify, Roblox, Zoom, Twitch)
 */
export const COMPANY_HUBS: CompanyHub[] = [
  ...FAANG_HUBS,
  ...ENTERPRISE_HUBS,
  ...UNICORN_HUBS,
  ...REMOTE_HUBS
];
