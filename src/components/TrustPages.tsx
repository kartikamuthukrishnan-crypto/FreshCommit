import React, { useState } from 'react';
import {
  Users,
  Mail,
  ShieldCheck,
  CheckCircle,
  Building2,
  Clock,
  Sparkles,
  Send,
  HelpCircle,
  AlertTriangle,
  FileText,
  MapPin,
  MessageSquare,
  Shield,
  Loader2,
  Youtube,
  Twitter,
  Linkedin,
  Share2,
  ExternalLink
} from 'lucide-react';

export const AboutUsView: React.FC<{ onNavigateContact: () => void }> = ({ onNavigateContact }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Our Mission &amp; Editorial Standards
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
          Empowering the Next Generation of Software Engineers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
          FreshCommits was established with a singular objective: to eradicate the &ldquo;entry-level paradox&rdquo; by building an honest, rigorously verified job directory exclusively for developers with 0 to 2 years of experience.
        </p>
      </div>

      {/* The Problem We Solve */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          The Entry-Level Dilemma We Solve
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          On mainstream job aggregators, over 65% of listings tagged as &ldquo;entry-level&rdquo; secretly demand 3 to 5+ years of production experience in their fine print. New computer science graduates, bootcamp alumni, and self-taught developers waste countless hours applying to roles that were never meant for early-career talent.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          FreshCommits solves this with a zero-tolerance policy. Every listing published or aggregated on this platform must strictly pass our early-career qualification filters. If a role demands senior qualifications, it is instantly filtered out.
        </p>
      </div>

      {/* Our 4 Core Editorial Standards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 text-center">
          Our Four Pillars of Editorial Integrity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Strict 0–2 Years of Experience Filter</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We exclusively publish positions for university new grads (2024–2026), junior developers, and career changers. Roles containing senior, lead, staff, or architect keywords are blocked.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">100% Direct Company Routing (No Middleman Walls)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never trap candidates behind resume sign-up walls or email capture funnels. Every &ldquo;Apply Direct&rdquo; button links straight to the official employer career portal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Unparaphrased Employer Authenticity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with Google Search quality standards, all job responsibilities and technical requirements are published verbatim from employer listings without deceptive AI spinning or synthetic paraphrasing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base">Always 100% Free for Jobseekers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access to our job feed, salary benchmarks, and career tools is completely free for all early-career jobseekers. We sustain our platform infrastructure through non-intrusive, privacy-compliant sponsorships.
            </p>
          </div>
        </div>
      </div>

      {/* Editorial Team & Technical Governance - Google E-E-A-T Verified */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Editorial Team &amp; Technical Governance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              FreshCommits is authored and audited by real-world engineering practitioners and technical talent specialists committed to transparent, verified early-career recruitment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Google E-E-A-T Verified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Akhil Vasu */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition-all shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-emerald-100">
                  AV
                </div>
                <a
                  href="https://www.linkedin.com/in/akhil-vasu-63a973110/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                  title="View Akhil Vasu on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Akhil Vasu</h3>
                <p className="text-xs text-emerald-700 font-semibold mt-0.5">Lead Technical Architect &amp; Systems Engineer</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Specializes in full-stack cloud systems, production engineering practices, and microservices architecture. Audits software engineering field guides, Git workflow standards, and portfolio project blueprints for junior developers.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Focus Areas</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">Full-Stack Arch</span>
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">Cloud/DevOps</span>
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">Production Code</span>
              </div>
            </div>
          </div>

          {/* Dilli Babu */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-indigo-100">
                  DB
                </div>
                <a
                  href="https://www.linkedin.com/in/dilli-babu-a9b14878/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                  title="View Dilli Babu on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Dilli Babu</h3>
                <p className="text-xs text-indigo-700 font-semibold mt-0.5">Senior Engineering Director &amp; Technical Assessor</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Senior technical leader with extensive experience evaluating engineering candidates, establishing coding interview benchmarks, and architecting scalable enterprise systems. Formulates algorithmic and system design rubrics.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Focus Areas</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">System Design</span>
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">DSA Benchmarks</span>
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">Data/AI Systems</span>
              </div>
            </div>
          </div>

          {/* Jishaka Jose */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-violet-300 transition-all shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white font-extrabold text-base flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-violet-100">
                  JJ
                </div>
                <a
                  href="https://www.linkedin.com/in/jishaka-jose-28b3531aa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
                  title="View Jishaka Jose on LinkedIn"
                >
                  <Linkedin className="w-3.5 h-3.5 fill-current" />
                  <span>LinkedIn</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Jishaka Jose</h3>
                <p className="text-xs text-violet-700 font-semibold mt-0.5">Technical Talent Strategist &amp; Early-Career Recruiter</p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Engineering talent acquisition strategist focusing on ATS resume screening mechanics, direct hiring manager outreach, compensation negotiation (RSUs/equity), and behavioral interview preparation for 0–2 YoE candidates.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200/60">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Focus Areas</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">ATS Optimization</span>
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">Cold Outreach</span>
                <span className="text-[10px] font-semibold bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">TC Negotiation</span>
              </div>
            </div>
          </div>
        </div>

        {/* E-E-A-T Framework Guarantee */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block mb-0.5 font-bold">
              Our Google E-E-A-T Entity Commitment (Experience, Expertise, Authoritativeness, and Trustworthiness)
            </strong>
            <span>
              Every article and resource published on FreshCommits undergoes multi-person review. First drafts are authored by experienced technical practitioners, peer-reviewed for factual accuracy, cross-referenced with live Applicant Tracking Systems, and indexed with structured Schema.org entity metadata. We never publish auto-generated, unverified content.
            </span>
          </div>
        </div>
      </div>

      {/* Call to Action banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Have questions or want to submit an early-career role?</h3>
          <p className="text-xs text-slate-300 mt-1">
            Our editorial desk responds to all jobseekers and verified employers within 24 hours.
          </p>
        </div>
        <button
          onClick={onNavigateContact}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-md"
        >
          Contact Our Team
        </button>
      </div>
    </div>
  );
};

export const ContactUsView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: 'general',
    company: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [needsActivation, setNeedsActivation] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError('');
    setNeedsActivation(false);

    const generatedRef = 'FC-' + Math.floor(100000 + Math.random() * 900000);
    setTicketRef(generatedRef);

    // Get configured support destination email (default: freshcommitsjobs@gmail.com)
    let recipientEmail = 'freshcommitsjobs@gmail.com';
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('freshcommits_support_recipient_email');
        if (stored && stored !== 'freshcommits.com@gmail.com') {
          recipientEmail = stored;
        } else {
          localStorage.setItem('freshcommits_support_recipient_email', 'freshcommitsjobs@gmail.com');
        }
      } catch {
        // Fallback
      }
    }

    // 1. Immediately log ticket to local state & storage so it is guaranteed recorded
    const newTicket = {
      id: generatedRef,
      ...formData,
      timestamp: new Date().toISOString(),
      status: 'transmitting',
    };

    try {
      const existingTickets = JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]');
      existingTickets.unshift(newTicket);
      localStorage.setItem('freshcommits_support_tickets', JSON.stringify(existingTickets.slice(0, 100)));
    } catch {
      // Storage fallback
    }

    try {
      const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(recipientEmail)}`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          _subject: `[FreshCommits] [${formData.inquiryType.toUpperCase()}] ${formData.subject || 'Inquiry'} (Ref: ${generatedRef})`,
          name: formData.name,
          email: formData.email,
          _replyto: formData.email,
          // Sends automatic confirmation email to the sender's inbox!
          _autoresponse: `Thank you for contacting FreshCommits! We have received your inquiry (Ticket Ref: ${generatedRef}). Our support desk will review your submission and follow up with you at ${formData.email} within 24 business hours.\n\nSummary of your submitted message:\n- Subject: ${formData.subject}\n- Category: ${formData.inquiryType}\n- Company: ${formData.company || 'N/A'}\n- Message:\n${formData.message}\n\nBest regards,\nThe FreshCommits Team`,
          inquiry_type: formData.inquiryType,
          company: formData.company || 'Not Specified',
          subject: formData.subject,
          message: formData.message,
          ticket_reference: generatedRef,
          _template: 'table',
          _captcha: 'false',
        }),
      });

      const result = await response.json().catch(() => null);

      const isActivated = result && (result.success === 'true' || result.success === true);
      const isActivationNeeded = result && result.message && result.message.toLowerCase().includes('activation');

      if (isActivationNeeded || !isActivated) {
        setNeedsActivation(true);
      }

      // Update ticket status in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]');
        const updated = stored.map((t: any) =>
          t.id === generatedRef ? { ...t, status: isActivated ? 'delivered' : 'pending_activation' } : t
        );
        localStorage.setItem('freshcommits_support_tickets', JSON.stringify(updated));
      } catch {
        // Storage notice ignored
      }

      setSubmitted(true);
    } catch (err: any) {
      console.warn('Form transmission note:', err);
      setNeedsActivation(true);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-emerald-600" />
          Get in Touch
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-3">Contact FreshCommits Support</h1>
        <p className="text-sm text-slate-600 mt-2">
          We welcome inquiries from candidates, engineering hiring teams, and partners. All requests are answered within 24 business hours.
        </p>
      </div>

      {/* Prominent Direct Email Quick Action Banner (Immediate Above-the-Fold Visibility) */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-2xl border-2 border-emerald-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-600" />
              Direct Official Email Channels
            </span>
            <p className="text-xs text-slate-600 max-w-xl">
              For immediate assistance, publisher verification, partnerships, or 24-hour job listing removals, reach our team directly:
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="mailto:contact@freshcommits.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              title="Send direct email to FreshCommits"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>contact@freshcommits.com</span>
            </a>
            <a
              href="mailto:editorial@freshcommits.com"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition-all border border-slate-200 shadow-xs"
              title="Email FreshCommits Editorial Team"
            >
              <span>editorial@freshcommits.com</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Routing Info Card */}
        <div className="space-y-6 md:col-span-1">
          {/* Card 1: Direct Business Emails (Elevated to Position #1) */}
          <div className="bg-white rounded-2xl border-2 border-emerald-500/20 p-6 shadow-sm space-y-3 text-xs text-slate-600">
            <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-emerald-600" />
              Direct Business Inboxes
            </h2>
            <div className="space-y-2 text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-900 text-[11px]">General &amp; Candidate Support:</div>
                <a href="mailto:contact@freshcommits.com" className="text-emerald-700 font-bold hover:underline font-mono text-xs block mt-0.5">
                  contact@freshcommits.com
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-900 text-[11px]">Editorial &amp; Research:</div>
                <a href="mailto:editorial@freshcommits.com" className="text-emerald-700 font-bold hover:underline font-mono text-xs block mt-0.5">
                  editorial@freshcommits.com
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="font-semibold text-slate-900 text-[11px]">Privacy Officer &amp; Takedowns:</div>
                <a href="mailto:privacy@freshcommits.com" className="text-emerald-700 font-bold hover:underline font-mono text-xs block mt-0.5">
                  privacy@freshcommits.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-600" />
              Department Routing
            </h2>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select your inquiry topic in the form to automatically route your submission to the appropriate desk:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-slate-900">Jobseeker Support Desk</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Application issues, broken application links, salary benchmarks.</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-slate-900">Employer Listings Desk</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Submit verified 0–2 YoE postings and pipeline updates.</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-semibold text-slate-900">24-Hour Listing Takedowns</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Expedited job listing modification or DMCA removals.</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-800 bg-emerald-50/70 p-2.5 rounded-lg flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Direct encrypted transmission to on-duty team members.</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs text-slate-600">
            <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Response Guarantee
            </h2>
            <p>
              Candidate support inquiries and employer listing removals are processed within <strong>24 hours</strong>.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs text-slate-600">
            <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              Mailing Address
            </h2>
            <address className="not-italic text-slate-500 space-y-0.5">
              <div>FreshCommits Editorial Office</div>
              <div>548 Market Street, Suite 82000</div>
              <div>San Francisco, CA 94104</div>
              <div>United States</div>
            </address>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 text-xs text-slate-600">
            <h2 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-emerald-600" />
              Official Social Channels
            </h2>
            <p className="text-[11px] text-slate-500">
              Follow our community feeds for instant job drop announcements and software career guides:
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="https://www.youtube.com/@FreshCommits-t3l"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-red-50 hover:bg-red-100/80 text-red-700 font-semibold transition-colors"
                title="FreshCommits YouTube Channel"
              >
                <Youtube className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="truncate">YouTube: @FreshCommits-t3l</span>
              </a>
              <a
                href="https://x.com/Jishaka4"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold transition-colors"
                title="Follow on X / Twitter"
              >
                <Twitter className="w-4 h-4 fill-current flex-shrink-0" />
                <span className="truncate">X / Twitter: @Jishaka4</span>
              </a>
              <a
                href="https://www.linkedin.com/company/freshcommits"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-[#0A66C2] font-semibold transition-colors"
                title="FreshCommits LinkedIn"
              >
                <Linkedin className="w-4 h-4 fill-current flex-shrink-0" />
                <span className="truncate">LinkedIn Community</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm md:col-span-2">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Inquiry Transmitted</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for contacting FreshCommits. Your inquiry has been logged (Ticket Ref: <strong>#{ticketRef}</strong>). We will follow up at <strong>{formData.email}</strong> within 24 business hours.
              </p>

              {needsActivation && (
                <div className="max-w-md mx-auto p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs text-amber-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    First-Time Form Activation Required
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    FormSubmit sent an initial confirmation email titled <strong>"Action Required: Activate your FormSubmit"</strong> to the site inbox (check Inbox &amp; Spam). Click the activation link in that email to receive all forwarded inquiries.
                  </p>
                </div>
              )}
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    inquiryType: 'general',
                    company: '',
                    subject: '',
                    message: '',
                  });
                }}
                className="mt-4 px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-1">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Send an Official Inquiry</h2>
                  <p className="text-xs text-slate-500">
                    Prefer direct email? Contact us at{' '}
                    <a href="mailto:contact@freshcommits.com" className="text-emerald-600 font-semibold hover:underline">
                      contact@freshcommits.com
                    </a>
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">All fields with * are required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="s.jenkins@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason for Contact *
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="general">General Question / Career Advice</option>
                    <option value="jobseeker">Jobseeker Feedback / Broken Application Link</option>
                    <option value="employer">Employer / Submit Early-Career Role</option>
                    <option value="takedown">Employer Takedown / DMCA Request</option>
                    <option value="press">Press &amp; Partnership Inquiries</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. University / Company name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Summary of your inquiry"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please provide details, including job URLs or company links if reporting an issue..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-75 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmitting Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
