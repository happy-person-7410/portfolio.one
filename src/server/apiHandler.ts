import bcrypt from 'bcryptjs';
import { getNeonClient } from '../db/neonClient';
import { runMigrationsAndSeed } from '../db/migrate';
import { signAdminToken, verifyAdminToken, extractToken } from './auth';
import { PROJECTS as DEFAULT_PROJECTS, SERVICES as DEFAULT_SERVICES, TESTIMONIALS as DEFAULT_TESTIMONIALS, FAQ_ITEMS as DEFAULT_FAQS, PROFILE_INFO as DEFAULT_PROFILE } from '../data/portfolioData';
import { CREATIVE_ITEMS as DEFAULT_CREATIVE } from '../data/creativeData';
import { PRICING_PLANS as DEFAULT_PRICING, ADDON_SERVICES as DEFAULT_ADDONS } from '../data/pricingData';

import { uploadFileToStorage, deleteFileFromStorage, ALLOWED_STORAGE_FOLDERS, StorageEnv } from './r2Storage';

export interface ApiEnv extends StorageEnv {
  DATABASE_URL?: string;
  ADMIN_JWT_SECRET?: string;
  ADMIN_DEFAULT_EMAIL?: string;
  ADMIN_DEFAULT_PASSWORD?: string;
}

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message, success: false }, status);
}

export async function handleApiRequest(request: Request, env: ApiEnv): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, ''); // strip trailing slash
  const method = request.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const dbUrl = env.DATABASE_URL || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : undefined);
  const jwtSecret = env.ADMIN_JWT_SECRET || (typeof process !== 'undefined' ? process.env?.ADMIN_JWT_SECRET : undefined);

  // Helper for admin auth check
  async function requireAdmin(): Promise<Response | null> {
    const token = extractToken(request);
    if (!token) {
      return errorResponse('Authentication required. Missing token.', 401);
    }
    const admin = await verifyAdminToken(token, jwtSecret);
    if (!admin) {
      return errorResponse('Invalid or expired admin session token.', 401);
    }
    return null;
  }

  // -------------------------------------------------------------
  // PUBLIC GET ENDPOINTS
  // -------------------------------------------------------------

  // 1. Health check & DB status
  if (pathname === '/api/health' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse({
        status: 'warning',
        databaseConnected: false,
        message: 'DATABASE_URL is not set. Portfolio running in resilient static fallback mode.',
      });
    }
    try {
      const sql = getNeonClient(dbUrl);
      const res = await sql`SELECT 1 as connected;`;
      return jsonResponse({
        status: 'healthy',
        databaseConnected: true,
        neon: res.length > 0,
      });
    } catch (err: unknown) {
      return jsonResponse({
        status: 'error',
        databaseConnected: false,
        error: (err as Error).message,
      }, 500);
    }
  }

  // 2. Site settings
  if (pathname === '/api/site-settings' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse({
        availabilityStatus: DEFAULT_PROFILE.availability,
        availabilityMessage: 'Accepting new client projects for this quarter',
        heroHeadline: DEFAULT_PROFILE.headline,
        heroSubheadline: DEFAULT_PROFILE.subheading,
        aboutText: DEFAULT_PROFILE.bio,
        ogImageUrl: DEFAULT_PROFILE.ogBanner || '/images/banners/og-preview.webp',
        email: DEFAULT_PROFILE.email,
        whatsappNumber: DEFAULT_PROFILE.whatsappNumber,
        messengerLink: DEFAULT_PROFILE.messengerUrl,
        source: 'default',
      });
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`SELECT * FROM site_settings WHERE id = 'default' LIMIT 1;`;
      if (rows.length > 0) {
        const s = rows[0];
        return jsonResponse({
          availabilityStatus: s.availability_status,
          availabilityMessage: s.availability_message,
          heroHeadline: s.hero_headline,
          heroSubheadline: s.hero_subheadline,
          aboutText: s.about_text,
          ogImageUrl: s.og_image_url,
          footerText: s.footer_text,
          email: s.email,
          whatsappNumber: s.whatsapp_number,
          messengerLink: s.messenger_link,
          source: 'database',
        });
      }
      return jsonResponse({
        availabilityStatus: DEFAULT_PROFILE.availability,
        heroHeadline: DEFAULT_PROFILE.headline,
        heroSubheadline: DEFAULT_PROFILE.subheading,
        aboutText: DEFAULT_PROFILE.bio,
        ogImageUrl: DEFAULT_PROFILE.ogBanner,
        email: DEFAULT_PROFILE.email,
        whatsappNumber: DEFAULT_PROFILE.whatsappNumber,
        messengerLink: DEFAULT_PROFILE.messengerUrl,
        source: 'default',
      });
    } catch {
      return jsonResponse({
        availabilityStatus: DEFAULT_PROFILE.availability,
        heroHeadline: DEFAULT_PROFILE.headline,
        heroSubheadline: DEFAULT_PROFILE.subheading,
        aboutText: DEFAULT_PROFILE.bio,
        source: 'fallback',
      });
    }
  }

  // 3. Projects list
  if (pathname === '/api/projects' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_PROJECTS);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const projects = await sql`
        SELECT * FROM projects 
        WHERE is_published = true 
        ORDER BY display_order ASC, created_at DESC;
      `;
      if (projects.length === 0) {
        return jsonResponse(DEFAULT_PROJECTS);
      }

      // Fetch features and images in parallel
      const features = await sql`SELECT * FROM project_features ORDER BY display_order ASC;`;
      const images = await sql`SELECT * FROM project_images ORDER BY display_order ASC;`;

      const mapped = projects.map((p) => {
        const pFeatures = features.filter((f) => f.project_id === p.id).map((f) => f.feature_text);
        const pImages = images.filter((img) => img.project_id === p.id).map((img) => img.image_url);

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          description: p.short_description || p.long_description,
          tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? JSON.parse(p.tags) : []),
          thumbnail: p.thumbnail_url,
          previewVideoUrl: p.preview_video_url || '',
          liveDemoUrl: p.live_demo_url || '',
          githubUrl: p.github_url || '',
          client: p.client || '',
          duration: p.duration || '',
          problem: p.problem || '',
          solution: p.solution || '',
          features: pFeatures.length > 0 ? pFeatures : [],
          impactMetrics: Array.isArray(p.impact_metrics) ? p.impact_metrics : [],
          screenshots: pImages.length > 0 ? pImages : [p.thumbnail_url],
          featured: p.is_featured,
          hidden: !p.is_published,
          order: p.display_order,
        };
      });

      return jsonResponse(mapped);
    } catch {
      return jsonResponse(DEFAULT_PROJECTS);
    }
  }

  // 4. Single project by slug or ID
  if (pathname.startsWith('/api/projects/') && method === 'GET') {
    const slug = pathname.replace('/api/projects/', '');
    if (!dbUrl) {
      const found = DEFAULT_PROJECTS.find((p) => p.id === slug);
      return found ? jsonResponse(found) : errorResponse('Project not found', 404);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`SELECT * FROM projects WHERE slug = ${slug} OR id = ${slug} LIMIT 1;`;
      if (rows.length === 0) {
        const found = DEFAULT_PROJECTS.find((p) => p.id === slug);
        return found ? jsonResponse(found) : errorResponse('Project not found', 404);
      }
      const p = rows[0];
      const features = await sql`SELECT feature_text FROM project_features WHERE project_id = ${p.id} ORDER BY display_order ASC;`;
      const images = await sql`SELECT image_url FROM project_images WHERE project_id = ${p.id} ORDER BY display_order ASC;`;

      return jsonResponse({
        id: p.id,
        title: p.title,
        slug: p.slug,
        category: p.category,
        description: p.short_description || p.long_description,
        tags: Array.isArray(p.tags) ? p.tags : [],
        thumbnail: p.thumbnail_url,
        previewVideoUrl: p.preview_video_url || '',
        liveDemoUrl: p.live_demo_url || '',
        client: p.client || '',
        duration: p.duration || '',
        problem: p.problem || '',
        solution: p.solution || '',
        features: features.map((f) => f.feature_text),
        impactMetrics: Array.isArray(p.impact_metrics) ? p.impact_metrics : [],
        screenshots: images.map((i) => i.image_url),
        featured: p.is_featured,
        hidden: !p.is_published,
      });
    } catch {
      const found = DEFAULT_PROJECTS.find((p) => p.id === slug);
      return found ? jsonResponse(found) : errorResponse('Project not found', 404);
    }
  }

  // 5. Creative works
  if (pathname === '/api/creative-works' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_CREATIVE);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`
        SELECT * FROM creative_works 
        WHERE is_published = true 
        ORDER BY display_order ASC, created_at DESC;
      `;
      if (rows.length === 0) {
        return jsonResponse(DEFAULT_CREATIVE);
      }
      const mapped = rows.map((c) => ({
        id: c.id,
        title: c.title,
        category: c.category,
        shortDescription: c.description,
        thumbnail: c.thumbnail_url,
        fullImage: c.full_image_url || c.thumbnail_url,
        youtubeUrl: c.video_url || c.external_url || '',
        youtubeId: c.youtube_id || '',
        toolsUsed: Array.isArray(c.tools_used) ? c.tools_used : [],
        deliverables: Array.isArray(c.deliverables) ? c.deliverables : [],
        order: c.display_order,
      }));
      return jsonResponse(mapped);
    } catch {
      return jsonResponse(DEFAULT_CREATIVE);
    }
  }

  // 6. Services
  if (pathname === '/api/services' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_SERVICES);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`
        SELECT * FROM services 
        WHERE is_published = true 
        ORDER BY display_order ASC;
      `;
      if (rows.length === 0) {
        return jsonResponse(DEFAULT_SERVICES);
      }
      const mapped = rows.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        iconName: s.icon,
        highlights: Array.isArray(s.features) ? s.features : [],
        order: s.display_order,
      }));
      return jsonResponse(mapped);
    } catch {
      return jsonResponse(DEFAULT_SERVICES);
    }
  }

  // 7. Pricing plans
  if (pathname === '/api/pricing' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_PRICING);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`
        SELECT * FROM pricing_plans 
        WHERE is_published = true 
        ORDER BY display_order ASC;
      `;
      if (rows.length === 0) {
        return jsonResponse(DEFAULT_PRICING);
      }
      const mapped = rows.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price_display || `৳${p.starting_price_bdt}`,
        subtitle: p.description,
        turnaroundTime: p.delivery_time || '1 to 2 weeks',
        isRecommended: !!p.is_popular,
        features: Array.isArray(p.features) ? p.features : [],
        order: p.display_order,
      }));
      return jsonResponse(mapped);
    } catch {
      return jsonResponse(DEFAULT_PRICING);
    }
  }

  // 8. Add-ons
  if (pathname === '/api/add-ons' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_ADDONS);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`
        SELECT * FROM add_ons 
        WHERE is_published = true 
        ORDER BY display_order ASC;
      `;
      if (rows.length === 0) {
        return jsonResponse(DEFAULT_ADDONS);
      }
      const mapped = rows.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.starting_price_bdt,
        description: a.description,
      }));
      return jsonResponse(mapped);
    } catch {
      return jsonResponse(DEFAULT_ADDONS);
    }
  }

  // 9. Testimonials
  if (pathname === '/api/testimonials' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_TESTIMONIALS);
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`
        SELECT * FROM testimonials 
        WHERE is_published = true 
        ORDER BY display_order ASC;
      `;
      if (rows.length === 0) {
        return jsonResponse(DEFAULT_TESTIMONIALS);
      }
      const mapped = rows.map((t) => ({
        id: t.id,
        name: t.client_name,
        role: t.project_title || 'Client',
        businessType: t.business_type,
        rating: Number(t.rating) || 5,
        quote: t.quote,
        avatar: t.avatar_url || '/images/brand/happy-person-mascot.webp',
        location: t.business_type || '',
        order: t.display_order,
      }));
      return jsonResponse(mapped);
    } catch {
      return jsonResponse(DEFAULT_TESTIMONIALS);
    }
  }

  // 10. FAQs
  if (pathname === '/api/faqs' && method === 'GET') {
    if (!dbUrl) {
      return jsonResponse(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
    }
    try {
      const sql = getNeonClient(dbUrl);
      const rows = await sql`SELECT * FROM faqs ORDER BY display_order ASC;`;
      if (rows.length === 0) {
        return jsonResponse(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
      }
      return jsonResponse(rows);
    } catch {
      return jsonResponse(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
    }
  }

  // 11. Contact request submission
  if (pathname === '/api/contact-requests' && method === 'POST') {
    try {
      const body = await request.json() as Record<string, string>;
      const {
        name,
        email,
        messengerLink,
        whatsappNumber,
        businessName,
        businessType,
        serviceNeeded,
        budgetRange,
        deadline,
        referenceLinks,
        projectDetails,
        preferredContact,
      } = body;

      if (!name) {
        return errorResponse('Name is required.');
      }

      const finalEmail = email || (preferredContact === 'Email' ? 'Client via web form' : '');
      const finalMessenger = messengerLink || (preferredContact === 'Messenger' ? 'https://m.me/happyperson7410' : '');
      const finalWhatsApp = whatsappNumber || (preferredContact === 'WhatsApp' ? 'Via WhatsApp' : '');

      if (!finalEmail && !finalMessenger && !finalWhatsApp) {
        return errorResponse('At least one contact method (Email, Messenger, or WhatsApp) is required.');
      }

      const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      if (dbUrl) {
        const sql = getNeonClient(dbUrl);
        await sql`
          INSERT INTO contact_requests (
            id, name, email, messenger_link, whatsapp_number,
            business_name, business_type, service_needed, budget_range,
            deadline, reference_links, project_details, preferred_contact, status
          ) VALUES (
            ${id},
            ${name},
            ${finalEmail || ''},
            ${finalMessenger || ''},
            ${finalWhatsApp || ''},
            ${businessName || ''},
            ${businessType || ''},
            ${serviceNeeded || ''},
            ${budgetRange || ''},
            ${deadline || ''},
            ${referenceLinks || ''},
            ${projectDetails || ''},
            ${preferredContact || 'Messenger'},
            'new'
          );
        `;
      }

      return jsonResponse({
        success: true,
        message: 'Thank you! Your message and project details have been received. We will respond promptly.',
        requestId: id,
      }, 201);
    } catch (err: unknown) {
      return errorResponse(`Failed to process contact request: ${(err as Error).message}`, 500);
    }
  }

  // -------------------------------------------------------------
  // ADMIN AUTH & SETUP ENDPOINTS
  // -------------------------------------------------------------

  // Admin Login
  if (pathname === '/api/admin/login' && method === 'POST') {
    try {
      const { email, password } = (await request.json()) as { email?: string; password?: string };
      if (!email || !password) {
        return errorResponse('Email and password are required.');
      }

      if (!dbUrl) {
        // Fallback admin login when DATABASE_URL is not yet configured
        const defaultEmail = env.ADMIN_DEFAULT_EMAIL || 'happyperson7410@gmail.com';
        const defaultPassword = env.ADMIN_DEFAULT_PASSWORD || 'Admin@HappyPerson2026';
        if (email.toLowerCase() === defaultEmail.toLowerCase() && password === defaultPassword) {
          const token = await signAdminToken({ id: 'admin-fallback', email: defaultEmail, role: 'admin' }, jwtSecret);
          return jsonResponse({
            success: true,
            token,
            user: { id: 'admin-fallback', email: defaultEmail, role: 'admin' },
            note: 'Running with fallback configuration. Add DATABASE_URL to persist to Neon.',
          });
        }
        return errorResponse('Invalid email or password.', 401);
      }

      const sql = getNeonClient(dbUrl);
      const rows = await sql`SELECT * FROM admin_users WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;`;
      if (rows.length === 0) {
        // If table exists but empty, check default credentials
        const adminCount = await sql`SELECT count(*)::int as count FROM admin_users;`;
        if (adminCount[0]?.count === 0) {
          const defaultEmail = env.ADMIN_DEFAULT_EMAIL || 'happyperson7410@gmail.com';
          const defaultPassword = env.ADMIN_DEFAULT_PASSWORD || 'Admin@HappyPerson2026';
          if (email.toLowerCase() === defaultEmail.toLowerCase() && password === defaultPassword) {
            // Auto-create initial admin user
            const hash = await bcrypt.hash(password, 10);
            const newId = `admin-${Date.now()}`;
            await sql`INSERT INTO admin_users (id, email, password_hash, role) VALUES (${newId}, ${defaultEmail}, ${hash}, 'admin');`;
            const token = await signAdminToken({ id: newId, email: defaultEmail, role: 'admin' }, jwtSecret);
            return jsonResponse({
              success: true,
              token,
              user: { id: newId, email: defaultEmail, role: 'admin' },
            });
          }
        }
        return errorResponse('Invalid email or password.', 401);
      }

      const admin = rows[0];
      const isValid = await bcrypt.compare(password, admin.password_hash);
      if (!isValid) {
        return errorResponse('Invalid email or password.', 401);
      }

      const token = await signAdminToken({ id: admin.id, email: admin.email, role: admin.role }, jwtSecret);
      return jsonResponse({
        success: true,
        token,
        user: { id: admin.id, email: admin.email, role: admin.role },
      });
    } catch (err: unknown) {
      return errorResponse(`Login error: ${(err as Error).message}`, 500);
    }
  }

  // Admin Check Session / Me
  if (pathname === '/api/admin/me' && method === 'GET') {
    const authError = await requireAdmin();
    if (authError) return authError;

    const token = extractToken(request)!;
    const admin = (await verifyAdminToken(token, jwtSecret))!;
    return jsonResponse({ success: true, user: admin });
  }

  // Admin Password Setup / Change
  if (pathname === '/api/admin/setup' && method === 'POST') {
    try {
      const { email, password, setupKey } = (await request.json()) as { email?: string; password?: string; setupKey?: string };
      if (!email || !password) {
        return errorResponse('Email and new password are required.');
      }
      if (password.length < 8) {
        return errorResponse('Password must be at least 8 characters long.');
      }

      const hash = await bcrypt.hash(password, 10);

      if (dbUrl) {
        const sql = getNeonClient(dbUrl);
        const existing = await sql`SELECT id FROM admin_users WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;`;
        if (existing.length > 0) {
          await sql`UPDATE admin_users SET password_hash = ${hash}, updated_at = NOW() WHERE id = ${existing[0].id};`;
        } else {
          const newId = `admin-${Date.now()}`;
          await sql`INSERT INTO admin_users (id, email, password_hash, role) VALUES (${newId}, ${email.trim()}, ${hash}, 'admin');`;
        }
      }

      return jsonResponse({
        success: true,
        message: 'Admin credentials configured successfully. You may now log in.',
      });
    } catch (err: unknown) {
      return errorResponse(`Setup failed: ${(err as Error).message}`, 500);
    }
  }

  // Database Migration / Seed Trigger (Safe & Idempotent)
  if (pathname === '/api/admin/init-db' && method === 'POST') {
    const authError = await requireAdmin();
    if (authError) return authError;

    if (!dbUrl) {
      return errorResponse('DATABASE_URL is not set. Please configure DATABASE_URL first.');
    }

    try {
      const res = await runMigrationsAndSeed(
        dbUrl,
        env.ADMIN_DEFAULT_EMAIL || 'happyperson7410@gmail.com',
        env.ADMIN_DEFAULT_PASSWORD || 'Admin@HappyPerson2026'
      );
      return jsonResponse({
        success: true,
        message: 'Safe migrations and idempotent seeds applied successfully.',
        log: res.log,
      });
    } catch (err: unknown) {
      return errorResponse(`Database initialization failed: ${(err as Error).message}`, 500);
    }
  }

  // -------------------------------------------------------------
  // ADMIN CRUD PROTECTED ENDPOINTS
  // -------------------------------------------------------------

  // All Admin endpoints below require valid Admin token
  if (pathname.startsWith('/api/admin/')) {
    const authError = await requireAdmin();
    if (authError) return authError;

    // Storage status check (100% Free Public Repository Assets)
    if (pathname === '/api/admin/storage-status' && method === 'GET') {
      return jsonResponse({
        connected: true,
        provider: 'public_assets',
        bucket: 'Repository Public Assets (/public/images/)',
        publicUrlBase: '/images',
        folders: ALLOWED_STORAGE_FOLDERS,
        freeMode: true,
      });
    }

    // Direct Image and File Upload Handler
    if (pathname === '/api/admin/upload' && method === 'POST') {
      try {
        const contentTypeHeader = request.headers.get('content-type') || '';
        let buffer: Uint8Array | null = null;
        let filename = 'asset.webp';
        let folder = 'brand';
        let mimeType = 'image/webp';

        if (contentTypeHeader.includes('multipart/form-data')) {
          const formData = await request.formData();
          const file = formData.get('file');
          if (!file || typeof file === 'string') {
            return errorResponse('No file found in multipart upload form data.');
          }
          const uploadFile = file as File;
          folder = (formData.get('folder') as string) || 'brand';
          filename = (formData.get('filename') as string) || uploadFile.name || 'upload.webp';
          mimeType = uploadFile.type || 'image/webp';
          const arrayBuf = await uploadFile.arrayBuffer();
          buffer = new Uint8Array(arrayBuf);
        } else {
          // JSON payload with base64 data url
          const body = (await request.json()) as {
            fileData?: string;
            folder?: string;
            filename?: string;
            contentType?: string;
          };
          if (!body.fileData) {
            return errorResponse('No file data provided in request body.');
          }
          folder = body.folder || 'brand';
          filename = body.filename || 'upload.webp';
          mimeType = body.contentType || 'image/webp';

          const base64Data = body.fileData.includes(';base64,')
            ? body.fileData.split(';base64,')[1]
            : body.fileData;

          if (typeof Buffer !== 'undefined') {
            buffer = new Uint8Array(Buffer.from(base64Data, 'base64'));
          } else {
            const binaryString = atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            buffer = bytes;
          }
        }

        if (!buffer || buffer.byteLength === 0) {
          return errorResponse('Uploaded file data is empty.');
        }

        // Validate allowed mime types
        const allowedMime = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/svg+xml',
          'video/mp4',
          'video/webm',
        ];
        if (!allowedMime.includes(mimeType.toLowerCase())) {
          return errorResponse(`File type "${mimeType}" is not supported. Allowed formats: JPG, PNG, WebP, GIF, MP4, WebM.`);
        }

        const isVideo = mimeType.startsWith('video/');
        const maxSize = isVideo ? 25 * 1024 * 1024 : 5 * 1024 * 1024; // 5MB for images, 25MB for videos
        if (buffer.byteLength > maxSize) {
          const mbSize = (buffer.byteLength / (1024 * 1024)).toFixed(2);
          return errorResponse(`File size (${mbSize}MB) exceeds the maximum allowed limit of ${isVideo ? '25MB' : '5MB'}.`);
        }

        const storageEnv: StorageEnv = {
          R2_ACCOUNT_ID: env.R2_ACCOUNT_ID || (typeof process !== 'undefined' ? process.env?.R2_ACCOUNT_ID : undefined),
          R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID || (typeof process !== 'undefined' ? process.env?.R2_ACCESS_KEY_ID : undefined),
          R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY || (typeof process !== 'undefined' ? process.env?.R2_SECRET_ACCESS_KEY : undefined),
          R2_BUCKET_NAME: env.R2_BUCKET_NAME || (typeof process !== 'undefined' ? process.env?.R2_BUCKET_NAME : undefined),
          R2_PUBLIC_URL: env.R2_PUBLIC_URL || (typeof process !== 'undefined' ? process.env?.R2_PUBLIC_URL : undefined),
          R2_BUCKET: env.R2_BUCKET,
        };

        const result = await uploadFileToStorage(buffer, folder, filename, mimeType, storageEnv);
        return jsonResponse(result);
      } catch (err: unknown) {
        console.error('API Upload error:', err);
        return errorResponse(`Upload failed: ${(err as Error).message}`, 500);
      }
    }

    // Direct File Delete Handler
    if (pathname === '/api/admin/upload' && method === 'DELETE') {
      try {
        const { key } = (await request.json()) as { key?: string };
        if (!key) return errorResponse('Missing file key to delete.');
        const result = await deleteFileFromStorage(key, env as StorageEnv);
        return jsonResponse(result);
      } catch (err: unknown) {
        return errorResponse(`Deletion failed: ${(err as Error).message}`, 500);
      }
    }

    if (!dbUrl) {
      return errorResponse('DATABASE_URL is not set. Configure your Neon database connection string in Cloudflare Settings.', 400);
    }
    const sql = getNeonClient(dbUrl);

    // GET /api/admin/contact-requests
    if (pathname === '/api/admin/contact-requests' && method === 'GET') {
      try {
        const rows = await sql`SELECT * FROM contact_requests ORDER BY created_at DESC;`;
        return jsonResponse(rows);
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // PATCH /api/admin/contact-requests/:id (update status)
    if (pathname.startsWith('/api/admin/contact-requests/') && method === 'PATCH') {
      const id = pathname.replace('/api/admin/contact-requests/', '');
      const body = await request.json() as { status?: string };
      try {
        await sql`UPDATE contact_requests SET status = ${body.status || 'read'} WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // DELETE /api/admin/contact-requests/:id
    if (pathname.startsWith('/api/admin/contact-requests/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/contact-requests/', '');
      try {
        await sql`DELETE FROM contact_requests WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // PUT /api/admin/site-settings
    if (pathname === '/api/admin/site-settings' && method === 'PUT') {
      const body = await request.json() as Record<string, string>;
      try {
        await sql`
          INSERT INTO site_settings (
            id, availability_status, availability_message, hero_headline,
            hero_subheadline, about_text, og_image_url, footer_text,
            email, whatsapp_number, messenger_link, updated_at
          ) VALUES (
            'default',
            ${body.availabilityStatus || 'Available for Projects'},
            ${body.availabilityMessage || ''},
            ${body.heroHeadline || ''},
            ${body.heroSubheadline || ''},
            ${body.aboutText || ''},
            ${body.ogImageUrl || '/images/banners/og-preview.webp'},
            ${body.footerText || ''},
            ${body.email || ''},
            ${body.whatsappNumber || ''},
            ${body.messengerLink || ''},
            NOW()
          )
          ON CONFLICT (id) DO UPDATE SET
            availability_status = EXCLUDED.availability_status,
            availability_message = EXCLUDED.availability_message,
            hero_headline = EXCLUDED.hero_headline,
            hero_subheadline = EXCLUDED.hero_subheadline,
            about_text = EXCLUDED.about_text,
            og_image_url = EXCLUDED.og_image_url,
            footer_text = EXCLUDED.footer_text,
            email = EXCLUDED.email,
            whatsapp_number = EXCLUDED.whatsapp_number,
            messenger_link = EXCLUDED.messenger_link,
            updated_at = NOW();
        `;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // Projects CRUD
    if (pathname === '/api/admin/projects' && method === 'POST') {
      const body = await request.json() as Record<string, unknown>;
      const id = (body.id as string) || `proj-${Date.now()}`;
      const slug = (body.slug as string) || id;
      try {
        await sql`
          INSERT INTO projects (
            id, title, slug, category, short_description, long_description,
            thumbnail_url, preview_video_url, live_demo_url, client, duration,
            problem, solution, tags, impact_metrics, is_featured, is_published, display_order
          ) VALUES (
            ${id},
            ${body.title as string},
            ${slug},
            ${(body.category as string) || 'Website'},
            ${(body.description as string) || ''},
            ${(body.solution as string) || ''},
            ${(body.thumbnail as string) || '/images/projects/dental-clinic-hero.webp'},
            ${(body.previewVideoUrl as string) || ''},
            ${(body.liveDemoUrl as string) || ''},
            ${(body.client as string) || ''},
            ${(body.duration as string) || ''},
            ${(body.problem as string) || ''},
            ${(body.solution as string) || ''},
            ${JSON.stringify(body.tags || [])}::jsonb,
            ${JSON.stringify(body.impactMetrics || [])}::jsonb,
            ${!!body.featured},
            ${!body.hidden},
            ${(body.order as number) || 1}
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            category = EXCLUDED.category,
            short_description = EXCLUDED.short_description,
            long_description = EXCLUDED.long_description,
            thumbnail_url = EXCLUDED.thumbnail_url,
            preview_video_url = EXCLUDED.preview_video_url,
            live_demo_url = EXCLUDED.live_demo_url,
            client = EXCLUDED.client,
            duration = EXCLUDED.duration,
            problem = EXCLUDED.problem,
            solution = EXCLUDED.solution,
            tags = EXCLUDED.tags,
            impact_metrics = EXCLUDED.impact_metrics,
            is_featured = EXCLUDED.is_featured,
            is_published = EXCLUDED.is_published,
            display_order = EXCLUDED.display_order,
            updated_at = NOW();
        `;

        // Update features if provided
        if (Array.isArray(body.features)) {
          await sql`DELETE FROM project_features WHERE project_id = ${id};`;
          for (let i = 0; i < body.features.length; i++) {
            const feat = body.features[i];
            await sql`
              INSERT INTO project_features (id, project_id, feature_text, display_order)
              VALUES (${`${id}-f-${i}`}, ${id}, ${feat}, ${i + 1});
            `;
          }
        }

        // Update screenshots if provided
        if (Array.isArray(body.screenshots)) {
          await sql`DELETE FROM project_images WHERE project_id = ${id};`;
          for (let i = 0; i < body.screenshots.length; i++) {
            const img = body.screenshots[i];
            await sql`
              INSERT INTO project_images (id, project_id, image_url, alt_text, display_order)
              VALUES (${`${id}-i-${i}`}, ${id}, ${img}, ${body.title as string}, ${i + 1});
            `;
          }
        }

        return jsonResponse({ success: true, id });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    if (pathname.startsWith('/api/admin/projects/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/projects/', '');
      try {
        await sql`DELETE FROM projects WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // Creative Works CRUD
    if (pathname === '/api/admin/creative-works' && method === 'POST') {
      const body = await request.json() as Record<string, unknown>;
      const id = (body.id as string) || `creative-${Date.now()}`;
      try {
        await sql`
          INSERT INTO creative_works (
            id, title, category, description, thumbnail_url,
            full_image_url, video_url, external_url, youtube_id,
            tools_used, deliverables, is_published, display_order
          ) VALUES (
            ${id},
            ${body.title as string},
            ${body.category as string},
            ${(body.shortDescription as string) || ''},
            ${(body.thumbnail as string) || ''},
            ${(body.fullImage as string) || (body.thumbnail as string) || ''},
            ${(body.youtubeUrl as string) || null},
            ${(body.youtubeUrl as string) || null},
            ${(body.youtubeId as string) || null},
            ${JSON.stringify(body.toolsUsed || [])}::jsonb,
            ${JSON.stringify(body.deliverables || [])}::jsonb,
            ${body.isPublished !== false},
            ${(body.order as number) || 1}
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            category = EXCLUDED.category,
            description = EXCLUDED.description,
            thumbnail_url = EXCLUDED.thumbnail_url,
            full_image_url = EXCLUDED.full_image_url,
            video_url = EXCLUDED.video_url,
            external_url = EXCLUDED.external_url,
            youtube_id = EXCLUDED.youtube_id,
            tools_used = EXCLUDED.tools_used,
            deliverables = EXCLUDED.deliverables,
            is_published = EXCLUDED.is_published,
            display_order = EXCLUDED.display_order;
        `;
        return jsonResponse({ success: true, id });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    if (pathname.startsWith('/api/admin/creative-works/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/creative-works/', '');
      try {
        await sql`DELETE FROM creative_works WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // Services CRUD
    if (pathname === '/api/admin/services' && method === 'POST') {
      const body = await request.json() as Record<string, unknown>;
      const id = (body.id as string) || `srv-${Date.now()}`;
      try {
        await sql`
          INSERT INTO services (id, title, description, icon, features, is_published, display_order)
          VALUES (
            ${id},
            ${body.title as string},
            ${(body.description as string) || ''},
            ${(body.icon as string) || 'Globe'},
            ${JSON.stringify(body.deliverables || [])}::jsonb,
            true,
            ${(body.order as number) || 1}
          ) ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            icon = EXCLUDED.icon,
            features = EXCLUDED.features,
            display_order = EXCLUDED.display_order;
        `;
        return jsonResponse({ success: true, id });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    if (pathname.startsWith('/api/admin/services/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/services/', '');
      try {
        await sql`DELETE FROM services WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // Pricing CRUD
    if (pathname === '/api/admin/pricing' && method === 'POST') {
      const body = await request.json() as Record<string, unknown>;
      const id = (body.id as string) || `price-${Date.now()}`;
      try {
        await sql`
          INSERT INTO pricing_plans (
            id, name, starting_price_bdt, price_display, description,
            features, delivery_time, is_popular, is_published, display_order
          ) VALUES (
            ${id},
            ${body.name as string},
            ${(body.price as string)?.replace(/[^\d]/g, '') || ''},
            ${body.price as string},
            ${(body.subtitle as string) || ''},
            ${JSON.stringify(body.features || [])}::jsonb,
            ${(body.turnaroundTime as string) || ''},
            ${!!body.isRecommended},
            true,
            ${(body.order as number) || 1}
          ) ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            starting_price_bdt = EXCLUDED.starting_price_bdt,
            price_display = EXCLUDED.price_display,
            description = EXCLUDED.description,
            features = EXCLUDED.features,
            delivery_time = EXCLUDED.delivery_time,
            is_popular = EXCLUDED.is_popular,
            display_order = EXCLUDED.display_order;
        `;
        return jsonResponse({ success: true, id });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // Testimonials CRUD
    if (pathname === '/api/admin/testimonials' && method === 'POST') {
      const body = await request.json() as Record<string, unknown>;
      const id = (body.id as string) || `test-${Date.now()}`;
      try {
        await sql`
          INSERT INTO testimonials (
            id, client_name, business_type, rating, quote, avatar_url, project_title, is_published, display_order
          ) VALUES (
            ${id},
            ${(body.name as string) || 'Client'},
            ${(body.role as string) || ''},
            5,
            ${(body.content as string) || ''},
            ${(body.avatar as string) || '/images/brand/happy-person-mascot.webp'},
            ${(body.company as string) || ''},
            true,
            ${(body.order as number) || 1}
          ) ON CONFLICT (id) DO UPDATE SET
            client_name = EXCLUDED.client_name,
            business_type = EXCLUDED.business_type,
            quote = EXCLUDED.quote,
            avatar_url = EXCLUDED.avatar_url,
            project_title = EXCLUDED.project_title,
            display_order = EXCLUDED.display_order;
        `;
        return jsonResponse({ success: true, id });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    if (pathname.startsWith('/api/admin/testimonials/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/testimonials/', '');
      try {
        await sql`DELETE FROM testimonials WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    // FAQs CRUD
    if (pathname === '/api/admin/faqs' && method === 'POST') {
      const body = await request.json() as Record<string, unknown>;
      const id = (body.id as string) || `faq-${Date.now()}`;
      try {
        await sql`
          INSERT INTO faqs (id, question, answer, display_order)
          VALUES (
            ${id},
            ${body.question as string},
            ${body.answer as string},
            ${(body.order as number) || 1}
          ) ON CONFLICT (id) DO UPDATE SET
            question = EXCLUDED.question,
            answer = EXCLUDED.answer,
            display_order = EXCLUDED.display_order;
        `;
        return jsonResponse({ success: true, id });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }

    if (pathname.startsWith('/api/admin/faqs/') && method === 'DELETE') {
      const id = pathname.replace('/api/admin/faqs/', '');
      try {
        await sql`DELETE FROM faqs WHERE id = ${id};`;
        return jsonResponse({ success: true });
      } catch (err: unknown) {
        return errorResponse((err as Error).message, 500);
      }
    }
  }

  return errorResponse(`Route not found: ${method} ${pathname}`, 404);
}
