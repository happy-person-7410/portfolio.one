/**
 * Server-side entry point for Happy Person Creative Studio.
 * Integrates Neon PostgreSQL and secure server-side Authentication & Admin Role.
 */

import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { Pool, neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  PROJECTS as DEFAULT_PROJECTS,
  SERVICES as DEFAULT_SERVICES,
  PRICING_PLANS as DEFAULT_PRICING,
  TESTIMONIALS as DEFAULT_TESTIMONIALS,
  FAQ_ITEMS as DEFAULT_FAQS,
  PROFILE_INFO as DEFAULT_PROFILE,
} from './src/data/portfolioData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET || 'happy-person-secure-session-salt-2026'));

// ----------------------------------------------------
// 1. Neon PostgreSQL Database Layer (Server-Side Only)
// ----------------------------------------------------
// NOTE: DATABASE_URL is strictly accessed server-side and never exposed to the client.
const databaseUrl = process.env.DATABASE_URL;
let dbPool: Pool | null = null;
let sqlQuery: ReturnType<typeof neon> | null = null;

// Strongly typed query executor for Neon
async function queryDb<T = any>(strings: TemplateStringsArray, ...values: any[]): Promise<T[]> {
  if (!sqlQuery) return [];
  const res = (await (sqlQuery as any)(strings, ...values)) as any;
  if (Array.isArray(res)) return res as T[];
  if (res && Array.isArray(res.rows)) return res.rows as T[];
  return [];
}

// In-memory fallback stores (used if DATABASE_URL is not yet supplied)
const memoryStore = {
  projects: [...DEFAULT_PROJECTS.map((p, i) => ({ ...p, order: i + 1, featured: i < 3, hidden: false }))],
  services: [...DEFAULT_SERVICES.map((s, i) => ({ ...s, order: i + 1 }))],
  pricing: [...DEFAULT_PRICING.map((pr, i) => ({ ...pr, order: i + 1 }))],
  testimonials: [...DEFAULT_TESTIMONIALS.map((t, i) => ({ ...t, order: i + 1 }))],
  faqs: [...DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 }))],
  settings: { ...DEFAULT_PROFILE },
  setupLocked: false,
  users: new Map<string, { id: string; email: string; passwordHash: string; role: string; createdAt: string }>(),
};

// Initial admin email configuration (from environment variable or default studio account)
const CONFIGURED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'happyperson7410@gmail.com').toLowerCase();

if (databaseUrl) {
  try {
    dbPool = new Pool({ connectionString: databaseUrl });
    sqlQuery = neon(databaseUrl);
    console.log('[Neon] Initialized PostgreSQL connection pool');
  } catch (err) {
    // Never print databaseUrl or secrets in logs
    console.error('[Neon] Failed to initialize PostgreSQL pool connection');
  }
} else {
  console.log('[Neon] DATABASE_URL is not configured yet. Operating in resilient in-memory mode until DATABASE_URL is set.');
}

// Database Schema Initialization
async function initializeDatabase() {
  if (!sqlQuery) return;
  try {
    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_projects (
        id VARCHAR(128) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(60) NOT NULL,
        description TEXT NOT NULL,
        client VARCHAR(120),
        duration VARCHAR(60),
        thumbnail TEXT NOT NULL,
        preview_video_url TEXT,
        live_demo_url TEXT,
        github_url TEXT,
        problem TEXT,
        solution TEXT,
        tags JSONB DEFAULT '[]',
        features JSONB DEFAULT '[]',
        screenshots JSONB DEFAULT '[]',
        featured BOOLEAN DEFAULT false,
        hidden BOOLEAN DEFAULT false,
        display_order INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_services (
        id VARCHAR(128) PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        icon_name VARCHAR(60) NOT NULL,
        highlights JSONB DEFAULT '[]',
        display_order INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_pricing (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price VARCHAR(50) NOT NULL,
        subtitle TEXT NOT NULL,
        features JSONB DEFAULT '[]',
        is_recommended BOOLEAN DEFAULT false,
        service_category VARCHAR(100),
        turnaround_time VARCHAR(60),
        display_order INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_testimonials (
        id VARCHAR(128) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100),
        business_type VARCHAR(100),
        rating NUMERIC DEFAULT 5,
        quote TEXT NOT NULL,
        avatar TEXT,
        location VARCHAR(100),
        display_order INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_faqs (
        id VARCHAR(128) PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        display_order INT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_settings (
        id VARCHAR(64) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await queryDb`
      CREATE TABLE IF NOT EXISTS portfolio_users (
        id VARCHAR(128) PRIMARY KEY,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash VARCHAR(256) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Seed if projects table is empty
    const countResult = await queryDb<{ count: string }>`SELECT count(*) as count FROM portfolio_projects`;
    if (parseInt(countResult[0]?.count || '0', 10) === 0) {
      console.log('[Neon] Seeding initial portfolio content to PostgreSQL...');
      for (let i = 0; i < DEFAULT_PROJECTS.length; i++) {
        const p = DEFAULT_PROJECTS[i];
        await queryDb`
          INSERT INTO portfolio_projects (
            id, title, category, description, client, duration, thumbnail,
            preview_video_url, live_demo_url, github_url, problem, solution,
            tags, features, screenshots, featured, hidden, display_order
          ) VALUES (
            ${p.id}, ${p.title}, ${p.category}, ${p.description}, ${p.client || ''}, ${p.duration || ''},
            ${p.thumbnail}, ${p.previewVideoUrl || ''}, ${p.liveDemoUrl || ''}, ${p.githubUrl || ''},
            ${p.problem || ''}, ${p.solution || ''}, ${JSON.stringify(p.tags || [])},
            ${JSON.stringify(p.features || [])}, ${JSON.stringify(p.screenshots || [])},
            ${i < 3}, false, ${i + 1}
          ) ON CONFLICT (id) DO NOTHING;
        `;
      }
      for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
        const s = DEFAULT_SERVICES[i];
        await queryDb`
          INSERT INTO portfolio_services (id, title, description, icon_name, highlights, display_order)
          VALUES (${s.id}, ${s.title}, ${s.description}, ${s.iconName}, ${JSON.stringify(s.highlights || [])}, ${i + 1})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      for (let i = 0; i < DEFAULT_PRICING.length; i++) {
        const pr = DEFAULT_PRICING[i];
        await queryDb`
          INSERT INTO portfolio_pricing (id, name, price, subtitle, features, is_recommended, service_category, turnaround_time, display_order)
          VALUES (${pr.id}, ${pr.name}, ${pr.price}, ${pr.subtitle}, ${JSON.stringify(pr.features || [])}, ${pr.isRecommended || false}, ${pr.serviceCategory || ''}, ${pr.turnaroundTime || ''}, ${i + 1})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      for (let i = 0; i < DEFAULT_TESTIMONIALS.length; i++) {
        const t = DEFAULT_TESTIMONIALS[i];
        await queryDb`
          INSERT INTO portfolio_testimonials (id, name, role, business_type, rating, quote, avatar, location, display_order)
          VALUES (${t.id}, ${t.name}, ${t.role}, ${t.businessType}, ${t.rating}, ${t.quote}, ${t.avatar || ''}, ${t.location || ''}, ${i + 1})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      for (let i = 0; i < DEFAULT_FAQS.length; i++) {
        const f = DEFAULT_FAQS[i];
        const id = `faq-${i + 1}`;
        await queryDb`
          INSERT INTO portfolio_faqs (id, question, answer, display_order)
          VALUES (${id}, ${f.question}, ${f.answer}, ${i + 1})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
      await queryDb`
        INSERT INTO portfolio_settings (id, data)
        VALUES ('profile', ${JSON.stringify(DEFAULT_PROFILE)})
        ON CONFLICT (id) DO NOTHING;
      `;
      console.log('[Neon] Seeding complete.');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Neon] Database initialization note:', msg);
  }
}

initializeDatabase();

// ----------------------------------------------------
// 2. Server-Side Authentication & Session Management
// ----------------------------------------------------
const activeSessions = new Map<string, { email: string; role: string; expiresAt: number }>();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_happy_person_neon_salt').digest('hex');
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware: Require Admin Authentication (Checked on server for all mutation routes)
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.neon_session || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin role required to access this resource' });
  }

  (req as any).user = session;
  next();
}

// ----------------------------------------------------
// 3. API Endpoints
// ----------------------------------------------------

// Health check (Reports database status safely without exposing connection strings)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    neonPostgresConnected: Boolean(sqlQuery),
    timestamp: new Date().toISOString(),
  });
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let userRole = 'user';
    let authenticated = false;

    if (sqlQuery) {
      const userRows = await queryDb<{ password_hash: string; role: string }>`
        SELECT * FROM portfolio_users WHERE email = ${trimmedEmail} LIMIT 1
      `;
      if (userRows.length > 0) {
        const storedHash = userRows[0].password_hash;
        if (storedHash.startsWith('$2a$') || storedHash.startsWith('$2b$') || storedHash.startsWith('$2y$')) {
          authenticated = await bcrypt.compare(password, storedHash);
        } else {
          authenticated = storedHash === hashPassword(password);
        }
        if (authenticated) {
          userRole = userRows[0].role;
        }
      } else if (trimmedEmail === CONFIGURED_ADMIN_EMAIL) {
        // Auto-provision initial configured owner account if missing
        const salt = await bcrypt.genSalt(10);
        const bHash = await bcrypt.hash(password, salt);
        await queryDb`
          INSERT INTO portfolio_users (id, email, password_hash, role)
          VALUES (${crypto.randomUUID()}, ${trimmedEmail}, ${bHash}, 'admin')
        `;
        authenticated = true;
        userRole = 'admin';
      }
    } else {
      // In-memory fallback
      const existing = memoryStore.users.get(trimmedEmail);
      if (existing) {
        if (existing.passwordHash.startsWith('$2a$') || existing.passwordHash.startsWith('$2b$')) {
          authenticated = await bcrypt.compare(password, existing.passwordHash);
        } else {
          authenticated = existing.passwordHash === hashPassword(password);
        }
        if (authenticated) {
          userRole = existing.role;
        }
      } else if (trimmedEmail === CONFIGURED_ADMIN_EMAIL) {
        const salt = await bcrypt.genSalt(10);
        const bHash = await bcrypt.hash(password, salt);
        memoryStore.users.set(trimmedEmail, {
          id: crypto.randomUUID(),
          email: trimmedEmail,
          passwordHash: bHash,
          role: 'admin',
          createdAt: new Date().toISOString(),
        });
        authenticated = true;
        userRole = 'admin';
      }
    }

    if (!authenticated) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    activeSessions.set(token, { email: trimmedEmail, role: userRole, expiresAt });

    res.cookie('neon_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { email: trimmedEmail, role: userRole },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Auth: Register (First user or matching ADMIN_EMAIL automatically gets 'admin' role)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain both letters and numbers.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Strictly server-controlled role: only the designated owner/admin email is ever granted 'admin' on registration.
    // Any role parameter passed from the client or frontend is completely ignored.
    const assignedRole = trimmedEmail === CONFIGURED_ADMIN_EMAIL ? 'admin' : 'user';

    if (sqlQuery) {
      const existing = await queryDb`SELECT id FROM portfolio_users WHERE email = ${trimmedEmail} LIMIT 1`;
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Account already exists. Please sign in.' });
      }

      await queryDb`
        INSERT INTO portfolio_users (id, email, password_hash, role)
        VALUES (${crypto.randomUUID()}, ${trimmedEmail}, ${hashed}, ${assignedRole})
      `;
    } else {
      if (memoryStore.users.has(trimmedEmail)) {
        return res.status(400).json({ error: 'Account already exists. Please sign in.' });
      }
      memoryStore.users.set(trimmedEmail, {
        id: crypto.randomUUID(),
        email: trimmedEmail,
        passwordHash: hashed,
        role: assignedRole,
        createdAt: new Date().toISOString(),
      });
    }

    const token = generateSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    activeSessions.set(token, { email: trimmedEmail, role: assignedRole, expiresAt });

    res.cookie('neon_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { email: trimmedEmail, role: assignedRole }, token });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Setup Status: Checks if one-time setup is permanently locked
app.get('/api/admin/setup-status', async (req, res) => {
  try {
    let isLocked = false;
    if (sqlQuery) {
      const rows = await queryDb<{ data: any }>`
        SELECT data FROM portfolio_settings WHERE id = 'setup_lock' LIMIT 1
      `;
      if (rows.length > 0 && rows[0]?.data?.completed === true) {
        isLocked = true;
      }
    } else {
      isLocked = Boolean(memoryStore.setupLocked);
    }
    res.json({ isLocked });
  } catch (err) {
    res.json({ isLocked: false });
  }
});

// Setup Action: One-time admin password configuration
app.post('/api/admin/setup', async (req, res) => {
  try {
    const { email, setupKey, newPassword, confirmPassword } = req.body;

    // 1. Verify permanent lock status
    let isLocked = false;
    if (sqlQuery) {
      const rows = await queryDb<{ data: any }>`
        SELECT data FROM portfolio_settings WHERE id = 'setup_lock' LIMIT 1
      `;
      if (rows.length > 0 && rows[0]?.data?.completed === true) {
        isLocked = true;
      }
    } else {
      isLocked = Boolean(memoryStore.setupLocked);
    }

    if (isLocked) {
      return res.status(410).json({
        error: 'Admin setup has already been completed and is permanently disabled.'
      });
    }

    // 2. Validate presence of all fields
    if (!email || !setupKey || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // 3. Validate ADMIN_SETUP_KEY (strictly compared on server, never exposed)
    const serverKey = process.env.ADMIN_SETUP_KEY;
    if (!serverKey) {
      return res.status(500).json({ error: 'ADMIN_SETUP_KEY is not configured on the server.' });
    }

    if (setupKey !== serverKey) {
      return res.status(401).json({ error: 'Invalid admin setup key.' });
    }

    // 4. Validate email matches existing admin account
    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail !== CONFIGURED_ADMIN_EMAIL) {
      return res.status(403).json({
        error: `Setup is strictly reserved for the owner account (${CONFIGURED_ADMIN_EMAIL}).`
      });
    }

    // 5. Password complexity validation
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return res.status(400).json({ error: 'Password must contain both letters and numbers.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // 6. Verify user exists with role admin
    if (sqlQuery) {
      const existingAdmin = await queryDb<{ id: string; role: string }>`
        SELECT id, role FROM portfolio_users WHERE email = ${trimmedEmail} AND role = 'admin' LIMIT 1
      `;
      if (existingAdmin.length === 0) {
        return res.status(404).json({ error: 'Admin account not found in database.' });
      }

      // 7. Securely hash password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // 8. Update ONLY the password_hash field for happyperson7410@gmail.com
      await queryDb`
        UPDATE portfolio_users
        SET password_hash = ${passwordHash}
        WHERE email = ${trimmedEmail} AND role = 'admin'
      `;

      // 9. Permanently lock setup endpoint
      const lockData = JSON.stringify({ completed: true, completedAt: new Date().toISOString() });
      await queryDb`
        INSERT INTO portfolio_settings (id, data, updated_at)
        VALUES ('setup_lock', ${lockData}, NOW())
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;
    } else {
      const user = memoryStore.users.get(trimmedEmail);
      if (!user || user.role !== 'admin') {
        return res.status(404).json({ error: 'Admin account not found in database.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      memoryStore.setupLocked = true;
    }

    // Invalidate any active sessions for security
    activeSessions.clear();

    res.json({
      success: true,
      message: 'Admin password updated successfully. The setup endpoint is now permanently disabled.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update admin password.' });
  }
});

// Auth: Current session info
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies?.neon_session || req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ user: null });

  const session = activeSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeSessions.delete(token);
    return res.json({ user: null });
  }

  res.json({ user: { email: session.email, role: session.role } });
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.neon_session || req.headers.authorization?.replace('Bearer ', '');
  if (token) activeSessions.delete(token);
  res.clearCookie('neon_session');
  res.json({ success: true });
});

// Auth: Promote a user to admin (Can be called by an existing admin, or using ADMIN_SETUP_KEY)
app.post('/api/auth/promote-admin', async (req, res) => {
  try {
    const { emailToPromote, setupKey } = req.body;
    if (!emailToPromote) {
      return res.status(400).json({ error: 'emailToPromote is required' });
    }

    const trimmed = emailToPromote.trim().toLowerCase();
    const token = req.cookies?.neon_session || req.headers.authorization?.replace('Bearer ', '');
    const currentSession = token ? activeSessions.get(token) : null;
    const isCallerAdmin = currentSession && currentSession.role === 'admin';
    const matchesSetupKey = process.env.ADMIN_SETUP_KEY && setupKey === process.env.ADMIN_SETUP_KEY;

    if (!isCallerAdmin && !matchesSetupKey) {
      return res.status(403).json({ error: 'Admin permission or valid ADMIN_SETUP_KEY required' });
    }

    if (sqlQuery) {
      await queryDb`UPDATE portfolio_users SET role = 'admin' WHERE email = ${trimmed}`;
    } else {
      const u = memoryStore.users.get(trimmed);
      if (u) u.role = 'admin';
    }

    // Update active session if currently logged in
    for (const [sToken, sData] of activeSessions.entries()) {
      if (sData.email === trimmed) {
        sData.role = 'admin';
      }
    }

    res.json({ success: true, message: `User ${trimmed} has been granted the admin role.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to promote user to admin' });
  }
});

// Projects Endpoints
app.get('/api/projects', async (req, res) => {
  try {
    if (sqlQuery) {
      const rows = await queryDb`
        SELECT * FROM portfolio_projects ORDER BY display_order ASC
      `;
      const formatted = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        description: r.description,
        client: r.client,
        duration: r.duration,
        thumbnail: r.thumbnail,
        previewVideoUrl: r.preview_video_url,
        liveDemoUrl: r.live_demo_url,
        githubUrl: r.github_url,
        problem: r.problem,
        solution: r.solution,
        tags: r.tags || [],
        features: r.features || [],
        screenshots: r.screenshots || [],
        featured: r.featured,
        hidden: r.hidden,
        order: r.display_order,
        updatedAt: r.updated_at,
      }));
      return res.json(formatted);
    }
    res.json(memoryStore.projects);
  } catch (err) {
    res.json(memoryStore.projects);
  }
});

app.post('/api/projects', requireAdmin, async (req, res) => {
  try {
    const p = req.body;
    if (sqlQuery) {
      await queryDb`
        INSERT INTO portfolio_projects (
          id, title, category, description, client, duration, thumbnail,
          preview_video_url, live_demo_url, github_url, problem, solution,
          tags, features, screenshots, featured, hidden, display_order, updated_at
        ) VALUES (
          ${p.id}, ${p.title}, ${p.category}, ${p.description}, ${p.client || ''}, ${p.duration || ''},
          ${p.thumbnail}, ${p.previewVideoUrl || ''}, ${p.liveDemoUrl || ''}, ${p.githubUrl || ''},
          ${p.problem || ''}, ${p.solution || ''}, ${JSON.stringify(p.tags || [])},
          ${JSON.stringify(p.features || [])}, ${JSON.stringify(p.screenshots || [])},
          ${Boolean(p.featured)}, ${Boolean(p.hidden)}, ${p.order || 1}, NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          description = EXCLUDED.description,
          client = EXCLUDED.client,
          duration = EXCLUDED.duration,
          thumbnail = EXCLUDED.thumbnail,
          preview_video_url = EXCLUDED.preview_video_url,
          live_demo_url = EXCLUDED.live_demo_url,
          github_url = EXCLUDED.github_url,
          problem = EXCLUDED.problem,
          solution = EXCLUDED.solution,
          tags = EXCLUDED.tags,
          features = EXCLUDED.features,
          screenshots = EXCLUDED.screenshots,
          featured = EXCLUDED.featured,
          hidden = EXCLUDED.hidden,
          display_order = EXCLUDED.display_order,
          updated_at = NOW();
      `;
    } else {
      const idx = memoryStore.projects.findIndex((item) => item.id === p.id);
      if (idx >= 0) memoryStore.projects[idx] = { ...p, updatedAt: new Date().toISOString() };
      else memoryStore.projects.push({ ...p, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true, project: p });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (sqlQuery) {
      await queryDb`DELETE FROM portfolio_projects WHERE id = ${id}`;
    } else {
      memoryStore.projects = memoryStore.projects.filter((p) => p.id !== id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Services Endpoints
app.get('/api/services', async (req, res) => {
  try {
    if (sqlQuery) {
      const rows = await queryDb`SELECT * FROM portfolio_services ORDER BY display_order ASC`;
      const formatted = rows.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        iconName: r.icon_name,
        highlights: r.highlights || [],
        order: r.display_order,
        updatedAt: r.updated_at,
      }));
      return res.json(formatted);
    }
    res.json(memoryStore.services);
  } catch (err) {
    res.json(memoryStore.services);
  }
});

app.post('/api/services', requireAdmin, async (req, res) => {
  try {
    const s = req.body;
    if (sqlQuery) {
      await queryDb`
        INSERT INTO portfolio_services (id, title, description, icon_name, highlights, display_order, updated_at)
        VALUES (${s.id}, ${s.title}, ${s.description}, ${s.iconName}, ${JSON.stringify(s.highlights || [])}, ${s.order || 1}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          icon_name = EXCLUDED.icon_name,
          highlights = EXCLUDED.highlights,
          display_order = EXCLUDED.display_order,
          updated_at = NOW();
      `;
    } else {
      const idx = memoryStore.services.findIndex((item) => item.id === s.id);
      if (idx >= 0) memoryStore.services[idx] = { ...s, updatedAt: new Date().toISOString() };
      else memoryStore.services.push({ ...s, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true, service: s });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save service' });
  }
});

// Pricing Endpoints
app.get('/api/pricing', async (req, res) => {
  try {
    if (sqlQuery) {
      const rows = await queryDb`SELECT * FROM portfolio_pricing ORDER BY display_order ASC`;
      const formatted = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        price: r.price,
        subtitle: r.subtitle,
        features: r.features || [],
        isRecommended: r.is_recommended,
        serviceCategory: r.service_category,
        turnaroundTime: r.turnaround_time,
        order: r.display_order,
        updatedAt: r.updated_at,
      }));
      return res.json(formatted);
    }
    res.json(memoryStore.pricing);
  } catch (err) {
    res.json(memoryStore.pricing);
  }
});

app.post('/api/pricing', requireAdmin, async (req, res) => {
  try {
    const pr = req.body;
    if (sqlQuery) {
      await queryDb`
        INSERT INTO portfolio_pricing (id, name, price, subtitle, features, is_recommended, service_category, turnaround_time, display_order, updated_at)
        VALUES (${pr.id}, ${pr.name}, ${pr.price}, ${pr.subtitle}, ${JSON.stringify(pr.features || [])}, ${Boolean(pr.isRecommended)}, ${pr.serviceCategory || ''}, ${pr.turnaroundTime || ''}, ${pr.order || 1}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          subtitle = EXCLUDED.subtitle,
          features = EXCLUDED.features,
          is_recommended = EXCLUDED.is_recommended,
          service_category = EXCLUDED.service_category,
          turnaround_time = EXCLUDED.turnaround_time,
          display_order = EXCLUDED.display_order,
          updated_at = NOW();
      `;
    } else {
      const idx = memoryStore.pricing.findIndex((item) => item.id === pr.id);
      if (idx >= 0) memoryStore.pricing[idx] = { ...pr, updatedAt: new Date().toISOString() };
      else memoryStore.pricing.push({ ...pr, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true, pricing: pr });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save pricing plan' });
  }
});

// Testimonials Endpoints
app.get('/api/testimonials', async (req, res) => {
  try {
    if (sqlQuery) {
      const rows = await queryDb`SELECT * FROM portfolio_testimonials ORDER BY display_order ASC`;
      const formatted = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        role: r.role,
        businessType: r.business_type,
        rating: Number(r.rating),
        quote: r.quote,
        avatar: r.avatar,
        location: r.location,
        order: r.display_order,
        updatedAt: r.updated_at,
      }));
      return res.json(formatted);
    }
    res.json(memoryStore.testimonials);
  } catch (err) {
    res.json(memoryStore.testimonials);
  }
});

app.post('/api/testimonials', requireAdmin, async (req, res) => {
  try {
    const t = req.body;
    if (sqlQuery) {
      await queryDb`
        INSERT INTO portfolio_testimonials (id, name, role, business_type, rating, quote, avatar, location, display_order, updated_at)
        VALUES (${t.id}, ${t.name}, ${t.role || ''}, ${t.businessType || ''}, ${t.rating || 5}, ${t.quote}, ${t.avatar || ''}, ${t.location || ''}, ${t.order || 1}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          business_type = EXCLUDED.business_type,
          rating = EXCLUDED.rating,
          quote = EXCLUDED.quote,
          avatar = EXCLUDED.avatar,
          location = EXCLUDED.location,
          display_order = EXCLUDED.display_order,
          updated_at = NOW();
      `;
    } else {
      const idx = memoryStore.testimonials.findIndex((item) => item.id === t.id);
      if (idx >= 0) memoryStore.testimonials[idx] = { ...t, updatedAt: new Date().toISOString() };
      else memoryStore.testimonials.push({ ...t, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true, testimonial: t });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save testimonial' });
  }
});

app.delete('/api/testimonials/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (sqlQuery) {
      await queryDb`DELETE FROM portfolio_testimonials WHERE id = ${id}`;
    } else {
      memoryStore.testimonials = memoryStore.testimonials.filter((t) => t.id !== id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// FAQs Endpoints
app.get('/api/faqs', async (req, res) => {
  try {
    if (sqlQuery) {
      const rows = await queryDb`SELECT * FROM portfolio_faqs ORDER BY display_order ASC`;
      const formatted = rows.map((r: any) => ({
        id: r.id,
        question: r.question,
        answer: r.answer,
        order: r.display_order,
        updatedAt: r.updated_at,
      }));
      return res.json(formatted);
    }
    res.json(memoryStore.faqs);
  } catch (err) {
    res.json(memoryStore.faqs);
  }
});

app.post('/api/faqs', requireAdmin, async (req, res) => {
  try {
    const f = req.body;
    const id = f.id || `faq-${Date.now()}`;
    if (sqlQuery) {
      await queryDb`
        INSERT INTO portfolio_faqs (id, question, answer, display_order, updated_at)
        VALUES (${id}, ${f.question}, ${f.answer}, ${f.order || 1}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          question = EXCLUDED.question,
          answer = EXCLUDED.answer,
          display_order = EXCLUDED.display_order,
          updated_at = NOW();
      `;
    } else {
      const idx = memoryStore.faqs.findIndex((item) => item.id === id);
      if (idx >= 0) memoryStore.faqs[idx] = { ...f, id, updatedAt: new Date().toISOString() };
      else memoryStore.faqs.push({ ...f, id, updatedAt: new Date().toISOString() });
    }
    res.json({ success: true, faq: { ...f, id } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save FAQ' });
  }
});

app.delete('/api/faqs/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (sqlQuery) {
      await queryDb`DELETE FROM portfolio_faqs WHERE id = ${id}`;
    } else {
      memoryStore.faqs = memoryStore.faqs.filter((f) => f.id !== id);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Settings / Profile Endpoints
app.get('/api/settings/profile', async (req, res) => {
  try {
    if (sqlQuery) {
      const rows = await queryDb<{ data: any }>`SELECT data FROM portfolio_settings WHERE id = 'profile' LIMIT 1`;
      if (rows.length > 0) {
        return res.json(rows[0].data);
      }
    }
    res.json(memoryStore.settings);
  } catch (err) {
    res.json(memoryStore.settings);
  }
});

app.put('/api/settings/profile', requireAdmin, async (req, res) => {
  try {
    const profile = req.body;
    if (sqlQuery) {
      await queryDb`
        INSERT INTO portfolio_settings (id, data, updated_at)
        VALUES ('profile', ${JSON.stringify(profile)}, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          updated_at = NOW();
      `;
    } else {
      memoryStore.settings = { ...memoryStore.settings, ...profile };
    }
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Force Seed / Reset Database Endpoint
app.post('/api/db/seed', requireAdmin, async (req, res) => {
  try {
    if (sqlQuery) {
      await queryDb`DELETE FROM portfolio_projects`;
      await queryDb`DELETE FROM portfolio_services`;
      await queryDb`DELETE FROM portfolio_pricing`;
      await queryDb`DELETE FROM portfolio_testimonials`;
      await queryDb`DELETE FROM portfolio_faqs`;
      await queryDb`DELETE FROM portfolio_settings`;

      for (let i = 0; i < DEFAULT_PROJECTS.length; i++) {
        const p = DEFAULT_PROJECTS[i];
        await queryDb`
          INSERT INTO portfolio_projects (
            id, title, category, description, client, duration, thumbnail,
            preview_video_url, live_demo_url, github_url, problem, solution,
            tags, features, screenshots, featured, hidden, display_order
          ) VALUES (
            ${p.id}, ${p.title}, ${p.category}, ${p.description}, ${p.client || ''}, ${p.duration || ''},
            ${p.thumbnail}, ${p.previewVideoUrl || ''}, ${p.liveDemoUrl || ''}, ${p.githubUrl || ''},
            ${p.problem || ''}, ${p.solution || ''}, ${JSON.stringify(p.tags || [])},
            ${JSON.stringify(p.features || [])}, ${JSON.stringify(p.screenshots || [])},
            ${i < 3}, false, ${i + 1}
          );
        `;
      }
      for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
        const s = DEFAULT_SERVICES[i];
        await queryDb`
          INSERT INTO portfolio_services (id, title, description, icon_name, highlights, display_order)
          VALUES (${s.id}, ${s.title}, ${s.description}, ${s.iconName}, ${JSON.stringify(s.highlights || [])}, ${i + 1});
        `;
      }
      for (let i = 0; i < DEFAULT_PRICING.length; i++) {
        const pr = DEFAULT_PRICING[i];
        await queryDb`
          INSERT INTO portfolio_pricing (id, name, price, subtitle, features, is_recommended, service_category, turnaround_time, display_order)
          VALUES (${pr.id}, ${pr.name}, ${pr.price}, ${pr.subtitle}, ${JSON.stringify(pr.features || [])}, ${pr.isRecommended || false}, ${pr.serviceCategory || ''}, ${pr.turnaroundTime || ''}, ${i + 1});
        `;
      }
      for (let i = 0; i < DEFAULT_TESTIMONIALS.length; i++) {
        const t = DEFAULT_TESTIMONIALS[i];
        await queryDb`
          INSERT INTO portfolio_testimonials (id, name, role, business_type, rating, quote, avatar, location, display_order)
          VALUES (${t.id}, ${t.name}, ${t.role}, ${t.businessType}, ${t.rating}, ${t.quote}, ${t.avatar || ''}, ${t.location || ''}, ${i + 1});
        `;
      }
      for (let i = 0; i < DEFAULT_FAQS.length; i++) {
        const f = DEFAULT_FAQS[i];
        await queryDb`
          INSERT INTO portfolio_faqs (id, question, answer, display_order)
          VALUES (${`faq-${i + 1}`}, ${f.question}, ${f.answer}, ${i + 1});
        `;
      }
      await queryDb`
        INSERT INTO portfolio_settings (id, data)
        VALUES ('profile', ${JSON.stringify(DEFAULT_PROFILE)});
      `;
    } else {
      memoryStore.projects = [...DEFAULT_PROJECTS.map((p, i) => ({ ...p, order: i + 1, featured: i < 3, hidden: false }))];
      memoryStore.services = [...DEFAULT_SERVICES.map((s, i) => ({ ...s, order: i + 1 }))];
      memoryStore.pricing = [...DEFAULT_PRICING.map((pr, i) => ({ ...pr, order: i + 1 }))];
      memoryStore.testimonials = [...DEFAULT_TESTIMONIALS.map((t, i) => ({ ...t, order: i + 1 }))];
      memoryStore.faqs = [...DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 }))];
      memoryStore.settings = { ...DEFAULT_PROFILE };
    }
    res.json({ success: true, message: 'Database re-seeded successfully with default portfolio data' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to re-seed database' });
  }
});

// ----------------- Vite Middleware Integration (Dev) & Static Serving (Prod) -----------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Happy Person Studio] Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
