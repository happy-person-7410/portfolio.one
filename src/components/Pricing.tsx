import React from 'react';
import { Check, ArrowRight, Sparkles, MessageSquare, Facebook, ExternalLink, ShieldCheck, Mail } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { usePricing, useSiteProfile } from '../hooks';
import { PricingSkeleton } from './skeletons';
import { MessengerIcon } from './icons/MessengerIcon';
import { ADDON_SERVICES, PRICING_DISCLAIMER_NOTE } from '../data/pricingData';
import { CONTACT_CONFIG } from '../data/contactConfig';

interface PricingProps {
  onSelectPlan: (planName: string, serviceCategory: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const { pricingPlans, isLoading } = usePricing();
  const { messengerUrl, whatsappUrl, facebookPageUrl, email } = useSiteProfile();
  const messengerLink = messengerUrl || CONTACT_CONFIG.messengerUrl;
  const whatsappLink = whatsappUrl || CONTACT_CONFIG.whatsAppUrl;
  const facebookPageLink = facebookPageUrl || CONTACT_CONFIG.facebookPageUrl;
  const emailLink = `mailto:${email || CONTACT_CONFIG.email}`;

  return (
    <section id="pricing" className="py-20 md:py-28 bg-neutral-100/60 dark:bg-[#0e1422] border-y border-neutral-200/80 dark:border-[#1e293b] transition-colors" aria-label="Pricing Packages">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Clear & Upfront Investments (BDT Only)"
          title="Simple, Transparent Pricing"
          description="Straightforward starting prices in Bangladeshi Taka (৳). No surprise retainer traps or hidden licensing fees. All prices are starting rates and fully editable."
        />

        {/* Clear Notice Banner (Prompt Requirement) */}
        <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-teal-500/10 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-teal-950/30 border-2 border-blue-500/40 dark:border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-700 dark:text-blue-300 block mb-0.5">
                Pricing Transparency Note
              </span>
              <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 font-semibold leading-relaxed">
                {PRICING_DISCLAIMER_NOTE}
              </p>
            </div>
          </div>
          <a
            href={messengerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-md shadow-blue-500/25 shrink-0 transition-all cursor-pointer active:scale-95"
            aria-label="Message on Messenger for a free quote"
          >
            <MessengerIcon className="w-4 h-4 fill-white" />
            <span>Message on Messenger</span>
          </a>
        </div>

        {/* 3 Core Packages Grid */}
        {isLoading && pricingPlans.length === 0 ? (
          <PricingSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
            {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 transition-all flex flex-col justify-between ${
                plan.isRecommended
                  ? 'bg-white dark:bg-[#111726] border-2 border-blue-600 dark:border-blue-500 shadow-xl lg:-translate-y-2'
                  : 'bg-white dark:bg-[#111726] border border-neutral-200/90 dark:border-[#1e293b] shadow-2xs'
              }`}
            >
              
              {/* Recommended Badge on middle plan */}
              {plan.isRecommended && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Most Popular Choice</span>
                  </span>
                </div>
              )}

              <div>
                
                {/* Plan Title & Subtitle */}
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                  {plan.subtitle}
                </p>

                {/* "Starting from" Price Display */}
                <div className="mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                    Starting from
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-neutral-950 dark:text-white font-mono tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      BDT
                    </span>
                  </div>
                </div>

                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-8">
                  Delivery: {plan.turnaroundTime}
                </div>

                {/* Features List */}
                <div className="pt-6 border-t border-neutral-100 dark:border-[#1e293b] space-y-3 mb-8">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    What's included:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

              </div>

              {/* Get Started Button */}
              <button
                type="button"
                onClick={() => onSelectPlan(plan.name, plan.serviceCategory)}
                className={`w-full py-3.5 px-5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] hover-lift focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  plan.isRecommended
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                    : 'bg-neutral-100 dark:bg-[#171f33] hover:bg-neutral-200 dark:hover:bg-[#202b44] text-neutral-900 dark:text-white'
                }`}
              >
                <span>Select {plan.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          ))}
        </div>
      )}

        {/* Link to Dedicated Section 8: Add-Ons */}
        <div className="pt-8 border-t border-neutral-200/80 dark:border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#171f33] text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-[#1e293b]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-950 dark:text-white">
                Looking for Logos, Social Banners, AI Visuals, or Maintenance?
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Explore 7 modular add-on services starting from ৳300 in our dedicated Add-Ons section below.
              </p>
            </div>
          </div>
          <a
            href="#addons"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 transition-colors cursor-pointer shrink-0"
          >
            <span>View All Add-Ons</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Custom Scope & Messenger Quick Inquiry Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111726] border border-neutral-200/90 dark:border-[#1e293b] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
              Need a Custom Scope or Rapid Estimate?
            </h4>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">
              Get an upfront timeline and exact project quote directly from Happy Person. Fastest reply guaranteed.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            {/* Primary Button: Message on Messenger */}
            <a
              href={messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer w-full sm:w-auto"
            >
              <MessengerIcon className="w-4 h-4 fill-white shrink-0" />
              <span>Message on Messenger</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Secondary Button: WhatsApp */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#171f33] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 border border-neutral-200/80 dark:border-[#1e293b] transition-all cursor-pointer w-full sm:w-auto"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
              <span>WhatsApp</span>
            </a>

            {/* Secondary Button: Facebook Page */}
            <a
              href={facebookPageLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#171f33] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 border border-neutral-200/80 dark:border-[#1e293b] transition-all cursor-pointer w-full sm:w-auto"
              title="Facebook Page"
            >
              <Facebook className="w-3.5 h-3.5 text-blue-500" />
              <span>Facebook Page</span>
            </a>

            {/* Backup Button: Email */}
            <a
              href={emailLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#171f33] hover:bg-neutral-200 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white border border-neutral-200/80 dark:border-[#1e293b] transition-all cursor-pointer w-full sm:w-auto"
              title="Email Inquiry"
            >
              <Mail className="w-3.5 h-3.5 text-neutral-500" />
              <span>Email</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
