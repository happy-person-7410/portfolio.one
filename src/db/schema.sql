-- Happy Person Creative Studio Database Schema (Idempotent for Neon PostgreSQL)

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

CREATE TABLE IF NOT EXISTS project_images (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS project_features (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  feature_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS add_ons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  starting_price_bdt TEXT,
  description TEXT,
  is_published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
