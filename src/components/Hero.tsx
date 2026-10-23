import { ArrowRight, Sparkles, Code2, Laptop, CalendarCheck, BarChart3, Bot, HeartHandshake, ExternalLink, MessageSquare, Facebook, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { useSiteProfile } from '../hooks';
import { MessengerIcon } from './icons/MessengerIcon';
import { CONTACT_CONFIG } from '../data/contactConfig';

interface HeroProps {
  onViewWorkClick: () => void;
  onHireMeClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onViewWorkClick, onHireMeClick }) => {
  const { profile, messengerUrl, whatsappUrl, facebookPageUrl, email } = useSiteProfile();
  const messengerLink = messengerUrl || CONTACT_CONFIG.messengerUrl;
  const whatsappLink = whatsappUrl || CONTACT_CONFIG.whatsAppUrl;
  const facebookPageLink = facebookPageUrl || CONTACT_CONFIG.facebookPageUrl;
  const emailLink = `mailto:${email || CONTACT_CONFIG.email}`;
  const capabilities = [
    { label: "Web UI Design", icon: Laptop },
    { label: "Responsive Websites", icon: Code2 },
    { label: "Booking Systems", icon: CalendarCheck },
    { label: "Dashboard UI", icon: BarChart3 },
    { label: "AI-Powered Web Apps", icon: Bot },
  ];

  return (
    <section 
      id="home" 
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden transition-colors"
      aria-label="Hero Section"
    >
      {/* Subtle background ambient gradients */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-teal-400/5 dark:from-blue-600/15 dark:via-indigo-600/15 dark:to-cyan-500/5 blur-3xl rounded-full" />
        <div className="absolute top-2/3 right-10 w-[350px] h-[220px] bg-gradient-to-br from-emerald-500/5 via-blue-500/10 to-purple-500/5 dark:from-emerald-500/10 dark:via-blue-600/10 dark:to-purple-500/10 blur-3xl rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Hero: Typography & Primary Action (Left) + Mascot Frame (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Typographic Hierarchy */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Friendly Mascot Kicker */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-[#131b2e] border border-blue-200/80 dark:border-[#1e293b] text-xs font-semibold text-blue-700 dark:text-blue-300 mb-6 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Happy Person · Independent Creative Web Studio</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-neutral-500 dark:text-neutral-400">Available for projects</span>
            </div>

            {/* SINGLE H1 on Homepage */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.12] mb-6 max-w-2xl text-balance">
              {profile.headline}
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg md:text-xl text-neutral-600 dark:text-neutral-300 leading-relaxed mb-8 max-w-xl">
              {profile.subheading}
            </p>

            {/* Action Buttons with Prominent Messenger CTA */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 w-full sm:w-auto">
              {/* Prominent Primary Messenger Button */}
              <a
                href={messengerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group cursor-pointer w-full sm:w-auto"
                aria-label="Message on Facebook Messenger (Fastest Reply)"
              >
                <MessengerIcon className="w-5 h-5 shrink-0 fill-white" />
                <span>Message on Messenger</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold text-white uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Fastest
                </span>
              </a>

              <Button
                variant="primary"
                size="lg"
                onClick={onViewWorkClick}
                icon={<ArrowRight className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                View My Work
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={onHireMeClick}
                className="w-full sm:w-auto"
              >
                Start a Project
              </Button>
            </div>

            {/* Secondary Direct Channels */}
            <div className="flex flex-wrap items-center gap-2.5 mb-10 text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Secondary channels:</span>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#111726] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200/80 dark:border-[#1e293b] shadow-2xs transition-colors"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                <span>WhatsApp</span>
              </a>
              <a
                href={facebookPageLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#111726] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 border border-neutral-200/80 dark:border-[#1e293b] shadow-2xs transition-colors"
                title="Facebook Page"
              >
                <Facebook className="w-3.5 h-3.5 text-blue-500" />
                <span>Facebook Page</span>
              </a>
              <a
                href={emailLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#111726] hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/80 dark:border-[#1e293b] shadow-2xs transition-colors"
                title="Email Inquiry"
              >
                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                <span>Email</span>
              </a>
            </div>

            {/* Core Capability Badges */}
            <div className="w-full pt-6 border-t border-neutral-200/80 dark:border-[#1e293b]">
              <div className="text-xs uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 mb-3">
                Core Capabilities
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {capabilities.map((b) => {
                  const Icon = b.icon;
                  return (
                    <div 
                      key={b.label}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111726] border border-neutral-200/80 dark:border-[#1e293b] text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs hover:border-blue-500/50 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{b.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Cat-Monster Mascot Avatar Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              
              {/* Outer soft ambient halo */}
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-400 rounded-3xl blur-xl opacity-25 dark:opacity-35 transition duration-500"></div>

              {/* Card Container */}
              <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#111726] border border-neutral-200/90 dark:border-[#1e293b] shadow-2xl">
                
                {/* Mascot Image Area - Eagerly loaded for performance */}
                <div className="relative aspect-square w-full bg-gradient-to-b from-blue-50/50 to-neutral-100 dark:from-[#131b2e] dark:to-[#0e1422] overflow-hidden">
                  <img
                    src={profile.avatar}
                    alt="Happy Person friendly cat-monster mascot avatar waving in creative studio"
                    width={480}
                    height={480}
                    loading="eager"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  
                  {/* Floating Availability Pill */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-neutral-200/80 dark:border-[#1e293b] flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <div className="text-xs">
                        <p className="font-bold text-neutral-900 dark:text-white">Happy Person Studio</p>
                        <p className="text-neutral-500 dark:text-neutral-400">Independent & ready for new projects</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40">
                      2026
                    </span>
                  </div>
                </div>

                {/* Sub-card snippet */}
                <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-[#1e293b] bg-neutral-50/70 dark:bg-[#0e1422]">
                  <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-200">
                      <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />
                      <span>Friendly, creative & reliable</span>
                    </div>
                    <span>Remote Worldwide</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Full-width Metric Strip below the hero split */}
        <div className="mt-14 pt-8 border-t border-neutral-200/70 dark:border-[#1e293b] grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              8+
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Production Websites & Web Apps
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              100%
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              On-Time Project Delivery Rate
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              98+
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Average Google PageSpeed Score
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white font-mono tabular-nums">
              5.0 ★
            </div>
            <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Client Satisfaction Rating
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
