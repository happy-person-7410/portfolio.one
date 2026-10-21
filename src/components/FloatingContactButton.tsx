import React, { useState } from 'react';
import { Mail, MessageSquare, ChevronUp, ChevronDown, X, ExternalLink, Facebook } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { MessengerIcon } from './icons/MessengerIcon';
import { CONTACT_CONFIG } from '../data/contactConfig';

export const FloatingContactButton: React.FC = () => {
  const { profile } = usePortfolioData();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const messengerLink = profile?.messengerUrl || CONTACT_CONFIG.messengerUrl;
  const whatsappLink = profile?.whatsappUrl || CONTACT_CONFIG.whatsAppUrl;
  const facebookPageLink = profile?.facebookPageUrl || CONTACT_CONFIG.facebookPageUrl;
  const emailLink = `mailto:${profile?.email || CONTACT_CONFIG.email}`;

  if (isDismissed) return null;

  return (
    <aside 
      aria-label="Floating Quick Contact"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2.5 print:hidden select-none"
    >
      {/* Secondary Options Menu (WhatsApp, Facebook Page, Email) when expanded */}
      {isExpanded && (
        <div 
          className="flex flex-col gap-2 p-2.5 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md rounded-2xl border border-neutral-200/90 dark:border-[#1e293b] shadow-2xl animate-in slide-in-from-bottom-3 duration-200 min-w-[220px]"
          role="menu"
          aria-label="Alternative contact methods"
        >
          <div className="flex items-center justify-between px-2 pt-1 pb-1.5 border-b border-neutral-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Secondary Channels
            </span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-md transition-colors"
              aria-label="Close other channels menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Secondary 1: WhatsApp (No plain phone digits displayed) */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span>WhatsApp Chat</span>
              <span className="text-[10px] text-neutral-400 font-normal">Secondary channel</span>
            </div>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Secondary 2: Facebook Page */}
          <a
            href={facebookPageLink}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Facebook className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span>Facebook Page</span>
              <span className="text-[10px] text-neutral-400 font-normal">Secondary channel</span>
            </div>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>

          {/* Backup: Email */}
          <a
            href={emailLink}
            role="menuitem"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 transition-colors group"
          >
            <div className="w-7 h-7 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span>Email Backup</span>
              <span className="text-[10px] text-neutral-400 font-normal">Direct inquiry</span>
            </div>
            <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </div>
      )}

      {/* Main Floating Bar: Messenger is the Primary Option */}
      <div className="flex items-center gap-1.5 p-1 bg-white/95 dark:bg-[#111726]/95 backdrop-blur-md rounded-full border border-blue-500/30 dark:border-blue-500/40 shadow-xl shadow-blue-500/10">
        
        {/* Prominent Primary Button: Open Messenger Directly */}
        <a
          href={messengerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 pl-3.5 pr-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
          aria-label="Message on Facebook Messenger (Primary Contact Method)"
        >
          <div className="relative">
            <MessengerIcon className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
            <span 
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-white ring-1 ring-emerald-500 animate-pulse" 
              title="Online now on Messenger"
            />
          </div>
          <span className="tracking-tight">Message on Messenger</span>
        </a>

        {/* Expand / Collapse toggle for secondary channels */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            isExpanded ? 'bg-neutral-100 dark:bg-slate-800 text-neutral-900 dark:text-white' : ''
          }`}
          title={isExpanded ? "Close alternative contact channels" : "Show other contact methods (WhatsApp, Email)"}
          aria-label={isExpanded ? "Close alternative contact channels" : "Show other contact methods"}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
