/**
 * Portfolio Data Service for Happy Person Creative Studio.
 * Interfaces with the secure server-side Neon PostgreSQL API.
 */

import { Project, Service, PricingPlan, Testimonial, FaqItem, SiteProfile } from '../types';
import {
  PROJECTS as DEFAULT_PROJECTS,
  SERVICES as DEFAULT_SERVICES,
  PRICING_PLANS as DEFAULT_PRICING,
  TESTIMONIALS as DEFAULT_TESTIMONIALS,
  FAQ_ITEMS as DEFAULT_FAQS,
  PROFILE_INFO as DEFAULT_PROFILE,
} from '../data/portfolioData';

// Re-seed database with default rich portfolio data
export async function forceSeedDatabase(): Promise<void> {
  const res = await fetch('/api/db/seed', { method: 'POST' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to re-seed database');
  }
}

export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const projects = await fetchProjects();
    if (projects.length === 0) {
      await forceSeedDatabase();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not auto-seed database:', err);
    return false;
  }
}

// ----------------- Projects API -----------------

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) return DEFAULT_PROJECTS;
    const data = await res.json();
    return data && data.length > 0 ? data : DEFAULT_PROJECTS;
  } catch (err) {
    console.warn('Failed to fetch projects, using defaults:', err);
    return DEFAULT_PROJECTS;
  }
}

export function subscribeToProjects(
  onSuccess: (projects: Project[]) => void,
  onError?: (error: unknown) => void
) {
  let active = true;
  fetchProjects()
    .then((projects) => {
      if (active) onSuccess(projects);
    })
    .catch((err) => {
      if (active) {
        if (onError) onError(err);
        onSuccess(DEFAULT_PROJECTS);
      }
    });

  // Polling fallback to keep admin changes in sync
  const interval = setInterval(async () => {
    try {
      const data = await fetchProjects();
      if (active) onSuccess(data);
    } catch (e) {
      // keep previous state
    }
  }, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveProject(project: Project): Promise<void> {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save project');
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete project');
  }
}

// ----------------- Services API -----------------

export async function fetchServices(): Promise<Service[]> {
  try {
    const res = await fetch('/api/services');
    if (!res.ok) return DEFAULT_SERVICES;
    const data = await res.json();
    return data && data.length > 0 ? data : DEFAULT_SERVICES;
  } catch (err) {
    return DEFAULT_SERVICES;
  }
}

export function subscribeToServices(
  onSuccess: (services: Service[]) => void,
  onError?: (error: unknown) => void
) {
  let active = true;
  fetchServices()
    .then((services) => {
      if (active) onSuccess(services);
    })
    .catch((err) => {
      if (active) {
        if (onError) onError(err);
        onSuccess(DEFAULT_SERVICES);
      }
    });

  const interval = setInterval(async () => {
    try {
      const data = await fetchServices();
      if (active) onSuccess(data);
    } catch (e) {}
  }, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveService(service: Service): Promise<void> {
  const res = await fetch('/api/services', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(service),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save service');
  }
}

// ----------------- Pricing Plans API -----------------

export async function fetchPricing(): Promise<PricingPlan[]> {
  try {
    const res = await fetch('/api/pricing');
    if (!res.ok) return DEFAULT_PRICING;
    const data = await res.json();
    return data && data.length > 0 ? data : DEFAULT_PRICING;
  } catch (err) {
    return DEFAULT_PRICING;
  }
}

export function subscribeToPricing(
  onSuccess: (plans: PricingPlan[]) => void,
  onError?: (error: unknown) => void
) {
  let active = true;
  fetchPricing()
    .then((plans) => {
      if (active) onSuccess(plans);
    })
    .catch((err) => {
      if (active) {
        if (onError) onError(err);
        onSuccess(DEFAULT_PRICING);
      }
    });

  const interval = setInterval(async () => {
    try {
      const data = await fetchPricing();
      if (active) onSuccess(data);
    } catch (e) {}
  }, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function savePricingPlan(plan: PricingPlan): Promise<void> {
  const res = await fetch('/api/pricing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save pricing plan');
  }
}

// ----------------- Testimonials API -----------------

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch('/api/testimonials');
    if (!res.ok) return DEFAULT_TESTIMONIALS;
    const data = await res.json();
    return data && data.length > 0 ? data : DEFAULT_TESTIMONIALS;
  } catch (err) {
    return DEFAULT_TESTIMONIALS;
  }
}

export function subscribeToTestimonials(
  onSuccess: (items: Testimonial[]) => void,
  onError?: (error: unknown) => void
) {
  let active = true;
  fetchTestimonials()
    .then((items) => {
      if (active) onSuccess(items);
    })
    .catch((err) => {
      if (active) {
        if (onError) onError(err);
        onSuccess(DEFAULT_TESTIMONIALS);
      }
    });

  const interval = setInterval(async () => {
    try {
      const data = await fetchTestimonials();
      if (active) onSuccess(data);
    } catch (e) {}
  }, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const res = await fetch('/api/testimonials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testimonial),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save testimonial');
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const res = await fetch(`/api/testimonials/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete testimonial');
  }
}

// ----------------- FAQs API -----------------

export async function fetchFaqs(): Promise<FaqItem[]> {
  try {
    const res = await fetch('/api/faqs');
    if (!res.ok) return DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 }));
    const data = await res.json();
    return data && data.length > 0 ? data : DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 }));
  } catch (err) {
    return DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 }));
  }
}

export function subscribeToFaqs(
  onSuccess: (items: FaqItem[]) => void,
  onError?: (error: unknown) => void
) {
  let active = true;
  fetchFaqs()
    .then((items) => {
      if (active) onSuccess(items);
    })
    .catch((err) => {
      if (active) {
        if (onError) onError(err);
        onSuccess(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
      }
    });

  const interval = setInterval(async () => {
    try {
      const data = await fetchFaqs();
      if (active) onSuccess(data);
    } catch (e) {}
  }, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  const res = await fetch('/api/faqs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faq),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save FAQ');
  }
}

export async function deleteFaq(id: string): Promise<void> {
  const res = await fetch(`/api/faqs/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete FAQ');
  }
}

// ----------------- Site Settings / Profile API -----------------

export async function fetchSiteProfile(): Promise<SiteProfile> {
  try {
    const res = await fetch('/api/settings/profile');
    if (!res.ok) return DEFAULT_PROFILE;
    const data = await res.json();
    return data && data.brandName ? data : DEFAULT_PROFILE;
  } catch (err) {
    return DEFAULT_PROFILE;
  }
}

export function subscribeToSiteProfile(
  onSuccess: (profile: SiteProfile) => void,
  onError?: (error: unknown) => void
) {
  let active = true;
  fetchSiteProfile()
    .then((profile) => {
      if (active) onSuccess(profile);
    })
    .catch((err) => {
      if (active) {
        if (onError) onError(err);
        onSuccess(DEFAULT_PROFILE);
      }
    });

  const interval = setInterval(async () => {
    try {
      const data = await fetchSiteProfile();
      if (active) onSuccess(data);
    } catch (e) {}
  }, 10000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function saveSiteProfile(profile: Partial<SiteProfile>): Promise<void> {
  const res = await fetch('/api/settings/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save profile');
  }
}
