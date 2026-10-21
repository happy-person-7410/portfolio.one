export type ProjectCategory = 
  | 'All'
  | 'Business Website'
  | 'Booking Website'
  | 'Restaurant'
  | 'Real Estate'
  | 'E-commerce'
  | 'Dashboard UI';

export interface Project {
  id: string;
  title: string;
  category: Exclude<ProjectCategory, 'All'>;
  description: string;
  tags: string[];
  thumbnail: string;
  previewVideoUrl?: string;
  liveDemoUrl: string;
  problem: string;
  solution: string;
  features: string[];
  screenshots: string[];
  client: string;
  duration: string;
  impactMetrics?: { label: string; value: string }[];
  featured?: boolean;
  hidden?: boolean;
  order?: number;
  updatedAt?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  highlights: string[];
  order?: number;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  businessType: string;
  rating: number;
  quote: string;
  avatar: string;
  location: string;
  order?: number;
  updatedAt?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  subtitle: string;
  features: string[];
  isRecommended: boolean;
  serviceCategory: string;
  turnaroundTime: string;
  order?: number;
  updatedAt?: string;
}

export interface AddonService {
  id: string;
  name: string;
  price: string;
  unit?: string;
  description?: string;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  order?: number;
  updatedAt?: string;
}

export interface QuickFact {
  label: string;
  title: string;
  desc: string;
}

export interface SiteProfile {
  name: string;
  brandName: string;
  studioType: string;
  shortName: string;
  title: string;
  headline: string;
  subheading: string;
  bio: string;
  avatar: string;
  ogBanner: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  whatsappUrl: string;
  facebookPageUrl: string;
  messengerUrl: string;
  whatsapp: string;
  location: string;
  availability: string;
  socials: {
    facebook: string;
    whatsapp: string;
    messenger: string;
    email?: string;
  };
  skills: string[];
  quickFacts?: QuickFact[];
}
