import React from 'react';
import { X, Download, Printer, Code, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import { PROFILE_INFO } from '../data/portfolioData';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const { profile } = usePortfolioData();
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const resumeText = `# Happy Person - Independent Creative Web & UI Studio
${profile.location || PROFILE_INFO.location} | ${profile.email || PROFILE_INFO.email} | ${profile.phone || PROFILE_INFO.phone}

## Studio Profile
Happy Person is an independent creative brand and frontend studio crafting modern, high-converting websites, appointment booking portals, and SaaS dashboards with Google AI Studio, React, TypeScript, and Tailwind CSS.

## Core Technical & Design Competencies
- Frontend & UI: React, TypeScript, JavaScript (ES6+), HTML5, Tailwind CSS, Motion, Component Systems, WCAG AA Accessibility
- Prototyping & AI: Google AI Studio, Figma, Gemini API rapid prototyping
- Backend & Integrations: Node.js, Express, Neon PostgreSQL, Neon Object Storage, REST APIs, Calendar APIs, Stripe Checkout
- DevOps & Deployment: Git, GitHub, Vite, Vercel, Netlify, Cloud Run

## Selected Production Deliverables
- BrightSmile Dental Clinic: Real-time booking portal reducing no-shows by 38%
- UrbanEats Restaurant: Digital menu & instant table reservation platform
- HomeNest Real Estate: High-end property listing app with faceted search
- TaskFlow Dashboard: Modern SaaS analytics console with interactive visualizations

## Working Philosophy
Independent Creative Studio (2022 - Present)
- Delivered 20+ responsive web projects for businesses, clinics, and hospitality brands.
- Maintained a 100% on-time delivery record with average Google PageSpeed scores of 98+.
- Friendly, transparent communication with weekly milestones and 30-day warranty.
`;

    const blob = new Blob([resumeText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Happy_Person_Studio_Deck.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#111726] rounded-3xl shadow-2xl border border-neutral-200 dark:border-[#1e293b] overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#1e293b] bg-neutral-50 dark:bg-[#0e1422]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-blue-600 shrink-0">
              <img
                src={profile.avatar}
                alt="Happy Person mascot"
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">Happy Person Studio Profile</span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold">2026 Edition</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Print Overview"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer text-xs font-semibold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.MD)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer ml-2"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto space-y-6 text-sm text-neutral-700 dark:text-neutral-300">
          
          {/* Header Info */}
          <div className="border-b border-neutral-200 dark:border-[#1e293b] pb-6 flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-950/60 border border-neutral-200 dark:border-neutral-700 shrink-0">
              <img
                src={profile.avatar}
                alt="Happy Person cat monster mascot"
                width={64}
                height={64}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 id="resume-title" className="text-2xl font-bold text-neutral-950 dark:text-white">
                {profile.brandName || PROFILE_INFO.brandName}
              </h2>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                {profile.studioType || PROFILE_INFO.studioType}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                <span>{profile.location || PROFILE_INFO.location}</span>
                <span>·</span>
                <span>{profile.email || PROFILE_INFO.email}</span>
                <span>·</span>
                <span>{profile.phone || PROFILE_INFO.phone}</span>
              </div>
            </div>
          </div>

          {/* About section */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">
              Studio Summary & Persona
            </h3>
            <p className="leading-relaxed">
              Happy Person is an independent creative studio specializing in high-performance, conversion-oriented websites and modern web app interfaces. Designed with a friendly, approachable cat-monster mascot identity, the studio combines rapid Google AI Studio workflows with production-grade React and TypeScript engineering.
            </p>
          </div>

          {/* Quick Skills */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-500" />
              <span>Core Technical Capabilities</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#131b2e] border border-neutral-200/80 dark:border-[#1e293b]">
                <span className="font-semibold block text-neutral-900 dark:text-white mb-1">Frontend & UI Engineering</span>
                <span className="text-neutral-600 dark:text-neutral-400">React, TypeScript, Tailwind CSS, Responsive Mobile-First Design, WCAG AA Accessibility, CSS Transforms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#131b2e] border border-neutral-200/80 dark:border-[#1e293b]">
                <span className="font-semibold block text-neutral-900 dark:text-white mb-1">Modern AI & Tooling</span>
                <span className="text-neutral-600 dark:text-neutral-400">Google AI Studio Prototyping, Git, Vite, Neon PostgreSQL, Object Storage, Calendar APIs, High-Performance Hosting</span>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-blue-500" />
              <span>Featured Project Deliverables</span>
            </h3>
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-blue-500">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-neutral-950 dark:text-white">Automated Booking Portals</h4>
                  <span className="text-xs text-neutral-500 font-mono">2025 – 2026</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Engineered multi-step appointment scheduling systems for dental clinics and wellness centers with SMS/email confirmations and calendar slot syncing.
                </p>
              </div>

              <div className="relative pl-4 border-l-2 border-neutral-300 dark:border-neutral-700">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-neutral-950 dark:text-white">High-Impact Business & Hospitality Websites</h4>
                  <span className="text-xs text-neutral-500 font-mono">2024 – 2026</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Designed sensory-rich dining and luxury real estate platforms resulting in an average 40%+ increase in online client reservations and direct inquiries.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-[#0e1422] border-t border-neutral-200 dark:border-[#1e293b] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
