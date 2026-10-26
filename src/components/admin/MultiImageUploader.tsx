import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Trash2,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import { uploadImageFile } from '../../services/portfolioService';
import { validateImageFile } from '../../utils/imageCompressor';

export interface ScreenshotItem {
  url: string;
  altText?: string;
}

interface MultiImageUploaderProps {
  screenshots: string[];
  onChange: (screenshots: string[]) => void;
  mainThumbnail?: string;
  onSetMainThumbnail?: (url: string) => void;
  folder?: string;
  label?: string;
}

export const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  screenshots,
  onChange,
  mainThumbnail,
  onSetMainThumbnail,
  folder = 'projects/screenshots',
  label = 'Project Gallery Screenshots',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [altTexts, setAltTexts] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFiles = async (files: FileList | File[]) => {
    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    const uploadedUrls: string[] = [];

    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || `File ${file.name} is invalid.`);
          continue;
        }

        const pct = Math.round(((i + 0.5) / fileArray.length) * 100);
        setUploadProgress(pct);

        const res = await uploadImageFile(file, folder);
        uploadedUrls.push(res.url);
      }

      if (uploadedUrls.length > 0) {
        const combined = [...screenshots, ...uploadedUrls];
        onChange(combined);
        setSuccessMsg(`Uploaded ${uploadedUrls.length} screenshot${uploadedUrls.length > 1 ? 's' : ''} to Firebase Storage.`);
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to upload one or more files.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === screenshots.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...screenshots];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    onChange(reordered);
  };

  const handleRemove = (index: number) => {
    if (window.confirm('Remove this screenshot from the gallery?')) {
      const updated = screenshots.filter((_, i) => i !== index);
      onChange(updated);
    }
  };

  const handleSetMain = (url: string) => {
    if (onSetMainThumbnail) {
      onSetMainThumbnail(url);
      setSuccessMsg('Set as primary project hero thumbnail!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange([...screenshots, urlInput.trim()]);
      setUrlInput('');
      setShowUrlInput(false);
      setSuccessMsg('Added screenshot from URL.');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-semibold text-slate-200">{label}</label>
          <span className="text-[11px] text-slate-400">
            Upload multiple screenshots, reorder with arrows, set hero thumbnail, or add accessibility alt text.
          </span>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Option A: Select image files to upload to Firebase Storage"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload to Firebase Storage</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Option B: Paste a public image URL"
          >
            <span>{showUrlInput ? 'Close URL' : '+ Paste URL'}</span>
          </button>
        </div>
      </div>

      {/* Option B: Collapsible URL Input */}
      {showUrlInput && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste public image URL (e.g. /images/... or https://...)"
            className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Add Screenshot
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleUploadFiles(e.target.files);
          }
        }}
      />

      {/* Upload Progress */}
      {uploading && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Uploading to Firebase Cloud Storage...</span>
              <span className="font-mono">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-150"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Screenshot List / Cards */}
      {screenshots.length === 0 ? (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="p-6 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-900/40 text-center cursor-pointer transition"
        >
          <ImageIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-300">No screenshots added yet</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Click here to select and upload multiple images from your computer
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {screenshots.map((url, idx) => {
            const isMain = mainThumbnail === url || (idx === 0 && !mainThumbnail);

            return (
              <div
                key={`${url}-${idx}`}
                className={`p-3 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isMain
                    ? 'bg-blue-950/20 border-blue-500/40 ring-1 ring-blue-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-750'
                }`}
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-16 h-12 rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-700/60">
                    <img
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/brand/happy-person-mascot.webp';
                      }}
                    />
                    {isMain && (
                      <div className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-amber-500 text-slate-950">
                        <Star className="w-2.5 h-2.5 fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-200">
                        Screenshot #{idx + 1}
                      </span>
                      {isMain ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" /> Main Thumbnail
                        </span>
                      ) : (
                        onSetMainThumbnail && (
                          <button
                            type="button"
                            onClick={() => handleSetMain(url)}
                            className="text-[10px] text-slate-400 hover:text-amber-400 transition cursor-pointer flex items-center gap-1"
                          >
                            <Star className="w-3 h-3" /> Make Main
                          </button>
                        )
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400 font-mono truncate">
                      <span className="truncate">{url}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        title="View image"
                        className="text-slate-400 hover:text-blue-400 shrink-0"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Alt Text Input (for SEO & Accessibility) */}
                <div className="w-full sm:w-48 shrink-0">
                  <input
                    type="text"
                    value={altTexts[idx] ?? ''}
                    onChange={(e) =>
                      setAltTexts((prev) => ({ ...prev, [idx]: e.target.value }))
                    }
                    placeholder="Alt text description..."
                    className="w-full px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Reorder and Delete Controls */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                    title="Move earlier"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === screenshots.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                    title="Move later"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                    title="Remove from project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
