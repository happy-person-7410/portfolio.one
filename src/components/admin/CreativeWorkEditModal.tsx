import React, { useState } from 'react';
import {
  X,
  Save,
  AlertCircle,
  Video,
  Palette,
  Layout,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  UploadCloud,
  ExternalLink,
} from 'lucide-react';
import { CreativeItem, CreativeCategory } from '../../data/creativeData';
import { saveCreativeWork, uploadImageFile } from '../../services/portfolioService';
import { ImageUploader } from './ImageUploader';

interface CreativeWorkEditModalProps {
  item?: CreativeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  totalItems: number;
}

const CATEGORY_FOLDERS: Record<CreativeCategory, string> = {
  'Logos & Branding': 'creative/logos',
  'Banners & Social Media': 'creative/banners',
  'AI Images': 'creative/ai-images',
  'AI Videos': 'creative/videos',
};

export const CreativeWorkEditModal: React.FC<CreativeWorkEditModalProps> = ({
  item,
  isOpen,
  onClose,
  onSaved,
  totalItems,
}) => {
  const isEditing = Boolean(item);

  const [id] = useState(item?.id || `creative-${Date.now().toString(36)}`);
  const [title, setTitle] = useState(item?.title || '');
  const [category, setCategory] = useState<CreativeCategory>(item?.category || 'Logos & Branding');
  const [shortDescription, setShortDescription] = useState(item?.shortDescription || '');
  const [thumbnail, setThumbnail] = useState(item?.thumbnail || '');
  const [fullImage, setFullImage] = useState(item?.fullImage || '');
  
  // Video fields
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'direct'>(
    item?.youtubeUrl || item?.youtubeId ? 'youtube' : 'direct'
  );
  const [youtubeUrl, setYoutubeUrl] = useState(item?.youtubeUrl || (item?.youtubeId ? `https://www.youtube.com/watch?v=${item.youtubeId}` : ''));
  const [directVideoUrl, setDirectVideoUrl] = useState(
    !item?.youtubeUrl && !item?.youtubeId ? (item as unknown as { videoUrl?: string })?.videoUrl || '' : ''
  );
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoWarning, setVideoWarning] = useState<string | null>(null);

  const [toolsInput, setToolsInput] = useState(
    item?.toolsUsed?.join(', ') || 'Midjourney, Runway Gen-3, Adobe Illustrator'
  );
  const [deliverablesInput, setDeliverablesInput] = useState(
    item?.deliverables?.join('\n') || 'High-resolution vector assets\nFull brand guideline PDF\nWeb-ready social banners'
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Extract YouTube ID from URL if applicable
  const extractYoutubeId = (url: string): string | undefined => {
    if (!url) return undefined;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : undefined;
  };

  const handleDirectVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoWarning(null);
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Please select a valid MP4 or WebM video file.');
      return;
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 25) {
      setError(`Video is ${sizeMb.toFixed(1)}MB. Max limit for admin video uploads is 25MB. For longer 4K videos, please host on YouTube or Cloudflare Stream and paste the link.`);
      return;
    }

    if (sizeMb > 10) {
      setVideoWarning(`Uploading a ${sizeMb.toFixed(1)}MB video file. Please keep short clips under 10MB for fastest mobile loading.`);
    }

    setUploadingVideo(true);
    try {
      const res = await uploadImageFile(file, 'creative/videos');
      setDirectVideoUrl(res.url);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to upload video.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !shortDescription.trim() || !thumbnail.trim()) {
      setError('Please fill in Title, Description, and Thumbnail image.');
      return;
    }

    const toolsUsed = toolsInput.split(',').map((t) => t.trim()).filter(Boolean);
    const deliverables = deliverablesInput.split('\n').map((d) => d.trim()).filter(Boolean);

    const isVideo = category === 'AI Videos';
    let finalYoutubeId: string | undefined = undefined;
    let finalYoutubeUrl: string | undefined = undefined;
    let finalVideoUrl: string | undefined = undefined;

    if (isVideo) {
      if (videoSourceType === 'youtube') {
        finalYoutubeUrl = youtubeUrl.trim() || undefined;
        finalYoutubeId = extractYoutubeId(youtubeUrl.trim());
      } else {
        finalVideoUrl = directVideoUrl.trim() || undefined;
      }
    }

    const payload: CreativeItem & { videoUrl?: string } = {
      id,
      title: title.trim(),
      category,
      shortDescription: shortDescription.trim(),
      thumbnail: thumbnail.trim(),
      fullImage: fullImage.trim() || thumbnail.trim(),
      toolsUsed: toolsUsed.length ? toolsUsed : ['Creative Design'],
      deliverables: deliverables.length ? deliverables : ['High-res deliverable'],
      youtubeId: finalYoutubeId,
      youtubeUrl: finalYoutubeUrl,
      videoUrl: finalVideoUrl,
    };

    setSaving(true);
    try {
      await saveCreativeWork(payload as CreativeItem);
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save creative work.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {isEditing ? `Edit Creative Work: ${item?.title}` : 'Add New Creative & AI Asset'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Syncs to public gallery and Neon PostgreSQL database
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Category Chooser */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Creative Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Logos & Branding', 'Banners & Social Media', 'AI Images', 'AI Videos'] as CreativeCategory[]).map(
                (cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/30'
                          : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'Logos & Branding' && <Palette className="w-4 h-4" />}
                      {cat === 'Banners & Social Media' && <Layout className="w-4 h-4" />}
                      {cat === 'AI Images' && <ImageIcon className="w-4 h-4" />}
                      {cat === 'AI Videos' && <Video className="w-4 h-4" />}
                      <span>{cat}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Project / Artwork Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Apex Medical Monogram Brand Identity"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Short Description *</label>
            <textarea
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Describe the aesthetic, purpose, design choices, or AI prompt engineering..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Video Section (if AI Videos selected) */}
          {category === 'AI Videos' && (
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-blue-400" /> Video Delivery Method
                </span>
                <div className="inline-flex p-1 bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('youtube')}
                    className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      videoSourceType === 'youtube'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    YouTube Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('direct')}
                    className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                      videoSourceType === 'direct'
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Direct Video (MP4)
                  </button>
                </div>
              </div>

              {videoSourceType === 'youtube' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    YouTube Video URL (embeds automatically)
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    YouTube links will render as responsive embed players on the public site.
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Direct Video File URL (HTML5 player with poster)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={directVideoUrl}
                      onChange={(e) => setDirectVideoUrl(e.target.value)}
                      placeholder="/images/creative/videos/sample.mp4 or https://..."
                      className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5 shrink-0">
                      <UploadCloud className="w-4 h-4 text-blue-400" />
                      <span>{uploadingVideo ? 'Uploading...' : 'Browse MP4'}</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleDirectVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {videoWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{videoWarning}</span>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-400 block">
                    Max size 25MB. Plays inside an HTML5 video element with custom controls and poster frame.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Thumbnail Image Uploader */}
          <ImageUploader
            value={thumbnail}
            onChange={(url) => {
              setThumbnail(url);
              if (!fullImage) setFullImage(url);
            }}
            folder={CATEGORY_FOLDERS[category]}
            label={category === 'AI Videos' ? 'Video Poster / Card Thumbnail Image *' : 'Card Thumbnail Image *'}
            description="Stored in Cloudflare R2 bucket with automatic WebP compression."
            aspectRatio="wide"
            recommendedDimensions="800 × 500px"
          />

          {/* Full Resolution Image (for non-videos) */}
          {category !== 'AI Videos' && (
            <ImageUploader
              value={fullImage}
              onChange={setFullImage}
              folder={CATEGORY_FOLDERS[category]}
              label="Full Resolution Preview Image (Optional)"
              description="High-definition modal view when clients click 'View Full Preview'."
              aspectRatio="auto"
              recommendedDimensions="Up to 1920 × 1440px"
            />
          )}

          {/* Tools & Deliverables */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tools Used (comma separated)</label>
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                placeholder="Figma, Illustrator, Midjourney, Kling AI"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Deliverables (one per line)</label>
              <textarea
                rows={2}
                value={deliverablesInput}
                onChange={(e) => setDeliverablesInput(e.target.value)}
                placeholder="Vector SVG exports&#10;Dark / Light mode badges"
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Creative Work
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
