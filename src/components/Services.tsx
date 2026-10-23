import React from 'react';
import { 
  Globe, 
  Rocket, 
  Calendar, 
  ShoppingBag, 
  LayoutDashboard, 
  Palette, 
  Megaphone, 
  Video, 
  ArrowRight, 
  Check,
  Sparkles
} from 'lucide-react';
import { Service } from '../types';
import { SectionHeader } from './ui/SectionHeader';
import { useServices } from '../hooks';
import { ServicesSkeleton } from './skeletons';

interface ServicesProps {
  onRequestService: (serviceName: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ onRequestService }) => {
  const { services, isLoading } = useServices();
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe':
        return Globe;
      case 'Rocket':
        return Rocket;
      case 'Calendar':
        return Calendar;
      case 'ShoppingBag':
        return ShoppingBag;
      case 'LayoutDashboard':
        return LayoutDashboard;
      case 'Palette':
        return Palette;
      case 'Megaphone':
        return Megaphone;
      case 'Video':
        return Video;
      default:
        return Sparkles;
    }
  };

  return (
    <section id="services" className="py-20 md:py-28 transition-colors" aria-label="Services Offered">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeader
          kicker="Capabilities & Creative Services"
          title="Services Built to Scale Your Brand"
          description="From complete custom websites and booking portals to high-impact marketing assets and AI-generated media, Happy Person provides end-to-end design and engineering tailored for measurable growth."
          action={
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>8 core service disciplines · 30-day post-launch warranty included</span>
            </div>
          }
        />

        {/* Loading Skeletons */}
        {isLoading && services.length === 0 ? (
          <ServicesSkeleton count={8} />
        ) : (
          /* 8 Services Grid: 4 columns on large desktop, 2 on tablet, 1 on mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service: Service) => {
            const Icon = getIcon(service.iconName);
            const isAiService = service.id === 'ai-image-video';

            return (
              <div
                key={service.id}
                className={`group relative bg-white dark:bg-[#111726] rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between hover-lift ${
                  isAiService 
                    ? 'border-blue-400/60 dark:border-blue-500/50 shadow-md ring-1 ring-blue-500/20' 
                    : 'border-neutral-200/90 dark:border-[#1e293b] shadow-2xs hover:shadow-lg hover:border-blue-500/40 dark:hover:border-blue-500/40'
                }`}
              >
                <div>
                  
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-[#1a233a] text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Icon className="w-5 h-5" />
                    </div>

                    {isAiService && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/30 text-[10px] font-bold text-blue-600 dark:text-blue-300 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Featured AI</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-2 leading-snug">
                    {service.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Example Deliverables Checklist */}
                  <div className="mb-6">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-2">
                      Example Deliverables:
                    </span>
                    <ul className="space-y-2">
                      {service.highlights.map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Request Button */}
                <div className="pt-4 border-t border-neutral-100 dark:border-[#1e293b]">
                  <button
                    onClick={() => onRequestService(service.title)}
                    className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#171f33] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-neutral-800 dark:text-neutral-200 text-xs font-semibold tracking-wide transition-all cursor-pointer group-hover:border-transparent active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span>Request This Service</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      </div>
    </section>
  );
};
