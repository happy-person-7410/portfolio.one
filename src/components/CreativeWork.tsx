import React, { useState, useMemo } from 'react';
import { Sparkles, Play, ExternalLink, X, Eye, Video, Palette, Image as ImageIcon, Layout, CheckCircle2 } from 'lucide-react';
import { SectionHeader } from './ui/SectionHeader';
import { CREATIVE_ITEMS, CreativeCategory, CreativeItem } from '../data/creativeData';
import { CONTACT_CONFIG } from '../data/contactConfig';
import { MessengerIcon } from './icons/MessengerIcon';
import { usePortfolioData } from '../context/PortfolioDataContext';

export const CreativeWork: React.FC = () => {
  const { creativeWorks, isLoading } = usePortfolioData();
  const [selectedTab, setSelectedTab] = useState<CreativeCategory | 'All'>('Logos & Branding');
  const [previewItem, setPreviewItem] = useState<CreativeItem | null>(null);

  const tabs: Array<{ id: CreativeCategory | 'All'; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'Logos & Branding', label: 'Logos & Branding', icon: Palette },
    { id: 'Banners & Social Media', label: 'Banners & Social Media', icon: Layout },
    { id: 'AI Images', label: 'AI Images', icon: ImageIcon },
    { id: 'AI Videos', label: 'AI Videos', icon: Video },
  ];

  const itemsToDisplay = creativeWorks && creativeWorks.length > 0 ? creativeWorks : CREATIVE_ITEMS;

  const filteredItems = useMemo(() => {
    if (selectedTab === 'All') return itemsToDisplay;
    return itemsToDisplay.filter((item) => item.category === selectedTab);
  }, [selectedTab, itemsToDisplay]);

  return (
    <section id="creative" className="py-20 md:py-28 bg-white dark:bg-[#0b0f17] transition-colors" aria-label="Creative and AI Work Gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Visual Design & AI Media Studio"
          title="Creative & AI Work"
          description="Beyond responsive web development, Happy Person crafts high-impact vector branding, social media campaign graphics, photorealistic AI product visuals, and cinematic motion reels."
        />

        {/* Tab Selector (Segmented controls) */}
        <div className="flex items-center justify-start sm:justify-center mb-10 overflow-x-auto pb-2 scrollbar-none">
          <div className="inline-flex p-1.5 bg-neutral-100 dark:bg-[#111726] rounded-2xl border border-neutral-200/80 dark:border-[#1e293b] shadow-2xs gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-bold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                  aria-pressed={isActive}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const isVideo = item.category === 'AI Videos';

            return (
              <article
                key={item.id}
                className="group rounded-3xl bg-neutral-50 dark:bg-[#111726] border border-neutral-200/90 dark:border-[#1e293b] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div>
                  
                  {/* Media Container: Responsive YouTube Player for Videos, HTML5 Video for direct R2 videos, or Image */}
                  {isVideo && item.youtubeId ? (
                    <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden border-b border-neutral-200/80 dark:border-[#1e293b]">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?rel=0&modestbranding=1`}
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  ) : isVideo && (item.videoUrl || item.youtubeUrl) ? (
                    <div className="relative w-full aspect-video bg-neutral-950 overflow-hidden border-b border-neutral-200/80 dark:border-[#1e293b]">
                      <video
                        controls
                        playsInline
                        poster={item.thumbnail}
                        className="w-full h-full object-cover"
                      >
                        <source src={item.videoUrl || item.youtubeUrl} type="video/mp4" />
                        Your browser does not support HTML5 video.
                      </video>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setPreviewItem(item)}
                      className="relative w-full aspect-16/10 bg-neutral-200 dark:bg-neutral-800 overflow-hidden cursor-pointer group/img"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        width={640}
                        height={400}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                      
                      {/* Overlay On Hover */}
                      <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/95 dark:bg-[#171f33]/95 text-xs font-bold text-neutral-900 dark:text-white shadow-lg backdrop-blur-md transform translate-y-1 group-hover/img:translate-y-0 transition-transform">
                          <Eye className="w-3.5 h-3.5 text-blue-500" />
                          <span>View Full Preview</span>
                        </span>
                      </div>

                      {/* Category Tag on Image */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide border border-white/10">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Content Body */}
                  <div className="p-6">
                    
                    {/* Tool Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {item.toolsUsed.map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-[#171f33] text-neutral-700 dark:text-neutral-300 font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-2 leading-snug">
                      {item.title}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">
                      {item.shortDescription}
                    </p>

                    {/* Deliverables Mini List */}
                    {item.deliverables && (
                      <div className="pt-3 border-t border-neutral-200/60 dark:border-[#1e293b] space-y-1.5 mb-4">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">
                          Included Deliverables:
                        </span>
                        {item.deliverables.slice(0, 2).map((deliv, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-neutral-700 dark:text-neutral-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span className="truncate">{deliv}</span>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>

                </div>

                {/* Footer Action Area */}
                <div className="p-6 pt-0">
                  {isVideo ? (
                    <div className="flex items-center gap-2">
                      {item.youtubeUrl || item.youtubeId ? (
                        <a
                          href={item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
                          title="Watch full video on YouTube"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Watch on YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-75" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewItem(item)}
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Watch Full Screen Reel</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-neutral-200/70 hover:bg-neutral-200 dark:bg-[#171f33] dark:hover:bg-[#1e293b] text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-500" />
                        <span>View Full Screen</span>
                      </button>
                    </div>
                  )}
                </div>

              </article>
            );
          })}
        </div>

      </div>

      {/* Full-size Image/Video Preview Modal */}
      {previewItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#111726] rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-200/80 dark:border-[#1e293b]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
                  {previewItem.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                  {previewItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close preview modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image/Video Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-950 flex items-center justify-center min-h-[300px]">
              {previewItem.category === 'AI Videos' && previewItem.videoUrl ? (
                <video
                  controls
                  autoPlay
                  poster={previewItem.thumbnail}
                  className="max-h-[60vh] max-w-full rounded-xl shadow-lg"
                >
                  <source src={previewItem.videoUrl} type="video/mp4" />
                  Your browser does not support HTML5 video.
                </video>
              ) : previewItem.category === 'AI Videos' && previewItem.youtubeId ? (
                <div className="w-full aspect-video max-h-[60vh] rounded-xl overflow-hidden shadow-lg">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${previewItem.youtubeId}?autoplay=1&rel=0`}
                    title={previewItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <img
                  src={previewItem.fullImage || previewItem.thumbnail}
                  alt={previewItem.title}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-neutral-200/80 dark:border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50 dark:bg-[#0e1422]">
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-lg text-center sm:text-left">
                {previewItem.shortDescription}
              </p>
              <a
                href={CONTACT_CONFIG.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#0084FF] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                <MessengerIcon className="w-4 h-4 fill-white" />
                <span>Request Similar Design</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
