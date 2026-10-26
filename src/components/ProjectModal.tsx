import React, { useEffect, useState } from 'react';
import { 
  X, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp,
  Laptop,
  Image as ImageIcon
} from 'lucide-react';
import { Project } from '../types';
import { InteractiveProjectPreview } from './InteractiveProjectPreview';
import { MessengerIcon } from './icons/MessengerIcon';
import { usePortfolioData } from '../context/PortfolioDataContext';

interface ProjectModalProps {
  project: Project | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  initialTab?: 'overview' | 'interactive' | 'gallery';
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  projects,
  isOpen,
  onClose,
  onSelectProject,
  initialTab = 'overview',
}) => {
  const { profile } = usePortfolioData();
  const [activeTab, setActiveTab] = useState<'overview' | 'interactive' | 'gallery'>(initialTab);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !project) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, project]);

  // Sync tab when initialTab or project changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [project?.id, initialTab]);

  if (!isOpen || !project) return null;

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const handlePrevious = () => {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    onSelectProject(projects[prevIndex]);
  };
  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % projects.length;
    onSelectProject(projects[nextIndex]);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#111726] rounded-2xl shadow-2xl border border-neutral-200 dark:border-[#1e293b] overflow-hidden my-6">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-[#1e293b] bg-neutral-50/90 dark:bg-[#0e1422]/90">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {project.category}
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">·</span>
            <span className="text-xs text-neutral-500 font-mono">
              {currentIndex + 1} of {projects.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer"
              title="Previous project (←)"
              aria-label="Previous project"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer"
              title="Next project (→)"
              aria-label="Next project"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-neutral-300 dark:bg-[#1e293b] mx-1" />
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-lg transition-colors cursor-pointer"
              title="Close modal (ESC)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[80vh] overflow-y-auto">
          
          {/* Hero Media Preview Area */}
          <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden border-b border-neutral-200 dark:border-[#1e293b]">
            {project.previewVideoUrl ? (
              <video
                src={project.previewVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                width={1200}
                height={675}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={project.thumbnail}
                alt={`${project.title} detailed web interface mockup`}
                width={1200}
                height={675}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

            {/* Title overlay on hero */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 id="modal-project-title" className="text-2xl sm:text-3xl font-extrabold text-white">
                  {project.title}
                </h2>
                <p className="text-sm text-neutral-200 mt-1 max-w-xl">
                  {project.description}
                </p>
              </div>

              {/* Action buttons on hero */}
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <span>Live Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={profile.messengerUrl || 'https://m.me/happyperson7410'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#0084FF] to-[#0062E0] hover:from-[#0074E8] hover:to-[#0052C8] text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  <MessengerIcon className="w-3.5 h-3.5 fill-white" />
                  <span>Discuss on Messenger</span>
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 sm:px-8 pt-5 border-b border-neutral-200 dark:border-[#1e293b] flex items-center gap-4 bg-neutral-50/50 dark:bg-[#0e1422]/50">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              Case Study & Details
            </button>
            <button
              onClick={() => setActiveTab('interactive')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'interactive'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Interactive Prototype</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded font-bold">
                Live
              </span>
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wide border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Gallery ({(project.screenshots || []).length})</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 space-y-8">
            {activeTab === 'interactive' ? (
              <div>
                <InteractiveProjectPreview project={project} />
              </div>
            ) : activeTab === 'gallery' ? (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                  High-Resolution Screenshots & Layout Previews
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(project.screenshots || []).map((s, idx) => (
                    <div key={idx} className="rounded-xl overflow-hidden border border-neutral-200 dark:border-[#1e293b] bg-neutral-950 aspect-video">
                      <img
                        src={s}
                        alt={`${project.title} screenshot ${idx + 1}`}
                        width={600}
                        height={338}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Meta details bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-[#131b2e] border border-neutral-200/80 dark:border-[#1e293b] text-xs">
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Client</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{project.client}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Timeline</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{project.duration}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Category</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{project.category}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 dark:text-neutral-500 block mb-0.5">Code Standard</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">TypeScript / WCAG AA</span>
                  </div>
                </div>

                {/* Impact Metrics */}
                {project.impactMetrics && project.impactMetrics.length > 0 && (
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-3 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>Measured Client Results</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {project.impactMetrics.map((m, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-neutral-50 dark:bg-[#131b2e] border border-neutral-200/80 dark:border-[#1e293b] text-center">
                          <div className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tabular-nums">
                            {m.value}
                          </div>
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Problem & Solution (Case Study) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#131b2e] border border-neutral-200/80 dark:border-[#1e293b]">
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white mb-2">
                      The Client Problem
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {project.problem}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                    <h4 className="text-sm font-bold text-neutral-950 dark:text-white mb-2">
                      What I Designed & Engineered
                    </h4>
                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                      {project.solution}
                    </p>
                  </div>
                </div>

                {/* Key Features */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                    Key Features Built
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(project.features || []).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-neutral-50/70 dark:bg-[#131b2e]/60 border border-neutral-200/70 dark:border-[#1e293b] text-xs text-neutral-700 dark:text-neutral-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                    Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-[#131b2e] text-neutral-700 dark:text-neutral-300 text-xs font-mono font-medium border border-neutral-200 dark:border-[#1e293b]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Modal Footer Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-[#1e293b] bg-neutral-50/90 dark:bg-[#0e1422]/90">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-xl transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Project</span>
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#1e293b] rounded-xl transition-colors cursor-pointer"
            >
              <span>Next Project</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              Close
            </button>
            <a
              href={project.liveDemoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <span>Open Full Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
