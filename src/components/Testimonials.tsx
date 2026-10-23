import React from 'react';
import { Star } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { useTestimonials } from '../hooks';
import { TestimonialsSkeleton } from './skeletons';

export const Testimonials: React.FC = () => {
  const { testimonials, isLoading } = useTestimonials();
  return (
    <section id="testimonials" className="py-20 md:py-28 transition-colors" aria-label="Client Testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Client Feedback"
          title="Trusted by Founders & Practice Directors"
          description="Real outcomes from real business owners who transformed their online presence, streamlined workflows, and converted more website visitors into revenue."
        />

        {/* 3 Testimonials Grid */}
        {isLoading && testimonials.length === 0 ? (
          <TestimonialsSkeleton count={3} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-[#111726] rounded-2xl p-7 border border-neutral-200/90 dark:border-[#1e293b] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between hover-lift"
            >
              <div>
                
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-5" aria-label={`Rating: ${t.rating} out of 5 stars`}>
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </blockquote>

              </div>

              {/* Client Info Bar */}
              <div className="pt-5 border-t border-neutral-100 dark:border-[#1e293b] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700">
                  <img
                    src={t.avatar}
                    alt={`Portrait photo of ${t.name}`}
                    width={44}
                    height={44}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-950 dark:text-white">
                    {t.name}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.role} · {t.businessType}
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {t.location}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      </div>
    </section>
  );
};
