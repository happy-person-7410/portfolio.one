import React from 'react';
import { ArrowRight, Sparkles, MessageSquare, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { MessengerIcon } from './icons/MessengerIcon';

interface MidPageCTAProps {
  onStartProject: () => void;
}

export const MidPageCTA: React.FC<MidPageCTAProps> = ({ onStartProject }) => {
  const { profile } = usePortfolioData();
  const messengerLink = profile.messengerUrl || profile.socials?.messenger || 'https://m.me/happyperson7410';
  const whatsappLink = profile.whatsappUrl || profile.socials?.whatsapp || 'https://wa.me/8801576654285';

  return (
    <section className="py-12 sm:py-16 bg-neutral-100/70 dark:bg-[#0e1422] border-y border-neutral-200/80 dark:border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-8 sm:p-12 md:p-16 overflow-hidden shadow-xl">
          
          {/* Subtle background overlay circles */}
          <div aria-hidden="true" className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div aria-hidden="true" className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-blue-100 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Available for New Q4 / Q1 Projects</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-4 leading-tight text-balance">
              Have a project in mind? Let's build a website that delivers measurable results.
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-blue-100/90 leading-relaxed mb-8 max-w-2xl">
              Whether you need a full business website, an automated client booking portal, or a fast redesign, I offer transparent milestones, 24-hour response times, and zero hassle.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {/* Primary: Message on Messenger */}
              <a
                href={messengerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-blue-700 hover:bg-neutral-100 font-bold text-sm shadow-md transition-all cursor-pointer active:scale-95"
              >
                <MessengerIcon className="w-4 h-4 fill-blue-600" />
                <span>Message on Messenger</span>
              </a>

              {/* Secondary: Start a Project */}
              <button
                onClick={onStartProject}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all cursor-pointer"
              >
                <span>Fill Project Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary: WhatsApp */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold transition-all cursor-pointer"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-4 h-4 text-emerald-300" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Trust points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/15 text-xs text-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                <span>24-Hour Reply Guaranteed</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>100% Code & Asset Ownership</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
                <span>Free 30-Day Post-Launch Support</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
