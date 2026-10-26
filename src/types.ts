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
  slug?: string;
  title: string;
  category: Exclude<ProjectCategory, 'All'>;
  description: string;
  tags: string[];
  thumbnail: string;
  thumbnail_url?: string;
  previewVideoUrl?: string;
  liveDemoUrl: string;
  githubUrl?: string;
  problem?: string;
  solution?: string;
  features?: string[];
  screenshots?: string[];
  client?: string;
  role?: string;
  year?: string;
  completionDate?: string;
  duration?: string;
  techStack?: string[];
  impactMetrics?: { label: string; value: string }[];
  featured?: boolean;
  hidden?: boolean;
  order?: number;
  displayOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  id: string;
  title: string;
  category?: string;
  description: string;
  shortDescription?: string;
  fullDescription?: string;
  icon?: string;
  iconName?: string;
  features?: string[];
  deliverables?: string[];
  startingPrice?: string;
  turnaround?: string;
  highlights?: string[];
  order?: number;
  displayOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  clientName?: string;
  role: string;
  clientRole?: string;
  clientCompany?: string;
  clientAvatar?: string;
  businessType?: string;
  rating: number;
  quote: string;
  projectTitle?: string;
  avatar?: string;
  location?: string;
  verified?: boolean;
  order?: number;
  displayOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  subtitle?: string;
  tag?: string;
  period?: string;
  description?: string;
  popular?: boolean;
  badge?: string;
  features: string[];
  notIncluded?: string[];
  ctaText?: string;
  ctaLink?: string;
  isRecommended?: boolean;
  serviceCategory?: string;
  turnaroundTime?: string;
  order?: number;
  displayOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddonService {
  id: string;
  name: string;
  price: string;
  unit?: string;
  description?: string;
  displayOrder?: number;
  isPublished?: boolean;
}

export interface FaqItem {
  id?: string;
  question: string;
  answer: string;
  order?: number;
  displayOrder?: number;
  isPublished?: boolean;
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
  isAvailableForProjects?: boolean;
  socials: {
    facebook: string;
    whatsapp: string;
    messenger: string;
    email?: string;
  };
  skills: string[];
  quickFacts?: QuickFact[];
}
