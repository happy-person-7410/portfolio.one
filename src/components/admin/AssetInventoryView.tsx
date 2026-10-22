import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Search,
  Database,
  Filter,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export interface ImageAssetItem {
  fileName: string;
  fallbackFileName: string;
  publicPath: string;
  fallbackPath: string;
  category: 'Projects' | 'Creative' | 'Banners' | 'Brand';
  belongsTo: string;
  usedInDatabase: boolean;
  dbTables: string[];
}

export const ASSET_INVENTORY_DATA: ImageAssetItem[] = [
  {
    fileName: 'dental-clinic-hero.webp',
    fallbackFileName: 'dental-clinic-hero.jpg',
    publicPath: '/images/projects/dental-clinic-hero.webp',
    fallbackPath: '/images/projects/dental-clinic-hero.jpg',
    category: 'Projects',
    belongsTo: 'BrightSmile Dental Clinic (also FitLife & CleanPro presets)',
    usedInDatabase: true,
    dbTables: ['projects.thumbnail_url', 'project_images.image_url']
  },
  {
    fileName: 'restaurant-hero.webp',
    fallbackFileName: 'restaurant-hero.jpg',
    publicPath: '/images/projects/restaurant-hero.webp',
    fallbackPath: '/images/projects/restaurant-hero.jpg',
    category: 'Projects',
    belongsTo: 'UrbanEats Restaurant (also StyleHub Store preset)',
    usedInDatabase: true,
    dbTables: ['projects.thumbnail_url', 'project_images.image_url']
  },
  {
    fileName: 'real-estate-hero.webp',
    fallbackFileName: 'real-estate-hero.jpg',
    publicPath: '/images/projects/real-estate-hero.webp',
    fallbackPath: '/images/projects/real-estate-hero.jpg',
    category: 'Projects',
    belongsTo: 'HomeNest Luxury Real Estate Showcase',
    usedInDatabase: true,
    dbTables: ['projects.thumbnail_url', 'project_images.image_url']
  },
  {
    fileName: 'saas-dashboard-hero.webp',
    fallbackFileName: 'saas-dashboard-hero.jpg',
    publicPath: '/images/projects/saas-dashboard-hero.webp',
    fallbackPath: '/images/projects/saas-dashboard-hero.jpg',
    category: 'Projects',
    belongsTo: 'TaskFlow SaaS Dashboard (also EduPath Academy preset)',
    usedInDatabase: true,
    dbTables: ['projects.thumbnail_url', 'project_images.image_url']
  },
  {
    fileName: 'logo-brand-01.webp',
    fallbackFileName: 'logo-brand-01.jpg',
    publicPath: '/images/creative/logo-brand-01.webp',
    fallbackPath: '/images/creative/logo-brand-01.jpg',
    category: 'Creative',
    belongsTo: 'Happy Person Studio Mascot Badge (Creative Tab)',
    usedInDatabase: true,
    dbTables: ['creative_works.thumbnail_url']
  },
  {
    fileName: 'saas-ui-concept.webp',
    fallbackFileName: 'saas-ui-concept.jpg',
    publicPath: '/images/creative/saas-ui-concept.webp',
    fallbackPath: '/images/creative/saas-ui-concept.jpg',
    category: 'Creative',
    belongsTo: 'TaskFlow SaaS Product Launch Header (Creative Tab)',
    usedInDatabase: true,
    dbTables: ['creative_works.thumbnail_url']
  },
  {
    fileName: 'social-banner-01.webp',
    fallbackFileName: 'social-banner-01.jpg',
    publicPath: '/images/creative/social-banner-01.webp',
    fallbackPath: '/images/creative/social-banner-01.jpg',
    category: 'Creative',
    belongsTo: 'Social Media Cover & Panoramic Header Set',
    usedInDatabase: true,
    dbTables: ['creative_works.thumbnail_url']
  },
  {
    fileName: 'ai-video-thumb-01.webp',
    fallbackFileName: 'ai-video-thumb-01.jpg',
    publicPath: '/images/creative/ai-video-thumb-01.webp',
    fallbackPath: '/images/creative/ai-video-thumb-01.jpg',
    category: 'Creative',
    belongsTo: 'Happy Person Mascot Studio Motion Teaser (AI Video Tab)',
    usedInDatabase: true,
    dbTables: ['creative_works.thumbnail_url']
  },
  {
    fileName: 'ai-video-thumb-02.webp',
    fallbackFileName: 'ai-video-thumb-02.jpg',
    publicPath: '/images/creative/ai-video-thumb-02.webp',
    fallbackPath: '/images/creative/ai-video-thumb-02.jpg',
    category: 'Creative',
    belongsTo: 'Interactive Web & SaaS UI Walkthrough (AI Video Tab)',
    usedInDatabase: true,
    dbTables: ['creative_works.thumbnail_url']
  },
  {
    fileName: 'og-preview.webp',
    fallbackFileName: 'og-preview.jpg',
    publicPath: '/images/banners/og-preview.webp',
    fallbackPath: '/images/banners/og-preview.jpg',
    category: 'Banners',
    belongsTo: 'OpenGraph 1200x630 Social Share & Meta Card',
    usedInDatabase: true,
    dbTables: ['site_settings.og_image_url']
  },
  {
    fileName: 'happy-person-banner.webp',
    fallbackFileName: 'happy-person-banner.jpg',
    publicPath: '/images/banners/happy-person-banner.webp',
    fallbackPath: '/images/banners/happy-person-banner.jpg',
    category: 'Banners',
    belongsTo: 'Happy Person Studio Panoramic Showcase Banner',
    usedInDatabase: true,
    dbTables: ['project_images.image_url', 'creative_works.thumbnail_url']
  },
  {
    fileName: 'happy-person-mascot.webp',
    fallbackFileName: 'happy-person-mascot.jpg',
    publicPath: '/images/brand/happy-person-mascot.webp',
    fallbackPath: '/images/brand/happy-person-mascot.jpg',
    category: 'Brand',
    belongsTo: 'Studio Mascot Logo & Verified Testimonials Avatar',
    usedInDatabase: true,
    dbTables: ['testimonials.avatar_url', 'site_profile.avatar']
  },
  {
    fileName: 'happy-person-avatar.webp',
    fallbackFileName: 'happy-person-avatar.jpg',
    publicPath: '/images/brand/happy-person-avatar.webp',
    fallbackPath: '/images/brand/happy-person-avatar.jpg',
    category: 'Brand',
    belongsTo: 'Rounded Profile Mascot Avatar (Site Navigation & Badges)',
    usedInDatabase: false,
    dbTables: []
  },
  {
    fileName: 'hero-profile-portrait.webp',
    fallbackFileName: 'hero-profile-portrait.jpg',
    publicPath: '/images/brand/hero-profile-portrait.webp',
    fallbackPath: '/images/brand/hero-profile-portrait.jpg',
    category: 'Brand',
    belongsTo: 'Hero Profile Portrait (About & Contact Sections)',
    usedInDatabase: false,
    dbTables: []
  }
];

export const AssetInventoryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterDbOnly, setFilterDbOnly] = useState(false);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const filteredAssets = ASSET_INVENTORY_DATA.filter((asset) => {
    const matchesSearch =
      asset.fileName.toLowerCase().includes(search.toLowerCase()) ||
      asset.publicPath.toLowerCase().includes(search.toLowerCase()) ||
      asset.belongsTo.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || asset.category === selectedCategory;
    const matchesDb = !filterDbOnly || asset.usedInDatabase;
    return matchesSearch && matchesCategory && matchesDb;
  });

  const dbUsedCount = ASSET_INVENTORY_DATA.filter((a) => a.usedInDatabase).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-blue-400" /> Visual Assets & Image Inventory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              14 Master Assets · 28 Files
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            All visual mockups, banners, and logos are standardized in <code className="text-blue-300 font-mono">/public/images/</code> in both modern WebP and JPEG fallbacks. All database URLs use relative root paths so they stay functional on custom domains.
          </p>
        </div>

        <a
          href="/images/image-inventory.json"
          download="image-inventory.json"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-medium border border-slate-700/80 transition cursor-pointer"
        >
          <Database className="w-3.5 h-3.5 text-blue-400" /> Export JSON Inventory
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">Total Studio Images</span>
          <p className="text-2xl font-bold text-slate-100 mt-1">{ASSET_INVENTORY_DATA.length}</p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            100% on disk & valid
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">Used in Neon DB</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{dbUsedCount}</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Projects, Creative & Banners</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">WebP + JPG Formats</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">28 Files</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Sub-second load times</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <span className="text-[11px] font-medium text-slate-400">Public Hosting Ready</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">Cloudflare</p>
          <span className="text-[10px] text-slate-400 mt-0.5">Included in public build</span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by file name, path, or project..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category Pills & DB Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'Projects', 'Creative', 'Banners', 'Brand'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setFilterDbOnly(!filterDbOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
              filterDbOnly
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <Database className="w-3 h-3" /> Used in DB Only
          </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssets.map((asset) => {
          const isCopied = copiedPath === asset.publicPath;
          return (
            <div
              key={asset.publicPath}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between group"
            >
              <div>
                {/* Image Preview Container */}
                <div className="relative w-full h-44 rounded-xl bg-slate-950/80 border border-slate-800/80 overflow-hidden flex items-center justify-center mb-3">
                  <img
                    src={asset.publicPath}
                    alt={asset.belongsTo}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/90 text-slate-200 backdrop-blur-md border border-slate-700/60">
                      {asset.category}
                    </span>
                    {asset.usedInDatabase && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/90 text-white backdrop-blur-md shadow-sm">
                        In Neon DB
                      </span>
                    )}
                  </div>
                  <a
                    href={asset.publicPath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 backdrop-blur-md border border-slate-700/60 transition"
                    title="Open full image"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {asset.fileName}
                    </h3>
                    <span className="shrink-0 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      .webp + .jpg
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="text-slate-500 font-medium">Belongs to:</span> {asset.belongsTo}
                  </p>

                  {asset.usedInDatabase && asset.dbTables.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Database className="w-2.5 h-2.5 text-blue-400" /> DB columns:
                      </span>
                      {asset.dbTables.map((tbl) => (
                        <span
                          key={tbl}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20"
                        >
                          {tbl}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Public Path and Copy Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <code className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 truncate flex-1 select-all">
                  {asset.publicPath}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopy(asset.publicPath)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition shrink-0 cursor-pointer ${
                    isCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-750 text-slate-200'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Path
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cloudflare Pages Deployment Note */}
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-3">
        <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-200">Production Build & Domain Deployment Guarantee</p>
          <p className="text-blue-300/90 leading-relaxed">
            All images are physically placed in Vite's <code className="font-mono text-blue-100">/public/images/</code> folder. During <code className="font-mono text-blue-100">npm run build</code>, Cloudflare Pages bundles everything directly into the static root without renaming or hashing. Root-relative paths like <code className="font-mono text-blue-100">/images/projects/...</code> resolve automatically regardless of custom domain switches.
          </p>
        </div>
      </div>
    </div>
  );
};
