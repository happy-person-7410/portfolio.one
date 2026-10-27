import React, { useState } from 'react';
import { X, Save, AlertCircle, Sparkles, Image, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import { Project, ProjectCategory } from '../../types';
import { saveProject } from '../../services/portfolioService';
import { ImageUploader } from './ImageUploader';
import { MultiImageUploader } from './MultiImageUploader';

interface ProjectEditModalProps {
  project?: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  totalProjects: number;
}

const PRESET_MOCKUPS = [
  { label: 'Dental Clinic Hero', url: '/images/projects/dental-clinic-hero.webp' },
  { label: 'Restaurant Hero', url: '/images/projects/restaurant-hero.webp' },
  { label: 'Real Estate Hero', url: '/images/projects/real-estate-hero.webp' },
  { label: 'SaaS Dashboard Hero', url: '/images/projects/saas-dashboard-hero.webp' },
  { label: 'Panoramic Studio Banner', url: '/images/banners/happy-person-banner.webp' },
  { label: 'Mascot Brand Badge', url: '/images/brand/happy-person-mascot.webp' },
];

export const ProjectEditModal: React.FC<ProjectEditModalProps> = ({
  project,
  isOpen,
  onClose,
  onSaved,
  totalProjects
}) => {
  const isEditing = Boolean(project);

  const [id, setId] = useState(project?.id || `proj-${Date.now().toString(36)}`);
  const [title, setTitle] = useState(project?.title || '');
  const [category, setCategory] = useState<Exclude<ProjectCategory, 'All'>>(project?.category || 'Business Website');
  const [description, setDescription] = useState(project?.description || '');
  const [client, setClient] = useState(project?.client || '');
  const [duration, setDuration] = useState(project?.duration || '2 Weeks');
  const [thumbnail, setThumbnail] = useState(project?.thumbnail || PRESET_MOCKUPS[0].url);
  const [screenshots, setScreenshots] = useState<string[]>(
    project?.screenshots && project.screenshots.length > 0
      ? project.screenshots
      : project?.thumbnail
      ? [project.thumbnail]
      : [PRESET_MOCKUPS[0].url]
  );
  const [previewVideoUrl, setPreviewVideoUrl] = useState(project?.previewVideoUrl || '');
  const [liveDemoUrl, setLiveDemoUrl] = useState(project?.liveDemoUrl || '');
  const [problem, setProblem] = useState(project?.problem || '');
  const [solution, setSolution] = useState(project?.solution || '');
  const [tagsInput, setTagsInput] = useState(project?.tags?.join(', ') || 'React, TypeScript, Tailwind CSS');
  const [featuresInput, setFeaturesInput] = useState(project?.features?.join('\n') || 'Fast, responsive interface\nAccessible WCAG AA\nSEO optimized');
  const [featured, setFeatured] = useState<boolean>(project?.featured ?? false);
  const [hidden, setHidden] = useState<boolean>(project?.hidden ?? false);
  const [order, setOrder] = useState<number>(project?.order ?? (totalProjects + 1));

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !thumbnail.trim() || !liveDemoUrl.trim()) {
      setError('Please fill in all required fields (Title, Description, Thumbnail, Live Demo).');
      return;
    }

    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const features = featuresInput.split('\n').map((f) => f.trim()).filter(Boolean);

    const updatedDoc: Project = {
      id: id.trim() || `proj-${Date.now()}`,
      title: title.trim(),
      category,
      description: description.trim(),
      client: client.trim() || 'Client Showcase',
      duration: duration.trim() || '2 Weeks',
      thumbnail: thumbnail.trim(),
      previewVideoUrl: previewVideoUrl.trim() || '',
      liveDemoUrl: liveDemoUrl.trim(),
      problem: problem.trim() || 'Legacy interface lacked conversion and mobile responsiveness.',
      solution: solution.trim() || 'Designed and developed a fast, modern digital experience.',
      tags: tags.length ? tags : ['React', 'TypeScript', 'Tailwind CSS'],
      features: features.length ? features : ['Responsive UI', 'Modern Architecture'],
      screenshots: screenshots.length ? screenshots : [thumbnail.trim()],
      featured,
      hidden,
      order: Number(order) || 1,
      impactMetrics: project?.impactMetrics || [{ label: 'Conversions', value: '+45%' }]
    };

    setSaving(true);
    try {
      await saveProject(updatedDoc);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isEditing ? `Edit Project: ${project?.title}` : 'Add New Portfolio Project'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live updates will instantly sync to the public showcase
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-800/40 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded bg-slate-800 border-slate-700 focus:ring-blue-500"
                />
                <span className={featured ? 'text-blue-400 font-semibold' : 'text-slate-300'}>
                  ⭐ Featured Project
                </span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded bg-slate-800 border-slate-700 focus:ring-amber-500"
                />
                <span className={hidden ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                  👁️ Hidden from Public
                </span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Display Order:</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-16 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-center"
              />
            </div>
          </div>

          {/* Section 1: Core Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Project ID (Slug) *</label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. brightsmile-dental"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<ProjectCategory, 'All'>)}
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Business Website">Business Website</option>
                <option value="Booking Website">Booking Website</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Real Estate">Real Estate</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Dashboard UI">Dashboard UI</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. BrightSmile Dental Clinic"
              className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Short Result-Oriented Description *</label>
            <textarea
              required
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Modern dental clinic website with automated appointment booking, treatment showcase, and patient portal."
              className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Client Name</label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="e.g. BrightSmile Dental Practice"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Project Timeline</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 2 Weeks"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 2: Links & Media */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" /> Links & Media Assets
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Live Demo Link *</label>
              <input
                type="url"
                required
                value={liveDemoUrl}
                onChange={(e) => setLiveDemoUrl(e.target.value)}
                placeholder="https://example.com/demo"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Direct Thumbnail Uploader */}
            <ImageUploader
              value={thumbnail}
              onChange={(url) => {
                setThumbnail(url);
                if (url && !screenshots.includes(url)) {
                  setScreenshots([url, ...screenshots]);
                }
              }}
              folder="projects"
              label="Primary Thumbnail / Hero Image *"
              description="Upload directly from computer to repository /public/images/projects/. Automatic WebP compression."
              aspectRatio="wide"
              recommendedDimensions="1200 × 750px"
              presetChoices={PRESET_MOCKUPS}
            />

            {/* Gallery Multi-Screenshot Uploader */}
            <div className="pt-2">
              <MultiImageUploader
                screenshots={screenshots}
                onChange={setScreenshots}
                mainThumbnail={thumbnail}
                onSetMainThumbnail={setThumbnail}
                folder="projects/screenshots"
                label="Project Screenshots Gallery"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Preview Video URL (Optional muted MP4)</label>
              <input
                type="url"
                value={previewVideoUrl}
                onChange={(e) => setPreviewVideoUrl(e.target.value)}
                placeholder="https://example.com/preview.mp4"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 3: Case Study Details */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Case Study Breakdown
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Problem Statement</label>
              <textarea
                rows={2}
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                placeholder="Explain the client pain point, legacy website issues, or bounce rates..."
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Solution & Architecture</label>
              <textarea
                rows={2}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe how Google AI Studio, React, and UX patterns resolved the problem..."
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Key Deliverable Features (one per line)</label>
              <textarea
                rows={3}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="Real-time calendar slot reservation&#10;Interactive procedure guides&#10;Mobile-first patient intake form"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tech Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, TypeScript, Tailwind CSS, UI/UX"
                className="w-full px-3.5 py-2.5 bg-slate-800/70 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium rounded-xl text-sm transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 transition text-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save to Database
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
