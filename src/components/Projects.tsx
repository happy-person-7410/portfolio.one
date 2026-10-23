import React, { useState, useEffect } from 'react';
import { ExternalLink, Eye, Laptop } from 'lucide-react';
import { Project, ProjectCategory } from '../types';
import { ProjectModal } from './ProjectModal';
import { SectionHeader } from './ui/SectionHeader';
import { useProjects } from '../hooks';
import { ProjectsSkeleton } from './skeletons';
import { fetchProjectBySlug } from '../services/portfolioService';

export const Projects: React.FC = () => {
  const {
    projects,
    visibleProjects,
    filteredProjects,
    categories,
    selectedCategory,
    setSelectedCategory,
    isLoading,
    error,
    refresh,
  } = useProjects();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'interactive' | 'gallery'>('overview');

  // Clean URL synchronization (/work/project-id)
  useEffect(() => {
    const handleLocationChange = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/work/')) {
        const slug = path.replace('/work/', '').trim();
        const found = visibleProjects.find((p) => p.id === slug);
        if (found) {
          setActiveProject(found);
          setIsModalOpen(true);
          document.title = `${found.title} | Case Study by Happy Person`;
        }

        // Fetch individual project from /api/projects/:slug
        try {
          const detail = await fetchProjectBySlug(slug);
          if (detail) {
            setActiveProject(detail);
            setIsModalOpen(true);
            document.title = `${detail.title} | Case Study by Happy Person`;
          }
        } catch (err) {
          console.warn('Single project fetch note:', err);
        }
      } else if (path === '/' || path === '') {
        if (isModalOpen) {
          setIsModalOpen(false);
          document.title = 'Happy Person | Independent Creative Web & UI Studio';
        }
      }
    };

    // Check on initial load
    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [visibleProjects, isModalOpen]);

  const handleOpenDetails = async (project: Project, tab: 'overview' | 'interactive' | 'gallery' = 'overview') => {
    setActiveProject(project);
    setModalInitialTab(tab);
    setIsModalOpen(true);
    // Push clean URL to browser history
    window.history.pushState({ projectId: project.id }, '', `/work/${project.id}`);
    document.title = `${project.title} | Case Study by Happy Person`;

    // Fetch latest individual project from /api/projects/:slug
    try {
      const detail = await fetchProjectBySlug(project.id);
      if (detail) {
        setActiveProject((prev: Project | null) => (prev?.id === project.id ? { ...prev, ...detail } : prev));
      }
    } catch {}
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    window.history.pushState({}, '', '/');
    document.title = 'Happy Person | Independent Creative Web & UI Studio';
  };

  const handleSelectModalProject = (project: Project) => {
    setActiveProject(project);
    window.history.replaceState({ projectId: project.id }, '', `/work/${project.id}`);
    document.title = `${project.title} | Case Study by Happy Person`;
  };

  return (
    <section id="projects" className="py-20 md:py-28 transition-colors" aria-label="Featured Projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <SectionHeader
          kicker="Featured Portfolio"
          title="Websites & UI Projects I've Built"
          description="Explore 8 production-grade client solutions engineered with Google AI Studio, React, and modern frontend tools. Each project solves a specific business bottleneck with measurable conversion results."
          action={
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Filter by industry or click any card for case study & live simulator</span>
            </div>
          }
        />

        {/* Category Filter Tabs (Segmented bar as per frontend-design rules) */}
        <div 
          className="flex items-center gap-1.5 p-1.5 bg-neutral-100 dark:bg-[#111726] rounded-xl mb-12 overflow-x-auto border border-neutral-200/80 dark:border-[#1e293b] scrollbar-none"
          role="tablist"
          aria-label="Filter projects by category"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-white dark:bg-[#1a233a] text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading && projects.length === 0 && (
          <div className="mb-12">
            <ProjectsSkeleton count={4} />
          </div>
        )}

        {/* Error State with Retry */}
        {error && projects.length === 0 && (
          <div className="p-8 text-center rounded-3xl border border-amber-500/20 bg-amber-500/5 my-8">
            <p className="text-sm text-amber-500 mb-3">{error}</p>
            <button
              onClick={() => refresh()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* 8 Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              tabIndex={0}
              aria-label={`Project: ${project.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenDetails(project);
                }
              }}
              className="group relative bg-white dark:bg-[#111726] rounded-2xl border border-neutral-200/90 dark:border-[#1e293b] overflow-hidden shadow-xs hover:shadow-xl hover:border-neutral-300 dark:hover:border-neutral-700 transition-all duration-300 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              
              {/* Media Thumbnail / Preview Area */}
              <div 
                onClick={() => handleOpenDetails(project)}
                className="relative aspect-video w-full bg-neutral-950 overflow-hidden cursor-pointer"
              >
                {project.previewVideoUrl ? (
                  <video
                    src={project.previewVideoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    width={640}
                    height={360}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <img
                    src={project.thumbnail}
                    alt={`${project.title} screenshot showing web layout`}
                    width={640}
                    height={360}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                )}

                {/* Subtle dark gradient scrim for contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-75 transition-opacity duration-300" />

                {/* Top Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold tracking-wide border border-white/10 shadow-sm">
                    {project.category}
                  </span>
                </div>

                {/* Hover Overlay with "View Case Study & Live Demo" */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <Eye className="w-4 h-4" />
                    <span>View Case Study & Demo</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  
                  {/* Clean unboxed tags with subtle separators */}
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-3">
                    {project.tags.slice(0, 4).map((tag, idx) => (
                      <React.Fragment key={tag}>
                        <span>{tag}</span>
                        {idx < Math.min(project.tags.length, 4) - 1 && (
                          <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => handleOpenDetails(project)}
                    className="text-xl font-bold text-neutral-950 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    {project.title}
                  </h3>

                  {/* One line description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 line-clamp-2">
                    {project.description}
                  </p>

                </div>

                {/* Card Action Buttons (Live Demo & View Details) */}
                <div className="pt-5 border-t border-neutral-100 dark:border-[#1e293b] flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleOpenDetails(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-blue-600 dark:hover:text-blue-400 py-2 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(project, 'interactive')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer shadow-xs active:scale-95 hover:-translate-y-0.5"
                      title="Open interactive prototype live demo"
                    >
                      <Laptop className="w-3.5 h-3.5" />
                      <span>View Live Demo</span>
                    </button>
                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title={`Open ${project.title} external live website`}
                        aria-label={`Open ${project.title} external live website in new tab`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

              </div>

            </article>
          ))}
        </div>

      </div>

      {/* Project Detail Modal with Clean URL synchronization */}
      <ProjectModal
        project={activeProject}
        projects={filteredProjects}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSelectProject={handleSelectModalProject}
        initialTab={modalInitialTab}
      />
    </section>
  );
};
