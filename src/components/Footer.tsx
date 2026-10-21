import React from 'react';
import { Facebook, MessageSquare, Mail, ArrowUp, Smile } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { MessengerIcon } from './icons/MessengerIcon';
import { CONTACT_CONFIG } from '../data/contactConfig';

export const Footer: React.FC = () => {
  const { profile, services } = usePortfolioData();
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Web Projects', href: '#projects' },
    { name: 'Creative & AI', href: '#creative' },
    { name: 'Before/After', href: '#before-after' },
    { name: 'Services', href: '#services' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Add-Ons', href: '#addons' },
    { name: 'Process', href: '#process' },
    { name: 'Reviews', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="bg-white dark:bg-[#0b0f17] text-neutral-600 dark:text-neutral-400 border-t border-neutral-200/80 dark:border-[#1e293b] transition-colors" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-12">
          
          {/* Brand & Intro with Mascot Avatar (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-blue-600 border border-neutral-200 dark:border-neutral-700 shadow-xs shrink-0">
                <img
                  src={profile.avatar}
                  alt="Happy Person cat monster mascot"
                  width={44}
                  height={44}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-neutral-950 dark:text-white">
                    {profile.brandName}
                  </span>
                  <Smile className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  {profile.studioType}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              An independent creative studio designing and developing modern websites, appointment booking portals, and web app interfaces.
            </p>

            {/* 4 Allowed Contact Channels: Messenger, WhatsApp, Facebook, Email */}
            <div className="flex items-center gap-3 pt-2">
              {/* 1. Messenger (Primary) */}
              <a
                href={profile.messengerUrl || CONTACT_CONFIG.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Facebook Messenger chat"
                title="Message on Messenger (Primary Contact Method)"
              >
                <MessengerIcon className="w-4 h-4 fill-current" />
              </a>

              {/* 2. WhatsApp (Secondary) */}
              <a
                href={profile.whatsappUrl || CONTACT_CONFIG.whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-[#171f33] hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="WhatsApp chat (Secondary Contact Method)"
                title="Chat on WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </a>

              {/* 3. Facebook Page (Secondary) */}
              <a
                href={profile.facebookPageUrl || CONTACT_CONFIG.facebookPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-[#171f33] hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Facebook Page (Secondary Contact Method)"
                title="Facebook Page"
              >
                <Facebook className="w-4 h-4" />
              </a>

              {/* 4. Email (Backup) */}
              <a
                href={`mailto:${profile.email || CONTACT_CONFIG.email}`}
                className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-[#171f33] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 flex items-center justify-center"
                aria-label="Email inquiry (Backup Contact Method)"
                title="Email Inquiry"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links (Cols 6-8) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-900 dark:text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links (Cols 9-12) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs uppercase font-bold tracking-wider text-neutral-900 dark:text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {services.map((s) => (
                <li key={s.id}>
                  <a
                    href="#contact"
                    className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-200/80 dark:border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-500">
          <div>
            © {new Date().getFullYear()} {profile.brandName || 'Happy Person'}. All rights reserved.
          </div>

          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-500">
            <span>Crafted with Happy</span>
          </div>

          <button
            onClick={scrollToTop}
            className="p-2 rounded-lg bg-neutral-100 dark:bg-[#171f33] hover:bg-neutral-200 dark:hover:bg-[#202b44] text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
