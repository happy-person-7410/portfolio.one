import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  HardDrive,
} from 'lucide-react';
import { uploadImageFile } from '../../services/portfolioService';
import { validateImageFile } from '../../utils/imageCompressor';

interface PresetChoice {
  label: string;
  url: string;
}

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label?: string;
  description?: string;
  aspectRatio?: 'video' | 'square' | 'wide' | 'auto';
  recommendedDimensions?: string;
  allowDelete?: boolean;
  presetChoices?: PresetChoice[];
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'projects',
  label = 'Portfolio Image Asset',
  description = 'Stored securely in Firebase Cloud Storage. Public image URL stored in Firestore.',
  aspectRatio = 'wide',
  recommendedDimensions = '1200 × 750px',
  allowDelete = true,
  presetChoices,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    wide: 'aspect-16/10',
    auto: 'min-h-[160px]',
  }[aspectRatio];

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setStatusMessage(null);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      return;
    }

    setUploading(true);
    setProgress(15);

    try {
      const result = await uploadImageFile(file, folder, undefined, (pct) => {
        setProgress(pct);
      });

      onChange(result.url);
      const isInline = result.url.startsWith('data:');
      setStatusMessage(
        isInline
          ? `✓ Asset optimized and stored (${(result.size / 1024).toFixed(0)} KB) — CORS bypass active`
          : `✓ Asset uploaded to Firebase Storage (${(result.size / 1024).toFixed(0)} KB)`
      );
      setTimeout(() => setStatusMessage(null), 4500);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Failed to upload image to Firebase Storage.');
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to remove this image?')) {
      onChange('');
      setStatusMessage('Image reference removed.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
      setStatusMessage('Public image URL applied.');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label and Info */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-semibold text-slate-200">{label}</label>
          <span className="text-[11px] text-slate-400 block">{description}</span>
        </div>
        {recommendedDimensions && (
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
            {recommendedDimensions}
          </span>
        )}
      </div>

      {/* Hidden file input for Option A */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {/* Existing Image Preview Box */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md group">
          <div className={`relative w-full ${aspectClass} bg-slate-950 flex items-center justify-center overflow-hidden`}>
            <img
              src={value}
              alt="Preview"
              width={640}
              height={400}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/brand/happy-person-mascot.webp';
              }}
            />
            {uploading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mb-2" />
                <span className="text-xs font-semibold text-white">Uploading to Firebase Storage...</span>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="p-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-300 truncate max-w-[200px] sm:max-w-xs">
                {value}
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                title="View image"
                className="text-slate-400 hover:text-blue-400 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Select a replacement file from computer"
              >
                <RefreshCw className="w-3 h-3 text-blue-400" />
                <span>Replace</span>
              </button>

              {allowDelete && (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={handleDelete}
                  className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition cursor-pointer"
                  title="Remove image"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty Upload Interface: Option A & Option B */
        <div className="space-y-3">
          {/* Method Selector Tabs */}
          <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Option A: Direct Upload (CORS-Safe)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Option B: Paste Image URL / Free Host</span>
            </button>
          </div>

          {/* Option A: Direct File Upload with CORS-Bypass */}
          {activeTab === 'upload' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`relative rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center py-3">
                  <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mb-3" />
                  <span className="text-xs font-semibold text-slate-200">
                    Optimizing & saving image asset...
                  </span>
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-200">
                    Select or drag image to upload
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                    Auto-compresses to lightweight WebP. Automatically bypasses Cloud Storage CORS blocks if present.
                  </p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✓ CORS auto-fallback enabled
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Option B: Paste Public Image URL & Free External Hosts */}
          {activeTab === 'url' && (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
              <label className="block text-xs font-medium text-slate-300">
                Paste any public image URL (PostImages, ImgBB, Cloudinary, Unsplash, etc.)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://i.postimg.cc/... or /images/..."
                  className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs shrink-0"
                >
                  Apply URL
                </button>
              </div>

              {/* Free image host suggestions */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                <span>Free zero-CORS image uploaders:</span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://postimages.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    PostImages.org <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://imgbb.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline inline-flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ImgBB.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Pickers */}
      {presetChoices && presetChoices.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          {presetChoices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => {
                onChange(choice.url);
                setStatusMessage(`Selected ${choice.label}`);
                setTimeout(() => setStatusMessage(null), 3000);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}

      {/* Success Notification */}
      {statusMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
