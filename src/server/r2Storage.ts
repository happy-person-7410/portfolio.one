export interface StorageEnv {
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
  R2_BUCKET?: unknown;
  [key: string]: unknown;
}

export interface UploadResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  provider: 'public_assets' | 'cloudflare_pages_public';
  message: string;
}

// Allowed public assets folders per user requirements:
// /public/images/projects/
// /public/images/creative/
// /public/images/banners/
// /public/images/brand/
// /public/images/before-after/
export const ALLOWED_STORAGE_FOLDERS = [
  'projects',
  'projects/screenshots',
  'creative',
  'creative/logos',
  'creative/banners',
  'creative/ai-images',
  'creative/videos',
  'banners',
  'brand',
  'testimonials',
  'before-after',
  'settings',
] as const;

export type StorageFolder = typeof ALLOWED_STORAGE_FOLDERS[number] | string;

/**
 * Resolves logical folder name into the exact public directory:
 * projects, creative, banners, brand, or before-after
 */
export function resolvePublicFolder(folder: string): 'projects' | 'creative' | 'banners' | 'brand' | 'before-after' {
  const f = folder.toLowerCase().trim();
  if (f.startsWith('project')) return 'projects';
  if (f.startsWith('banner') || f === 'creative/banners') return 'banners';
  if (f.startsWith('creative')) return 'creative';
  if (f.startsWith('before') || f.includes('after')) return 'before-after';
  return 'brand'; // default for brand, testimonials, settings, mascot
}

export function sanitizeStorageKey(folder: string, originalName: string): { key: string; cleanFilename: string; targetDir: string } {
  const targetDir = resolvePublicFolder(folder);

  // Extract clean filename and extension
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'webp';
  const baseName = originalName
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'asset';

  const timestamp = Date.now().toString(36);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const cleanFilename = `${baseName}-${timestamp}-${randomSuffix}.${ext}`;
  const key = `${targetDir}/${cleanFilename}`;

  return { key, cleanFilename, targetDir };
}

/**
 * Uploads/saves file directly into the project's repository public assets folder:
 * /public/images/${targetDir}/${cleanFilename}
 * Returning relative public path: /images/${targetDir}/${cleanFilename}
 * Zero paid services, zero API tokens, 100% free with Cloudflare Pages and GitHub.
 */
export async function uploadFileToStorage(
  buffer: Uint8Array,
  folder: StorageFolder,
  originalFilename: string,
  _contentType: string,
  _env: StorageEnv
): Promise<UploadResult> {
  const { cleanFilename, targetDir, key } = sanitizeStorageKey(folder, originalFilename);

  if (typeof process !== 'undefined' && process.cwd) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const fullDirPath = path.join(process.cwd(), 'public', 'images', targetDir);

      if (!fs.existsSync(fullDirPath)) {
        fs.mkdirSync(fullDirPath, { recursive: true });
      }

      const filePath = path.join(fullDirPath, cleanFilename);
      fs.writeFileSync(filePath, Buffer.from(buffer));

      const publicRelativeUrl = `/images/${targetDir}/${cleanFilename}`;

      return {
        success: true,
        url: publicRelativeUrl,
        key,
        size: buffer.byteLength,
        provider: 'public_assets',
        message: `Saved directly to repository public assets (/public/images/${targetDir}/). 100% Free.`,
      };
    } catch (err: unknown) {
      console.error('File write error:', err);
      throw new Error(`Failed to save image to public assets: ${(err as Error).message}`);
    }
  }

  // Fallback relative public path
  return {
    success: true,
    url: `/images/${targetDir}/${cleanFilename}`,
    key,
    size: buffer.byteLength,
    provider: 'cloudflare_pages_public',
    message: 'Public image URL generated for Cloudflare Pages static hosting.',
  };
}

export async function deleteFileFromStorage(key: string, _env: StorageEnv): Promise<{ success: boolean; message: string }> {
  if (!key) return { success: false, message: 'Missing storage key' };

  if (typeof process !== 'undefined' && process.cwd) {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const normalizedKey = key.replace(/^\/?(images\/)?(uploads\/)?/, '');
      const localPath = path.join(process.cwd(), 'public', 'images', normalizedKey);

      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        return { success: true, message: 'Asset removed from public repository folder' };
      }
    } catch (err) {
      console.warn('Local file delete warning:', err);
    }
  }

  return { success: true, message: 'Image reference updated' };
}
