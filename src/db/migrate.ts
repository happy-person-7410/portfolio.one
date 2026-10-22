import bcrypt from 'bcryptjs';
import { getNeonClient } from './neonClient';
import { PROJECTS, SERVICES, TESTIMONIALS, FAQ_ITEMS, PROFILE_INFO } from '../data/portfolioData';
import { CREATIVE_ITEMS } from '../data/creativeData';
import { PRICING_PLANS, ADDON_SERVICES } from '../data/pricingData';

export async function runMigrationsAndSeed(databaseUrl: string, adminDefaultEmail?: string, adminDefaultPassword?: string) {
  const sql = getNeonClient(databaseUrl);
  const log: string[] = [];

  // 1. Create tables idempotently
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      availability_status TEXT DEFAULT 'Available for Projects',
      availability_message TEXT DEFAULT 'Accepting new client projects for this quarter',
      hero_headline TEXT DEFAULT 'I design and build modern websites that help businesses get more customers.',
      hero_subheadline TEXT DEFAULT 'Custom web design, responsive websites, booking systems, dashboards, and AI-powered web app UIs by Happy Person.',
      about_text TEXT,
      og_image_url TEXT DEFAULT '/images/banners/og-preview.webp',
      footer_text TEXT DEFAULT 'Happy Person Creative Studio · Crafted with precision, speed, and care.',
      email TEXT DEFAULT 'happyperson7410@gmail.com',
      whatsapp_number TEXT DEFAULT '+8801840656094',
      messenger_link TEXT DEFAULT 'https://m.me/happyperson7410',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  log.push('Table verified: site_settings');

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      category TEXT DEFAULT 'Website',
      short_description TEXT,
      long_description TEXT,
      thumbnail_url TEXT NOT NULL,
      preview_video_url TEXT,
      live_demo_url TEXT,
      github_url TEXT,
      tags JSONB DEFAULT '[]'::jsonb,
      client TEXT,
      duration TEXT,
      problem TEXT,
      solution TEXT,
      impact_metrics JSONB DEFAULT '[]'::jsonb,
      is_featured BOOLEAN DEFAULT false,
      is_published BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  log.push('Table verified: projects');

  await sql`
    CREATE TABLE IF NOT EXISTS project_images (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: project_images');

  await sql`
    CREATE TABLE IF NOT EXISTS project_features (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      feature_text TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: project_features');

  await sql`
    CREATE TABLE IF NOT EXISTS creative_works (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      thumbnail_url TEXT NOT NULL,
      full_image_url TEXT,
      video_url TEXT,
      external_url TEXT,
      youtube_id TEXT,
      tools_used JSONB DEFAULT '[]'::jsonb,
      deliverables JSONB DEFAULT '[]'::jsonb,
      is_published BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  log.push('Table verified: creative_works');

  await sql`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      features JSONB DEFAULT '[]'::jsonb,
      is_published BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: services');

  await sql`
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      starting_price_bdt TEXT,
      price_display TEXT,
      description TEXT,
      features JSONB DEFAULT '[]'::jsonb,
      delivery_time TEXT,
      badge TEXT,
      is_popular BOOLEAN DEFAULT false,
      is_published BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: pricing_plans');

  await sql`
    CREATE TABLE IF NOT EXISTS add_ons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      starting_price_bdt TEXT,
      description TEXT,
      is_published BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: add_ons');

  await sql`
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY,
      client_name TEXT NOT NULL,
      business_type TEXT,
      rating NUMERIC DEFAULT 5,
      quote TEXT NOT NULL,
      avatar_url TEXT,
      project_title TEXT,
      is_published BOOLEAN DEFAULT true,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: testimonials');

  await sql`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    );
  `;
  log.push('Table verified: faqs');

  await sql`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      messenger_link TEXT,
      whatsapp_number TEXT,
      business_name TEXT,
      business_type TEXT,
      service_needed TEXT,
      budget_range TEXT,
      deadline TEXT,
      reference_links TEXT,
      project_details TEXT,
      preferred_contact TEXT DEFAULT 'Email',
      status TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  log.push('Table verified: contact_requests');

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  log.push('Table verified: admin_users');

  // 2. Seed site settings if not present
  const existingSettings = await sql`SELECT id FROM site_settings WHERE id = 'default' LIMIT 1;`;
  if (existingSettings.length === 0) {
    await sql`
      INSERT INTO site_settings (
        id, availability_status, availability_message, hero_headline,
        hero_subheadline, about_text, og_image_url, footer_text,
        email, whatsapp_number, messenger_link
      ) VALUES (
        'default',
        ${PROFILE_INFO.availability || 'Available for Projects'},
        'Accepting new client projects for this quarter',
        ${PROFILE_INFO.headline},
        ${PROFILE_INFO.subheading},
        ${PROFILE_INFO.bio},
        ${PROFILE_INFO.ogBanner || '/images/banners/og-preview.webp'},
        'Happy Person Creative Studio · Crafted with precision, speed, and care.',
        ${PROFILE_INFO.email},
        ${PROFILE_INFO.whatsappNumber},
        ${PROFILE_INFO.messengerUrl}
      );
    `;
    log.push('Seeded site_settings');
  }

  // 3. Seed projects safely (idempotent ON CONFLICT DO NOTHING)
  for (let i = 0; i < PROJECTS.length; i++) {
    const p = PROJECTS[i];
    const slug = p.id;
    await sql`
      INSERT INTO projects (
        id, title, slug, category, short_description, long_description,
        thumbnail_url, preview_video_url, live_demo_url, client, duration,
        problem, solution, tags, impact_metrics, is_featured, is_published, display_order
      ) VALUES (
        ${p.id},
        ${p.title},
        ${slug},
        ${p.category},
        ${p.description},
        ${p.solution || p.description},
        ${p.thumbnail},
        ${p.previewVideoUrl || ''},
        ${p.liveDemoUrl || ''},
        ${p.client || ''},
        ${p.duration || ''},
        ${p.problem || ''},
        ${p.solution || ''},
        ${JSON.stringify(p.tags || [])}::jsonb,
        ${JSON.stringify(p.impactMetrics || [])}::jsonb,
        ${p.featured ?? (i < 3)},
        ${!p.hidden},
        ${i + 1}
      ) ON CONFLICT (id) DO NOTHING;
    `;

    // Seed project features
    if (p.features && p.features.length > 0) {
      for (let fi = 0; fi < p.features.length; fi++) {
        const feat = p.features[fi];
        const featId = `${p.id}-feat-${fi}`;
        await sql`
          INSERT INTO project_features (id, project_id, feature_text, display_order)
          VALUES (${featId}, ${p.id}, ${feat}, ${fi + 1})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    // Seed project images/screenshots
    if (p.screenshots && p.screenshots.length > 0) {
      for (let si = 0; si < p.screenshots.length; si++) {
        const img = p.screenshots[si];
        const imgId = `${p.id}-img-${si}`;
        await sql`
          INSERT INTO project_images (id, project_id, image_url, alt_text, display_order)
          VALUES (${imgId}, ${p.id}, ${img}, ${p.title}, ${si + 1})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }
  }
  log.push(`Verified ${PROJECTS.length} projects`);

  // 4. Seed creative works
  for (let i = 0; i < CREATIVE_ITEMS.length; i++) {
    const item = CREATIVE_ITEMS[i];
    await sql`
      INSERT INTO creative_works (
        id, title, category, description, thumbnail_url,
        full_image_url, video_url, external_url, youtube_id,
        tools_used, deliverables, is_published, display_order
      ) VALUES (
        ${item.id},
        ${item.title},
        ${item.category},
        ${item.shortDescription},
        ${item.thumbnail},
        ${item.fullImage || item.thumbnail},
        ${item.youtubeUrl || null},
        ${item.youtubeUrl || null},
        ${item.youtubeId || null},
        ${JSON.stringify(item.toolsUsed || [])}::jsonb,
        ${JSON.stringify(item.deliverables || [])}::jsonb,
        true,
        ${i + 1}
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }
  log.push(`Verified ${CREATIVE_ITEMS.length} creative works`);

  // 5. Seed services
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    await sql`
      INSERT INTO services (
        id, title, description, icon, features, is_published, display_order
      ) VALUES (
        ${s.id},
        ${s.title},
        ${s.description},
        ${s.iconName || 'Globe'},
        ${JSON.stringify(s.highlights || [])}::jsonb,
        true,
        ${i + 1}
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }
  log.push(`Verified ${SERVICES.length} services`);

  // 6. Seed pricing plans
  for (let i = 0; i < PRICING_PLANS.length; i++) {
    const p = PRICING_PLANS[i];
    await sql`
      INSERT INTO pricing_plans (
        id, name, starting_price_bdt, price_display, description,
        features, delivery_time, badge, is_popular, is_published, display_order
      ) VALUES (
        ${p.id},
        ${p.name},
        ${p.price.replace(/[^\d]/g, '')},
        ${p.price},
        ${p.subtitle},
        ${JSON.stringify(p.features || [])}::jsonb,
        ${p.turnaroundTime},
        ${p.isRecommended ? 'Most Popular' : null},
        ${!!p.isRecommended},
        true,
        ${i + 1}
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }
  log.push(`Verified ${PRICING_PLANS.length} pricing plans`);

  // 7. Seed add-ons
  for (let i = 0; i < ADDON_SERVICES.length; i++) {
    const addon = ADDON_SERVICES[i];
    await sql`
      INSERT INTO add_ons (
        id, name, starting_price_bdt, description, is_published, display_order
      ) VALUES (
        ${addon.id},
        ${addon.name},
        ${addon.price},
        ${addon.description},
        true,
        ${i + 1}
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }
  log.push(`Verified ${ADDON_SERVICES.length} add-ons`);

  // 8. Seed testimonials
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i];
    await sql`
      INSERT INTO testimonials (
        id, client_name, business_type, rating, quote, avatar_url, project_title, is_published, display_order
      ) VALUES (
        ${t.id},
        ${t.name},
        ${t.businessType || t.role || 'Client'},
        ${t.rating || 5},
        ${t.quote},
        ${t.avatar || '/images/brand/happy-person-mascot.webp'},
        ${t.role || ''},
        true,
        ${i + 1}
      ) ON CONFLICT (id) DO NOTHING;
    `;
  }
  log.push(`Verified ${TESTIMONIALS.length} testimonials`);

  // 9. Seed FAQs
  for (let i = 0; i < FAQ_ITEMS.length; i++) {
    const f = FAQ_ITEMS[i];
    const fid = `faq-${i + 1}`;
    await sql`
      INSERT INTO faqs (id, question, answer, display_order)
      VALUES (${fid}, ${f.question}, ${f.answer}, ${i + 1})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  log.push(`Verified ${FAQ_ITEMS.length} FAQs`);

  // 10. Seed Admin user if table is empty
  const adminCount = await sql`SELECT count(*)::int as count FROM admin_users;`;
  if (adminCount[0]?.count === 0) {
    const email = adminDefaultEmail || 'happyperson7410@gmail.com';
    const rawPass = adminDefaultPassword || 'Admin@HappyPerson2026';
    const hash = await bcrypt.hash(rawPass, 10);
    const adminId = `admin-${Date.now()}`;
    await sql`
      INSERT INTO admin_users (id, email, password_hash, role)
      VALUES (${adminId}, ${email}, ${hash}, 'admin');
    `;
    log.push(`Created initial admin user: ${email}`);
  } else {
    log.push('Admin user already exists');
  }

  // 11. Normalize and migrate legacy image paths in existing database records
  try {
    await sql`
      UPDATE site_settings
      SET og_image_url = '/images/banners/og-preview.webp'
      WHERE og_image_url LIKE '%happy_person_banner%' OR og_image_url LIKE '%happy_person_og_banner%';
    `;

    await sql`
      UPDATE projects
      SET thumbnail_url = CASE
        WHEN thumbnail_url LIKE '%dental_clinic%' THEN '/images/projects/dental-clinic-hero.webp'
        WHEN thumbnail_url LIKE '%restaurant%' THEN '/images/projects/restaurant-hero.webp'
        WHEN thumbnail_url LIKE '%realestate%' THEN '/images/projects/real-estate-hero.webp'
        WHEN thumbnail_url LIKE '%saas_dashboard%' THEN '/images/projects/saas-dashboard-hero.webp'
        ELSE thumbnail_url
      END
      WHERE thumbnail_url LIKE '%dental_clinic_mockup%'
         OR thumbnail_url LIKE '%restaurant_mockup%'
         OR thumbnail_url LIKE '%realestate_mockup%'
         OR thumbnail_url LIKE '%saas_dashboard_mockup%';
    `;

    await sql`
      UPDATE project_images
      SET image_url = CASE
        WHEN image_url LIKE '%dental_clinic%' THEN '/images/projects/dental-clinic-hero.webp'
        WHEN image_url LIKE '%restaurant%' THEN '/images/projects/restaurant-hero.webp'
        WHEN image_url LIKE '%realestate%' THEN '/images/projects/real-estate-hero.webp'
        WHEN image_url LIKE '%saas_dashboard%' THEN '/images/projects/saas-dashboard-hero.webp'
        WHEN image_url LIKE '%happy_person_banner%' THEN '/images/banners/happy-person-banner.webp'
        ELSE image_url
      END
      WHERE image_url LIKE '%_mockup_%' OR image_url LIKE '%happy_person_banner%';
    `;

    await sql`
      UPDATE creative_works
      SET thumbnail_url = CASE
        WHEN id = 'logo-happy-mascot' THEN '/images/creative/logo-brand-01.webp'
        WHEN id = 'banner-taskflow-launch' THEN '/images/creative/saas-ui-concept.webp'
        WHEN id = 'banner-happy-studio' THEN '/images/banners/happy-person-banner.webp'
        WHEN id = 'ai-vid-mascot-animation' THEN '/images/creative/ai-video-thumb-01.webp'
        WHEN id = 'ai-vid-interface-tour' THEN '/images/creative/ai-video-thumb-02.webp'
        ELSE thumbnail_url
      END
      WHERE thumbnail_url LIKE '%/images/happy_person_%'
         OR thumbnail_url LIKE '%/images/saas_dashboard_%'
         OR thumbnail_url LIKE '%/images/realestate_%';
    `;

    await sql`
      UPDATE testimonials
      SET avatar_url = '/images/brand/happy-person-mascot.webp'
      WHERE avatar_url LIKE '%happy_person_mascot_%';
    `;
    log.push('Normalized database image URLs to relative public paths');
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    log.push(`Image URL normalization note: ${errorMsg}`);
  }

  return { success: true, log };
}
