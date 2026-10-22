export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export interface CompressedFileResult {
  file: File;
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  reduced: boolean;
}

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const isImageExt = /\.(jpe?g|png|webp|gif|svg)$/i.test(fileName);

  if (!ALLOWED_IMAGE_TYPES.includes(fileType) && !isImageExt) {
    return {
      valid: false,
      error: 'Invalid file format. Allowed formats: JPG, PNG, WebP, GIF, SVG.',
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`,
    };
  }

  return { valid: true };
}

export function sanitizeFilename(originalName: string, prefix = ''): string {
  const parts = originalName.split('.');
  const ext = (parts.length > 1 ? parts.pop() : 'webp')?.toLowerCase() || 'webp';
  let name = parts.join('-');

  name = name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'asset';

  const cleanPrefix = prefix ? `${prefix.toLowerCase().replace(/[^a-z0-9]/g, '-')}-` : '';
  const timestamp = Date.now().toString(36);
  return `${cleanPrefix}${name}-${timestamp}.${ext}`;
}

/**
 * Resizes and compresses image via HTML5 Canvas before uploading to save bandwidth and speed up page load.
 * Preserves GIFs and SVGs without rasterization.
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedFileResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1440,
    quality = 0.88,
    mimeType = 'image/webp',
  } = options;

  // Don't compress animated GIFs or vector SVGs via canvas
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    const dataUrl = await fileToDataUrl(file);
    return {
      file,
      dataUrl,
      originalSize: file.size,
      compressedSize: file.size,
      width: 0,
      height: 0,
      reduced: false,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale maintaining aspect ratio if larger than max bounds
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original
          resolve({
            file,
            dataUrl: e.target?.result as string,
            originalSize: file.size,
            compressedSize: file.size,
            width: img.width,
            height: img.height,
            reduced: false,
          });
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = mimeType || 'image/webp';
        const dataUrl = canvas.toDataURL(targetMime, quality);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed blob isn't smaller or conversion failed, keep original file
              resolve({
                file,
                dataUrl: e.target?.result as string,
                originalSize: file.size,
                compressedSize: file.size,
                width: img.width,
                height: img.height,
                reduced: false,
              });
              return;
            }

            const cleanName = file.name.replace(/\.[a-zA-Z0-9]+$/, '.webp');
            const compressedFile = new File([blob], cleanName, { type: targetMime });

            resolve({
              file: compressedFile,
              dataUrl,
              originalSize: file.size,
              compressedSize: blob.size,
              width,
              height,
              reduced: true,
            });
          },
          targetMime,
          quality
        );
      };

      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
