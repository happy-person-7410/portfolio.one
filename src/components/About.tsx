import React, { useState } from 'react';
import { FileText, Sparkles, CheckCircle2, Layers, Cpu, Compass, HeartHandshake, Smile } from 'lucide-react';
import { PROFILE_INFO } from '../data/portfolioData';
import { useSiteProfile } from '../hooks';
import { ResumeModal } from './ResumeModal';
import { SectionHeader } from './ui/SectionHeader';
import { Button } from './ui/Button';

export const About: React.FC = () => {
  const { profile } = useSiteProfile();
  const [resumeOpen, setResumeOpen] = useState(false);

  const factIcons = [Layers, Cpu, Compass, HeartHandshake];

  return (
    <section id="about" className="py-20 md:py-28 bg-neutral-100/60 dark:bg-[#0e1422] border-y border-neutral-200/80 dark:border-[#1e293b] transition-colors" aria-label="About Happy Person">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Behind The Mascot"
          title="About Happy Person"
          description="Happy Person is an independent creative web design and frontend studio. I bring a warm, approachable personality backed by rock-solid engineering, helping clinics, restaurants, real estate firms, and founders turn ideas into websites that actually convert."
        />

        {/* Story & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Main Narrative */}
          <div className="lg:col-span-7 space-y-5 text-neutral-700 dark:text-neutral-300 text-sm sm:text-base leading-relaxed">
            <p>
              Why <strong>Happy Person</strong>? Because building a website shouldn't feel stressful, murky, or overwhelming. Instead of a traditional corporate agency with layers of account managers, I operate as an independent creative brand represented by a friendly cat-monster mascot. It reflects who I am: approachable, creative, reliable, and genuinely happy to help your business flourish.
            </p>
            <p>
              Behind the playful mascot is a meticulous software engineer and UI designer. In today's digital landscape, a website cannot just look pretty—it needs to solve real business bottlenecks. Whether that means reducing missed calls with an automated patient booking system, showcasing restaurant menus with high appetitive appeal, or giving users a frictionless e-commerce checkout, my work is directly measured by its impact on your bottom line.
            </p>
            <p>
              I leverage <strong>Google AI Studio</strong> alongside modern frontend technologies like React, TypeScript, and Tailwind CSS. This unique workflow allows me to rapid-prototype responsive layouts, stress-test responsive components in real time, and deliver agency-grade web experiences at independent studio agility and fair pricing.
            </p>

            {/* Resume button & badges */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => setResumeOpen(true)}
                icon={<FileText className="w-4 h-4" />}
                iconPosition="left"
              >
                View & Download Studio Deck / CV
              </Button>

              <div className="inline-flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Open for freelance contracts & redesigns</span>
              </div>
            </div>
          </div>

          {/* Side Highlights Box with Mascot Accent */}
          <div className="lg:col-span-5 bg-white dark:bg-[#111726] rounded-3xl p-6 sm:p-7 border border-neutral-200/80 dark:border-[#1e293b] shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl overflow-hidden bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 shrink-0">
                <img
                  src={profile.avatar}
                  alt="Happy Person cat monster mascot"
                  width={48}
                  height={48}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                  <Smile className="w-3.5 h-3.5" />
                  <span>The Happy Person Promise</span>
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                  Independent Studio Benefits
                </h3>
              </div>
            </div>
            
            <ul className="space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                <span><strong>Direct contact:</strong> No middle managers or account executives. You speak directly with the designer and developer building your site.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                <span><strong>Rapid iteration:</strong> Using Google AI Studio, initial functional mockups are ready within 48–72 hours.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                <span><strong>100% clean ownership:</strong> You receive complete ownership of your code, assets, and accounts with no vendor lock-in.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                <span><strong>Guaranteed speed:</strong> Zero bloated themes or slow page builders. Hand-crafted code optimized for Google Core Web Vitals.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 4 Quick Facts Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(profile?.quickFacts || PROFILE_INFO.quickFacts || []).map((fact: { label: string; title: string; desc: string }, index: number) => {
            const Icon = factIcons[index % factIcons.length];
            return (
              <div 
                key={fact.label}
                className="bg-white dark:bg-[#111726] rounded-2xl p-6 border border-neutral-200/80 dark:border-[#1e293b] shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#1a233a] text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs uppercase font-semibold text-neutral-400 dark:text-neutral-500 tracking-wider mb-1">
                  {fact.label}
                </div>
                <h4 className="text-base font-bold text-neutral-950 dark:text-white mb-2">
                  {fact.title}
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {fact.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {/* Resume modal */}
      <ResumeModal isOpen={resumeOpen} onClose={() => setResumeOpen(false)} />
    </section>
  );
};
