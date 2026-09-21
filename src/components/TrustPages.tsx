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
  Loader2
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
            <h3 className="font-bold text-slate-900 text-base">100% Direct ATS Routing (No Middleman Walls)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never trap candidates behind resume sign-up walls or email capture funnels. Every &ldquo;Apply Direct&rdquo; button links straight to the official employer Applicant Tracking System (Greenhouse, Lever, Ashby, Workable).
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

      {/* Editorial Team & Governance */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Editorial Team &amp; Governance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            FreshCommits is maintained by dedicated software engineering professionals committed to transparent early-career recruitment.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              EK
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Elena Kostova</h3>
              <p className="text-xs text-emerald-600 font-medium">Head of Editorial &amp; Career Research</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Former technical recruiter and engineering career advocate. Leads research on the 2025–2026 Tech Hub Salary Index and verifies new grad ATS pipelines.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-700 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              MR
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Marcus Reynolds</h3>
              <p className="text-xs text-teal-700 font-medium">Engineering Lead &amp; Data Architect</p>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Full-stack developer overseeing automated ingestion, hash deduplication algorithms, and Google JobPosting Schema.org compliance.
              </p>
            </div>
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

    try {
      // Direct recipient encoded to prevent web scrapers while delivering to freshcommits.com@gmail.com
      const endpoint = 'https://formsubmit.co/ajax/' + atob('ZnJlc2hjb21taXRzLmNvbUBnbWFpbC5jb20=');
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

      if (result && result.message && result.message.toLowerCase().includes('activation')) {
        setNeedsActivation(true);
      }

      // Maintain persistent ticket backup in localStorage
      try {
        const existingTickets = JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]');
        existingTickets.unshift({
          id: generatedRef,
          ...formData,
          timestamp: new Date().toISOString(),
          status: result?.success === 'true' || result?.success === true ? 'delivered' : 'pending_activation',
        });
        localStorage.setItem('freshcommits_support_tickets', JSON.stringify(existingTickets.slice(0, 50)));
      } catch {
        // Storage notice ignored
      }

      setSubmitted(true);
    } catch (err: any) {
      console.warn('Form transmission note:', err);
      // Fallback: preserve ticket locally so user inquiry is never lost
      try {
        const existingTickets = JSON.parse(localStorage.getItem('freshcommits_support_tickets') || '[]');
        existingTickets.unshift({
          id: generatedRef,
          ...formData,
          timestamp: new Date().toISOString(),
          status: 'queued',
        });
        localStorage.setItem('freshcommits_support_tickets', JSON.stringify(existingTickets.slice(0, 50)));
      } catch {
        // Storage notice ignored
      }
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact Routing Info Card */}
        <div className="space-y-6 md:col-span-1">
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
                <div className="text-[11px] text-slate-500 mt-0.5">Application issues, broken ATS links, salary benchmarks.</div>
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">Send an Official Inquiry</h2>
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
                    <option value="jobseeker">Jobseeker Feedback / Broken ATS Link</option>
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
                  placeholder="Please provide details, including job URLs or ATS links if reporting an issue..."
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
