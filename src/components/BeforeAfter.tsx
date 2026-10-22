import React, { useState } from 'react';
import { ArrowRight, Check, X, Sparkles, Zap, TrendingUp, Smartphone, Clock, ShieldAlert, Award } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { CONTACT_CONFIG } from '../data/contactConfig';
import { MessengerIcon } from './icons/MessengerIcon';

interface CaseComparison {
  id: string;
  client: string;
  industry: string;
  headline: string;
  before: {
    title: string;
    image: string;
    speed: string;
    mobileScore: string;
    conversion: string;
    flaws: string[];
  };
  after: {
    title: string;
    image: string;
    speed: string;
    mobileScore: string;
    conversion: string;
    improvements: string[];
  };
  keyResult: string;
}

export const BeforeAfter: React.FC = () => {
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'before' | 'after'>('side-by-side');

  const cases: CaseComparison[] = [
    {
      id: 'brightsmile',
      client: 'BrightSmile Dental Practice',
      industry: 'Healthcare / Dental Clinic',
      headline: 'From Phone Tag Chaos to Automated Online Patient Intake',
      before: {
        title: 'Legacy 2016 Static Website',
        image: '/images/before-after/dental-before.jpg',
        speed: '4.8s Slow Load',
        mobileScore: '42 / 100 Mobile',
        conversion: '1.2% Conversion',
        flaws: [
          'No online appointment booking (phone calls only)',
          'Non-responsive layout required pinch-to-zoom on phones',
          'Blurry treatment photos and walls of unformatted text',
          'High patient bounce rate during evening search hours'
        ]
      },
      after: {
        title: 'Happy Person Modern Redesign',
        image: '/images/before-after/dental-after.webp',
        speed: '0.8s Ultra Fast',
        mobileScore: '99 / 100 Mobile',
        conversion: '4.9% (+308%)',
        improvements: [
          'Interactive 1-click slot booking engine with calendar sync',
          'Mobile-first responsive UX with bottom sheet drawer navigation',
          'Modern typographic hierarchy & reassuring clinical palette',
          'Direct WhatsApp & Messenger floating emergency intake'
        ]
      },
      keyResult: '+140% New patient bookings within 60 days of launch'
    },
    {
      id: 'urbaneats',
      client: 'UrbanEats Hospitality Group',
      industry: 'Restaurant & Dining',
      headline: 'Replacing Downloadable PDF Menus with Instant Table Reservations',
      before: {
        title: 'Outdated Food Blog Template',
        image: '/images/before-after/restaurant-before.jpg',
        speed: '5.2s Heavy Assets',
        mobileScore: '38 / 100 Mobile',
        conversion: '0.9% Bookings',
        flaws: [
          'Menu was an unreadable 8MB PDF download link on mobile',
          'No real-time table reservation (phone voicemail only)',
          'Zero local SEO visibility for neighborhood food searches',
          'Poor low-light ambiance showcase'
        ]
      },
      after: {
        title: 'Happy Person Atmospheric Dining Portal',
        image: '/images/before-after/restaurant-after.webp',
        speed: '0.9s Blazing Fast',
        mobileScore: '98 / 100 Mobile',
        conversion: '4.4% (+388%)',
        improvements: [
          'Interactive digital menu with dietary badges & filter tabs',
          'Direct table reservation engine with instant confirmation',
          'Cinematic dark-mode aesthetic matching restaurant vibe',
          'Google Business rich schema markup for food menus'
        ]
      },
      keyResult: '38% Reduction in reservation no-shows + full Friday evening capacity'
    },
    {
      id: 'homenest',
      client: 'HomeNest Luxury Realty',
      industry: 'Real Estate & Property',
      headline: 'Transforming Static Spreadsheets into High-End Property Showcases',
      before: {
        title: 'Generic Agent Subpage',
        image: '/images/before-after/realestate-before.jpg',
        speed: '3.9s Cluttered Scripts',
        mobileScore: '51 / 100 Mobile',
        conversion: '1.4% Inquiries',
        flaws: [
          'Properties listed in tiny low-res thumbnail tables',
          'Exhausting 12-field contact form scared away buyers',
          'Slow MLS map integration crashed mobile browsers',
          'Brand felt like a budget broker rather than a luxury agency'
        ]
      },
      after: {
        title: 'Happy Person Editorial Property Platform',
        image: '/images/before-after/realestate-after.webp',
        speed: '0.7s Instant Load',
        mobileScore: '100 / 100 Mobile',
        conversion: '5.2% (+271%)',
        improvements: [
          'Full-bleed retina photography gallery with video walkthroughs',
          'Faceted neighborhood and bedroom filtering without page reloads',
          '1-tap Messenger inquiry concierge with auto-prefilled listings',
          'Luxury typography & clean slate architectural contrast'
        ]
      },
      keyResult: 'Over ৳3.2 Crore in property inquiries captured in the first quarter'
    }
  ];

  const currentCase = cases[activeCaseIndex];

  return (
    <section id="before-after" className="py-20 md:py-28 bg-neutral-100/60 dark:bg-[#0e1422] border-y border-neutral-200/80 dark:border-[#1e293b] transition-colors" aria-label="Before and After Redesign Comparisons">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Real World Transformations"
          title="Before / After Redesigns"
          description="See how Happy Person transforms slow, cluttered, low-converting websites into fast, modern, customer-generating digital assets."
        />

        {/* Case Switcher Tabs */}
        <div className="flex items-center justify-start sm:justify-center mb-8 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 bg-white dark:bg-[#111726] rounded-2xl border border-neutral-200/80 dark:border-[#1e293b] shadow-2xs gap-2">
            {cases.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCaseIndex(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeCaseIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm font-bold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{c.client}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Transformation Card */}
        <div className="rounded-3xl bg-white dark:bg-[#111726] border border-neutral-200/90 dark:border-[#1e293b] p-6 sm:p-8 md:p-10 shadow-xs mb-10">
          
          {/* Header of Active Case */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/80 dark:border-[#1e293b] mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                {currentCase.industry} Case Study
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-neutral-950 dark:text-white">
                {currentCase.headline}
              </h3>
            </div>
            
            {/* View Mode Toggle: Side-by-Side vs Toggle */}
            <div className="inline-flex p-1 bg-neutral-100 dark:bg-[#171f33] rounded-xl border border-neutral-200/60 dark:border-[#1e293b] self-start md:self-auto shrink-0">
              {(['side-by-side', 'before', 'after'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                    viewMode === mode
                      ? 'bg-white dark:bg-[#111726] text-neutral-950 dark:text-white shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  {mode.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Side by Side Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch mb-8">
            
            {/* BEFORE COLUMN */}
            {(viewMode === 'side-by-side' || viewMode === 'before') && (
              <div className="rounded-2xl bg-neutral-50 dark:bg-[#171f33]/60 border border-red-200/60 dark:border-red-950/60 p-6 flex flex-col justify-between">
                <div>
                  
                  {/* Before Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider">
                      <X className="w-3.5 h-3.5" />
                      <span>Before Redesign</span>
                    </span>
                    <span className="text-xs font-mono text-neutral-400">Previous Website</span>
                  </div>

                  {/* Screenshot Thumbnail */}
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 mb-5 border border-neutral-200 dark:border-neutral-700">
                    <img
                      src={currentCase.before.image}
                      alt={`${currentCase.client} before redesign`}
                      width={640}
                      height={400}
                      loading="lazy"
                      className="w-full h-full object-cover filter grayscale-40"
                    />
                    <div className="absolute inset-0 bg-red-950/20 backdrop-blur-[0.5px]" />
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] text-red-300 font-semibold">
                      Outdated UX & High Bounce Rate
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-neutral-900 dark:text-white mb-3">
                    {currentCase.before.title}
                  </h4>

                  {/* Flaws List */}
                  <div className="space-y-2 mb-6">
                    {currentCase.before.flaws.map((flaw, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                        <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{flaw}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Before Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200/80 dark:border-neutral-700/60 text-center">
                  <div className="p-2 bg-white dark:bg-[#111726] rounded-xl border border-neutral-200/60 dark:border-neutral-700/40">
                    <span className="text-[10px] text-neutral-400 block font-mono">Speed</span>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">{currentCase.before.speed}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#111726] rounded-xl border border-neutral-200/60 dark:border-neutral-700/40">
                    <span className="text-[10px] text-neutral-400 block font-mono">Mobile</span>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 font-mono">{currentCase.before.mobileScore}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#111726] rounded-xl border border-neutral-200/60 dark:border-neutral-700/40">
                    <span className="text-[10px] text-neutral-400 block font-mono">Conversion</span>
                    <span className="text-xs font-bold text-neutral-500 font-mono">{currentCase.before.conversion}</span>
                  </div>
                </div>

              </div>
            )}

            {/* AFTER COLUMN */}
            {(viewMode === 'side-by-side' || viewMode === 'after') && (
              <div className="rounded-2xl bg-blue-50/50 dark:bg-[#131d33] border-2 border-blue-500/80 dark:border-blue-500/70 p-6 flex flex-col justify-between shadow-sm">
                <div>
                  
                  {/* After Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                      <Check className="w-3.5 h-3.5" />
                      <span>Happy Person Redesign</span>
                    </span>
                    <span className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">Engineered for Results</span>
                  </div>

                  {/* Screenshot Thumbnail */}
                  <div className="relative aspect-16/10 rounded-xl overflow-hidden bg-neutral-900 mb-5 border border-blue-200 dark:border-blue-900/60 shadow-xs">
                    <img
                      src={currentCase.after.image}
                      alt={`${currentCase.client} after redesign by Happy Person`}
                      width={640}
                      height={400}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-blue-600/90 backdrop-blur-md text-[11px] text-white font-semibold">
                      Fast, Conversion-Focused & Responsive
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-neutral-950 dark:text-white mb-3">
                    {currentCase.after.title}
                  </h4>

                  {/* Improvements List */}
                  <div className="space-y-2 mb-6">
                    {currentCase.after.improvements.map((imp, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* After Metrics Strip */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-blue-200/80 dark:border-blue-900/60 text-center">
                  <div className="p-2 bg-white dark:bg-[#111726] rounded-xl border border-blue-200/80 dark:border-blue-800/40">
                    <span className="text-[10px] text-neutral-400 block font-mono">Speed</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{currentCase.after.speed}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#111726] rounded-xl border border-blue-200/80 dark:border-blue-800/40">
                    <span className="text-[10px] text-neutral-400 block font-mono">Mobile</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">{currentCase.after.mobileScore}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-[#111726] rounded-xl border border-blue-200/80 dark:border-blue-800/40">
                    <span className="text-[10px] text-neutral-400 block font-mono">Conversion</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">{currentCase.after.conversion}</span>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Bottom Highlight Key Result Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                  Measured Business Impact
                </span>
                <p className="text-sm font-bold text-neutral-900 dark:text-white">
                  {currentCase.keyResult}
                </p>
              </div>
            </div>

            <a
              href={CONTACT_CONFIG.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 shrink-0 transition-all cursor-pointer whitespace-nowrap"
            >
              <MessengerIcon className="w-4 h-4 fill-white" />
              <span>Get a Redesign Quote</span>
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
