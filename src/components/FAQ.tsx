import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { useFaqs } from '../hooks';
import { FaqSkeleton } from './skeletons';

export const FAQ: React.FC = () => {
  const { faqs, openIndex, toggleAccordion, isLoading } = useFaqs(0);

  return (
    <section id="faq" className="py-20 md:py-28 transition-colors" aria-label="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeader
          kicker="Got Questions?"
          title="Frequently Asked Questions"
          description="Everything you need to know about working with me, timelines, pricing, and project handover."
          align="center"
        />

        {/* Accordion List */}
        {isLoading && faqs.length === 0 ? (
          <FaqSkeleton count={5} />
        ) : (
          <div className="space-y-4">
            {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-[#111726] rounded-2xl border border-neutral-200/90 dark:border-[#1e293b] overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-neutral-950 dark:text-white">
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-lg bg-neutral-100 dark:bg-[#171f33] flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-blue-50 dark:bg-blue-950 text-blue-600' : 'text-neutral-500'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-[#1e293b]">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

        {/* Extra help box */}
        <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-[#111726] border border-neutral-200/80 dark:border-[#1e293b] text-center shadow-2xs">
          <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">
            Have a question that isn't answered here?
          </p>
          <a
            href="#contact"
            className="inline-block mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Send me a direct message below →
          </a>
        </div>

      </div>
    </section>
  );
};
