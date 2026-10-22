# Happy Person Studio · Visual Asset Inventory & Database Mapping

This document provides a complete inventory of all project, creative, banner, and brand images organized according to clean, lowercase, hyphenated public directory conventions.

## 1. Directory Structure

All visual assets reside in the `/public/images/` tree:

```
/public/images/
├── projects/      # Portfolio project heroes & screenshot mockups
├── creative/      # Creative work showcases, logos, banners, video thumbs
├── banners/       # Open Graph social preview cards & wide banners
└── brand/         # Studio brand mascots, avatars, and portraits
```

Each asset is provided in both **WebP** (modern high-compression format) and **JPEG** (fallback).

---

## 2. Asset Inventory Table

| File Name | Public Path | Category | Associated Project / Creative Item | Used in DB? | Neon PostgreSQL Reference |
|-----------|-------------|----------|-------------------------------------|:-----------:|---------------------------|
| `dental-clinic-hero.webp` | `/images/projects/dental-clinic-hero.webp` | Projects | BrightSmile Dental Clinic | Yes | `projects.thumbnail_url`, `project_images.image_url` |
| `restaurant-hero.webp` | `/images/projects/restaurant-hero.webp` | Projects | UrbanEats Restaurant | Yes | `projects.thumbnail_url`, `project_images.image_url` |
| `real-estate-hero.webp` | `/images/projects/real-estate-hero.webp` | Projects | HomeNest Luxury Real Estate | Yes | `projects.thumbnail_url`, `project_images.image_url` |
| `saas-dashboard-hero.webp` | `/images/projects/saas-dashboard-hero.webp` | Projects | TaskFlow SaaS Dashboard | Yes | `projects.thumbnail_url`, `project_images.image_url` |
| `logo-brand-01.webp` | `/images/creative/logo-brand-01.webp` | Creative | Happy Person Mascot Badge | Yes | `creative_works.thumbnail_url` |
| `saas-ui-concept.webp` | `/images/creative/saas-ui-concept.webp` | Creative | TaskFlow Product Launch Header | Yes | `creative_works.thumbnail_url` |
| `social-banner-01.webp` | `/images/creative/social-banner-01.webp` | Creative | Social Media Showcase Banner | Yes | `creative_works.thumbnail_url` |
| `ai-video-thumb-01.webp` | `/images/creative/ai-video-thumb-01.webp` | Creative | Happy Person Mascot Motion Teaser | Yes | `creative_works.thumbnail_url` |
| `ai-video-thumb-02.webp` | `/images/creative/ai-video-thumb-02.webp` | Creative | Interactive Web & SaaS Walkthrough | Yes | `creative_works.thumbnail_url` |
| `og-preview.webp` | `/images/banners/og-preview.webp` | Banners | 1200x630 OpenGraph / Twitter Card | Yes | `site_settings.og_image_url` |
| `happy-person-banner.webp` | `/images/banners/happy-person-banner.webp` | Banners | Studio Panoramic Showcase | Yes | `creative_works.thumbnail_url`, `project_images.image_url` |
| `happy-person-mascot.webp` | `/images/brand/happy-person-mascot.webp` | Brand | Happy Person Brand Mascot | Yes | `testimonials.avatar_url`, `PROFILE_INFO.avatar` |
| `happy-person-avatar.webp` | `/images/brand/happy-person-avatar.webp` | Brand | Rounded Studio Mascot Avatar | No (Static) | UI profile badge alternative |
| `hero-profile-portrait.webp` | `/images/brand/hero-profile-portrait.webp` | Brand | Profile Hero Portrait | No (Static) | About section portrait alternative |

---

## 3. Deployment & Domain Portability Rules

1. **Relative Root Paths:** All references use `/images/...` relative root URLs, ensuring complete domain portability across Cloudflare Pages, custom domain apexes, and preview URLs without breaking.
2. **Static Public Serving:** All files are copied to the build artifact root by Vite/Cloudflare Pages.
3. **No Database Binaries:** Neon PostgreSQL only stores the structured string URL paths.
4. **Preserved Legacy Files:** Original image files remain safely archived on disk.
