import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Facebook,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { SectionHeader } from './ui/SectionHeader';
import { Button } from './ui/Button';
import { MessengerIcon } from './icons/MessengerIcon';
import { CONTACT_CONFIG } from '../data/contactConfig';

interface ContactProps {
  initialService?: string;
  initialBudget?: string;
}

export const Contact: React.FC<ContactProps> = ({ initialService, initialBudget }) => {
  const { profile, services } = usePortfolioData();
  
  // 4 Primary Contact Channels
  const messengerLink = profile?.messengerUrl || CONTACT_CONFIG.messengerUrl;
  const whatsappLink = profile?.whatsappUrl || CONTACT_CONFIG.whatsAppUrl;
  const facebookPageLink = profile?.facebookPageUrl || CONTACT_CONFIG.facebookPageUrl;
  const emailAddress = profile?.email || CONTACT_CONFIG.email;

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    businessType: '',
    service: initialService || 'Website Design & Development',
    budget: initialBudget || '৳5,000 - ৳15,000',
    deadline: '',
    referenceWebsites: '',
    featuresNeeded: '',
    preferredContact: 'Messenger',
    details: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Update formData when props change
  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, service: initialService }));
    }
    if (initialBudget) {
      setFormData((prev) => ({ ...prev, budget: initialBudget }));
    }
  }, [initialService, initialBudget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const createFormattedMessage = (data: typeof formData): string => {
    return [
      `Hello Happy Person,`,
      ``,
      `I would like to discuss a website/design project.`,
      ``,
      `Name: ${data.name.trim()}`,
      `Business/Project: ${data.businessName.trim() || 'N/A'}`,
      `Business type: ${data.businessType.trim() || 'N/A'}`,
      `Service needed: ${data.service}`,
      `Budget: ${data.budget}`,
      `Deadline: ${data.deadline.trim() || 'Flexible'}`,
      `Reference website(s): ${data.referenceWebsites.trim() || 'None'}`,
      `Pages/features needed: ${data.featuresNeeded.trim() || 'To be discussed'}`,
      `Preferred contact: ${data.preferredContact}`,
      ``,
      `Project details:`,
      `${data.details.trim()}`,
      ``,
      `Please let me know if this project is possible and what the next steps are.`
    ].join('\n');
  };

  const handleCopyMessage = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = generatedMessage;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate required inputs locally
    if (!formData.name.trim() || !formData.details.trim()) {
      setStatus('error');
      setErrorMessage('Please provide your name and a brief description of your project.');
      return;
    }

    const message = createFormattedMessage(formData);
    setGeneratedMessage(message);
    setStatus('ready');

    // Automatically attempt to copy to clipboard for convenience
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3500);
    }).catch(() => {
      // Silently proceed if browser blocks unprompted clipboard write
    });
  };

  const handleEditAgain = () => {
    setStatus('idle');
  };

  const handleStartFresh = () => {
    setFormData({
      name: '',
      businessName: '',
      businessType: '',
      service: 'Website Design & Development',
      budget: '৳5,000 - ৳15,000',
      deadline: '',
      referenceWebsites: '',
      featuresNeeded: '',
      preferredContact: 'Messenger',
      details: '',
    });
    setGeneratedMessage('');
    setStatus('idle');
    setCopied(false);
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-neutral-100/60 dark:bg-[#0e1422] border-y border-neutral-200/80 dark:border-[#1e293b] transition-colors" aria-label="Contact Section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Direct & Fast Communication"
          title="Start Your Project Today"
          description="Have a website idea, need a booking portal, or want to redesign your existing site? Reach out directly on Messenger for the fastest reply, or generate your project request below."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: 4 Approved Contact Methods */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white dark:bg-[#111726] rounded-3xl p-6 sm:p-7 border border-neutral-200/90 dark:border-[#1e293b] shadow-2xs space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl overflow-hidden bg-blue-600 border border-blue-400/30 shrink-0">
                  <img
                    src={profile.avatar}
                    alt={`${profile.brandName} mascot`}
                    width={44}
                    height={44}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-neutral-950 dark:text-white">
                      Direct Studio Channels
                    </h3>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 block">
                    Direct reply from {profile.name}
                  </span>
                </div>
              </div>

              {/* 1. PRIMARY CONTACT METHOD: Facebook Messenger */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-600/20 dark:via-indigo-900/15 dark:to-cyan-900/15 border-2 border-blue-500/60 dark:border-blue-500/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-bold text-white uppercase tracking-wider shadow-2xs">
                    <Sparkles className="w-3 h-3 text-cyan-200" />
                    <span>Primary Contact Method</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Fastest Response
                  </span>
                </div>

                <h4 className="text-sm font-bold text-neutral-950 dark:text-white mb-1">
                  Facebook Messenger
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-3.5 leading-relaxed">
                  The quickest way to reach me for project inquiries, custom estimates, and instant questions.
                </p>

                {/* Main Action Button */}
                <a
                  href={messengerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 group cursor-pointer"
                  aria-label="Message on Facebook Messenger"
                >
                  <MessengerIcon className="w-5 h-5 fill-white shrink-0" />
                  <span>Message on Messenger</span>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>

              {/* 2. SECONDARY CONTACT METHOD: WhatsApp (No plain phone digits displayed) */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 border border-neutral-200/80 dark:border-[#1e293b] transition-colors group focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">WhatsApp</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-medium">Secondary</span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block">
                    Chat directly on WhatsApp
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600 transition-colors shrink-0" />
              </a>

              {/* 3. SECONDARY CONTACT METHOD: Facebook Page */}
              <a
                href={facebookPageLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] hover:bg-blue-50/80 dark:hover:bg-blue-950/40 border border-neutral-200/80 dark:border-[#1e293b] transition-colors group focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">Facebook Page</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-medium">Secondary</span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block">
                    Follow & message on Facebook
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-blue-600 transition-colors shrink-0" />
              </a>

              {/* 4. BACKUP CONTACT METHOD: Email */}
              <a
                href={`mailto:${emailAddress}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] hover:bg-neutral-100 dark:hover:bg-neutral-800/60 border border-neutral-200/80 dark:border-[#1e293b] transition-colors group focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">Email Address</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium">Backup</span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate block">
                    {emailAddress}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-200 transition-colors shrink-0" />
              </a>

              {/* Response guarantee */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-neutral-700 dark:text-neutral-300">
                <span className="font-semibold block text-blue-700 dark:text-blue-300 mb-0.5">
                  ⚡ 24-Hour Reply Policy
                </span>
                For the fastest answer, click <strong>Message on Messenger</strong> above. I review every project inquiry personally.
              </div>

            </div>

          </div>

          {/* Right Column: Local Project Inquiry Form & Message Generator */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#111726] rounded-3xl p-6 sm:p-9 border border-neutral-200/90 dark:border-[#1e293b] shadow-sm">
              
              {status === 'ready' ? (
                /* Generated Message Preview Screen */
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Success Alert Header */}
                  <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">
                      <p className="font-bold text-sm text-emerald-950 dark:text-emerald-200 mb-0.5">
                        Your Project Request is Ready!
                      </p>
                      <p className="font-medium text-emerald-700 dark:text-emerald-300">
                        Your message has been copied. Paste it into Messenger and send it to Happy Person.
                      </p>
                    </div>
                  </div>

                  {/* Formatted Message Preview Box */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        Generated Inquiry Message
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="w-full p-4 rounded-2xl bg-neutral-900 text-neutral-100 text-xs font-mono whitespace-pre-wrap leading-relaxed border border-neutral-800 overflow-x-auto selection:bg-blue-600 selection:text-white">
                        {generatedMessage}
                      </pre>
                    </div>
                  </div>

                  {/* Primary Action Buttons: Copy Message & Open Messenger */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* 1. Copy Message Button */}
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className={`flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-md active:scale-95 ${
                        copied
                          ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-neutral-300" />
                          <span>Copy Message</span>
                        </>
                      )}
                    </button>

                    {/* 2. Open Messenger Button */}
                    <a
                      href={messengerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all cursor-pointer active:scale-95 text-center"
                    >
                      <MessengerIcon className="w-5 h-5 fill-white shrink-0" />
                      <span>Open Messenger</span>
                      <ExternalLink className="w-4 h-4 ml-1 opacity-75" />
                    </a>
                  </div>

                  {/* Clarifying instructions note */}
                  <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                      💡 How to send:
                    </p>
                    <p>
                      Click <strong>Copy Message</strong> (or use the already copied text), then click <strong>Open Messenger</strong> and paste (Ctrl+V / Cmd+V) directly into our chat window.
                    </p>
                  </div>

                  {/* Reset / Edit Actions */}
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-200/80 dark:border-[#1e293b]">
                    <button
                      type="button"
                      onClick={handleEditAgain}
                      className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Edit form details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartFresh}
                      className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Start a new inquiry</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* Interactive Local Inquiry Form */
                <form onSubmit={handleSubmit} className="space-y-5" aria-label="Project Request Form">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white">
                      Tell Me About Your Project
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Fill out the form below to instantly generate a ready-to-send project message for Messenger.
                    </p>
                  </div>

                  {status === 'error' && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 flex items-start gap-3 text-xs text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Row 1: Name & Business/Project */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="businessName" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Business / Project Name
                      </label>
                      <input
                        type="text"
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="e.g. Apex Health Clinic"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 2: Business Type & Service Needed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="businessType" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Business Type
                      </label>
                      <input
                        type="text"
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        placeholder="e.g. Dental Clinic, Restaurant, Real Estate"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="service" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Service Needed
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        {(services && services.length > 0 ? services : []).map((s) => (
                          <option key={s.id} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Landing Page Design">Landing Page Design</option>
                        <option value="Other Custom Web Project">Other Custom Web Project</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Budget Range & Deadline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="budget" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Budget Range
                      </label>
                      <select
                        id="budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        <option value="Under ৳5,000">Under ৳5,000 (Quick Landing Page / Fixes)</option>
                        <option value="৳5,000 - ৳15,000">৳5,000 - ৳15,000 (Starter Landing Page)</option>
                        <option value="৳15,000 - ৳25,000">৳15,000 - ৳25,000 (Business Website)</option>
                        <option value="৳25,000 - ৳50,000">৳25,000 - ৳50,000 (Booking / Custom Website)</option>
                        <option value="৳50,000+">৳50,000+ (High-Scale SaaS / Custom Platform)</option>
                        <option value="Flexible / Let's Discuss">Flexible / Let's Discuss</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="deadline" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Target Deadline
                      </label>
                      <input
                        type="text"
                        id="deadline"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        placeholder="e.g. 1-2 Weeks, ASAP, End of Month"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 4: Reference Websites & Pages/Features Needed */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="referenceWebsites" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Reference Website(s)
                      </label>
                      <input
                        type="text"
                        id="referenceWebsites"
                        name="referenceWebsites"
                        value={formData.referenceWebsites}
                        onChange={handleChange}
                        placeholder="e.g. apple.com, stripe.com, competitor.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="featuresNeeded" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Pages / Features Needed
                      </label>
                      <input
                        type="text"
                        id="featuresNeeded"
                        name="featuresNeeded"
                        value={formData.featuresNeeded}
                        onChange={handleChange}
                        placeholder="e.g. 5 pages, booking calendar, contact form"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Row 5: Preferred Contact Method */}
                  <div>
                    <label htmlFor="preferredContact" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Preferred Contact Method
                    </label>
                    <select
                      id="preferredContact"
                      name="preferredContact"
                      value={formData.preferredContact}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
                    >
                      <option value="Messenger">Facebook Messenger (Primary & Fastest)</option>
                      <option value="WhatsApp">WhatsApp (Secondary)</option>
                      <option value="Facebook Page">Facebook Page (Secondary)</option>
                      <option value="Email">Email (Backup)</option>
                    </select>
                  </div>

                  {/* Row 6: Project Details Textarea */}
                  <div>
                    <label htmlFor="details" className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Project Details & Goals <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="details"
                      name="details"
                      rows={4}
                      required
                      value={formData.details}
                      onChange={handleChange}
                      placeholder="Tell me about your business goals, current bottlenecks, or special requirements..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#171f33] border border-neutral-200 dark:border-[#1e293b] text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-y"
                    ></textarea>
                  </div>

                  {/* Send Request Button (Client-side message generator) */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    icon={<Send className="w-4 h-4" />}
                    className="w-full cursor-pointer"
                  >
                    Send Request
                  </Button>

                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 text-center">
                    Instant local generation. No data sent to any third-party server.
                  </p>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
