import React, { useState } from 'react';
import { Sparkles, Check, Plus, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { useAddons } from '../hooks';
import { AddOnsSkeleton } from './skeletons';
import { CONTACT_CONFIG } from '../data/contactConfig';
import { MessengerIcon } from './icons/MessengerIcon';

interface AddOnsProps {
  onSelectAddons?: (selectedAddonNames: string[]) => void;
}

export const AddOns: React.FC<AddOnsProps> = ({ onSelectAddons }) => {
  const { addons, isLoading, error, refresh } = useAddons();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleAddon = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedItems = addons.filter((item) => selectedIds.includes(item.id));

  // Compute total starting price for chosen add-ons
  const parsePrice = (priceStr: string) => {
    const num = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) ? 0 : num;
  };

  const estimatedTotal = selectedItems.reduce((acc, curr) => acc + parsePrice(curr.price), 0);

  const handleInquireSelected = () => {
    if (onSelectAddons && selectedItems.length > 0) {
      onSelectAddons(selectedItems.map((item) => item.name));
    } else {
      window.open(CONTACT_CONFIG.messengerUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="addons" className="py-20 md:py-28 bg-white dark:bg-[#0b0f17] transition-colors" aria-label="Add-On Services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Flexible Project Enhancements"
          title="Add-On Services"
          description="Tailor your package with modular creative, technical, and ongoing maintenance add-ons. All rates are starting prices in Bangladeshi Taka (৳)."
        />

        {/* 7 Add-ons Cards Grid */}
        {isLoading && addons.length === 0 ? (
          <AddOnsSkeleton count={7} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-12">
            {addons.map((addon) => {
            const isSelected = selectedIds.includes(addon.id);

            return (
              <div
                key={addon.id}
                onClick={() => toggleAddon(addon.id)}
                className={`p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-[#131e33] border-blue-500 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-neutral-50 dark:bg-[#111726] border-neutral-200/90 dark:border-[#1e293b] hover:border-blue-400/60 dark:hover:border-blue-500/40 shadow-2xs'
                }`}
                role="checkbox"
                aria-checked={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleAddon(addon.id);
                  }
                }}
              >
                <div>
                  
                  {/* Top Bar: Unit and Price */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {addon.unit || 'starting from'}
                    </span>
                    <span className="text-lg font-extrabold text-neutral-950 dark:text-white font-mono tabular-nums">
                      {addon.price}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {addon.name}
                  </h3>

                  {/* Description */}
                  {addon.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                      {addon.description}
                    </p>
                  )}

                </div>

                {/* Bottom Selection Indicator */}
                <div className="pt-4 border-t border-neutral-200/60 dark:border-[#1e293b] flex items-center justify-between text-xs">
                  <span className={`font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500'}`}>
                    {isSelected ? 'Selected' : 'Click to select'}
                  </span>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400'
                  }`}>
                    {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

        {/* Selected Addons Sticky/Dynamic Summary Strip */}
        <div className="p-6 sm:p-8 rounded-3xl bg-neutral-100/80 dark:bg-[#111726] border border-neutral-200/90 dark:border-[#1e293b] shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-sm font-bold text-neutral-950 dark:text-white">
                Selected Add-Ons ({selectedItems.length})
              </span>
              {selectedItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xl">
              {selectedItems.length > 0 
                ? `Includes: ${selectedItems.map((i) => i.name).join(', ')}`
                : 'Select one or more add-on services above to estimate your customized starting price.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {selectedItems.length > 0 && (
              <div className="text-center sm:text-right">
                <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                  Add-on Starting Total:
                </span>
                <span className="text-2xl font-black font-mono text-neutral-950 dark:text-white">
                  ৳{estimatedTotal.toLocaleString()}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleInquireSelected}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#0084FF] via-[#0072F5] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-md shadow-blue-500/25 transition-all cursor-pointer w-full sm:w-auto active:scale-95"
            >
              <MessengerIcon className="w-4 h-4 fill-white" />
              <span>Inquire on Messenger</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
