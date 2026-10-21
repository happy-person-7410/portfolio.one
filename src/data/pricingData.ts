import { PricingPlan, AddonService } from '../types';

/**
 * ===================================================================
 * SINGLE PRICING CONFIGURATION FILE (BDT ONLY)
 * All packages, add-on services, starting rates, and pricing disclaimers
 * can be edited right here in this file.
 * ===================================================================
 */

export const PRICING_CURRENCY = '৳';

export const PRICING_DISCLAIMER_NOTE = 
  "Final price depends on the number of pages, features, content, integrations, and deadline. Message on Messenger for a free quote.";

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter-landing",
    name: "Starter Landing Page",
    price: "৳5,000",
    subtitle: "Ideal for product campaigns, promotions, and local service businesses needing a fast, high-converting one-page presence.",
    turnaroundTime: "Minimum 3 working days",
    serviceCategory: "Landing Page Design",
    isRecommended: false,
    order: 1,
    features: [
      "One-page responsive website",
      "Modern UI & clean typography",
      "Contact / Messenger CTA integration",
      "Basic SEO setup & meta tags",
      "2 revision rounds",
      "Minimum delivery: 3 working days"
    ]
  },
  {
    id: "business-website",
    name: "Business Website",
    price: "৳15,000",
    subtitle: "Comprehensive multi-page website designed to establish credibility, showcase services, and capture customer inquiries.",
    turnaroundTime: "1 to 2 weeks",
    serviceCategory: "Website Design & Development",
    isRecommended: true,
    order: 2,
    features: [
      "Up to 5 pages (Home, About, Services, Gallery, Contact)",
      "Custom responsive design for all screen sizes",
      "Services, gallery, about, and contact sections",
      "Messenger / WhatsApp contact integration",
      "Basic SEO setup & search indexing readiness",
      "2 revision rounds"
    ]
  },
  {
    id: "booking-custom",
    name: "Booking / Custom Website",
    price: "৳25,000",
    subtitle: "Tailored web solution with appointment booking, clinic systems, property listings, or custom interactive dashboards.",
    turnaroundTime: "2 to 3 weeks",
    serviceCategory: "Booking & Appointment Website",
    isRecommended: false,
    order: 3,
    features: [
      "Booking or appointment flow",
      "Custom features based on business needs",
      "Admin / dashboard option if required",
      "Backend integration quoted separately",
      "Final price depends on features and complexity"
    ]
  }
];

export const ADDON_SERVICES: AddonService[] = [
  {
    id: "addon-logo",
    name: "Logo Design",
    price: "৳1,500",
    unit: "starting from",
    description: "Custom vector brand logo with color palette and transparent PNG/SVG formats."
  },
  {
    id: "addon-social-banner",
    name: "Social Media Banner",
    price: "৳500",
    unit: "per design",
    description: "High-impact Facebook page covers, promotional ad banners, or social headers."
  },
  {
    id: "addon-ai-image",
    name: "AI Product Image",
    price: "৳300",
    unit: "per image",
    description: "Photorealistic AI product photography, mockups, and enhanced background visuals."
  },
  {
    id: "addon-ai-video",
    name: "AI Promotional Video",
    price: "৳2,000",
    unit: "starting from",
    description: "Short cinematic promotional motion clip tailored for social media & website heroes."
  },
  {
    id: "addon-extra-page",
    name: "Extra Page",
    price: "৳2,500",
    unit: "per page",
    description: "Additional custom-designed and coded responsive subpage matching your design."
  },
  {
    id: "addon-revision",
    name: "Extra Revision Round",
    price: "৳1,000",
    unit: "per round",
    description: "Additional round of design or content tweaks beyond the included package scope."
  },
  {
    id: "addon-maintenance",
    name: "Website Maintenance",
    price: "৳2,000",
    unit: "per month",
    description: "Regular backups, content updates, security checks, and priority support."
  }
];
