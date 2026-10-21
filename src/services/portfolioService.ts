/**
 * Portfolio Data Service for Happy Person Creative Studio.
 * Frontend-only service managing portfolio state and local storage persistence.
 *
 * NOTE: Backend Integration Point:
 * When you are ready to connect a real backend (e.g., REST API, Server Actions, or DB client),
 * you can replace the local storage read/write calls in this file with your network requests
 * without needing to redesign the UI or component layers.
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

// Local storage keys
const STORAGE_KEYS = {
  PROJECTS: 'hp_portfolio_projects',
  SERVICES: 'hp_portfolio_services',
  PRICING: 'hp_portfolio_pricing',
  TESTIMONIALS: 'hp_portfolio_testimonials',
  FAQS: 'hp_portfolio_faqs',
  PROFILE: 'hp_portfolio_profile',
} as const;

// Event listeners for instantaneous cross-component updates
type Listener<T> = (data: T) => void;

class ChangeNotifier {
  private projectListeners = new Set<Listener<Project[]>>();
  private serviceListeners = new Set<Listener<Service[]>>();
  private pricingListeners = new Set<Listener<PricingPlan[]>>();
  private testimonialListeners = new Set<Listener<Testimonial[]>>();
  private faqListeners = new Set<Listener<FaqItem[]>>();
  private profileListeners = new Set<Listener<SiteProfile>>();

  notifyProjects(data: Project[]) {
    this.projectListeners.forEach((fn) => fn(data));
  }
  notifyServices(data: Service[]) {
    this.serviceListeners.forEach((fn) => fn(data));
  }
  notifyPricing(data: PricingPlan[]) {
    this.pricingListeners.forEach((fn) => fn(data));
  }
  notifyTestimonials(data: Testimonial[]) {
    this.testimonialListeners.forEach((fn) => fn(data));
  }
  notifyFaqs(data: FaqItem[]) {
    this.faqListeners.forEach((fn) => fn(data));
  }
  notifyProfile(data: SiteProfile) {
    this.profileListeners.forEach((fn) => fn(data));
  }

  onProjects(fn: Listener<Project[]>) {
    this.projectListeners.add(fn);
    return () => this.projectListeners.delete(fn);
  }
  onServices(fn: Listener<Service[]>) {
    this.serviceListeners.add(fn);
    return () => this.serviceListeners.delete(fn);
  }
  onPricing(fn: Listener<PricingPlan[]>) {
    this.pricingListeners.add(fn);
    return () => this.pricingListeners.delete(fn);
  }
  onTestimonials(fn: Listener<Testimonial[]>) {
    this.testimonialListeners.add(fn);
    return () => this.testimonialListeners.delete(fn);
  }
  onFaqs(fn: Listener<FaqItem[]>) {
    this.faqListeners.add(fn);
    return () => this.faqListeners.delete(fn);
  }
  onProfile(fn: Listener<SiteProfile>) {
    this.profileListeners.add(fn);
    return () => this.profileListeners.delete(fn);
  }
}

const notifier = new ChangeNotifier();

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Failed to save to local storage (${key}):`, err);
  }
}

// ----------------- Projects API (Local Mock Data) -----------------

export async function fetchProjects(): Promise<Project[]> {
  const initial = DEFAULT_PROJECTS.map((p, i) => ({
    ...p,
    order: p.order || i + 1,
    featured: p.featured ?? i < 3,
    hidden: p.hidden ?? false,
  }));
  return readLocal<Project[]>(STORAGE_KEYS.PROJECTS, initial);
}

export function subscribeToProjects(
  onSuccess: (projects: Project[]) => void,
  _onError?: (error: unknown) => void
): () => void {
  fetchProjects().then(onSuccess);
  return notifier.onProjects(onSuccess);
}

export async function saveProject(project: Project): Promise<void> {
  const current = await fetchProjects();
  const existingIdx = current.findIndex((p) => p.id === project.id);
  let updated: Project[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...current[existingIdx],
      ...project,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const newProject: Project = {
      ...project,
      id: project.id || `proj-${Date.now()}`,
      order: project.order || current.length + 1,
      updatedAt: new Date().toISOString(),
    };
    updated = [newProject, ...current];
  }

  writeLocal(STORAGE_KEYS.PROJECTS, updated);
  notifier.notifyProjects(updated);
}

export async function deleteProject(projectId: string): Promise<void> {
  const current = await fetchProjects();
  const updated = current.filter((p) => p.id !== projectId);
  writeLocal(STORAGE_KEYS.PROJECTS, updated);
  notifier.notifyProjects(updated);
}

// ----------------- Services API (Local Mock Data) -----------------

export async function fetchServices(): Promise<Service[]> {
  const initial = DEFAULT_SERVICES.map((s, i) => ({
    ...s,
    order: s.order || i + 1,
  }));
  return readLocal<Service[]>(STORAGE_KEYS.SERVICES, initial);
}

export function subscribeToServices(
  onSuccess: (services: Service[]) => void,
  _onError?: (error: unknown) => void
): () => void {
  fetchServices().then(onSuccess);
  return notifier.onServices(onSuccess);
}

export async function saveService(service: Service): Promise<void> {
  const current = await fetchServices();
  const existingIdx = current.findIndex((s) => s.id === service.id);
  let updated: Service[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...current[existingIdx],
      ...service,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updated = [...current, { ...service, order: current.length + 1, updatedAt: new Date().toISOString() }];
  }

  writeLocal(STORAGE_KEYS.SERVICES, updated);
  notifier.notifyServices(updated);
}

// ----------------- Pricing Plans API (Local Mock Data) -----------------

export async function fetchPricing(): Promise<PricingPlan[]> {
  const initial = DEFAULT_PRICING.map((pr, i) => ({
    ...pr,
    order: pr.order || i + 1,
  }));
  const stored = readLocal<PricingPlan[]>(STORAGE_KEYS.PRICING, initial);
  if (stored && stored.some((p) => p.price && p.price.includes('$'))) {
    writeLocal(STORAGE_KEYS.PRICING, initial);
    return initial;
  }
  return stored;
}

export function subscribeToPricing(
  onSuccess: (plans: PricingPlan[]) => void,
  _onError?: (error: unknown) => void
): () => void {
  fetchPricing().then(onSuccess);
  return notifier.onPricing(onSuccess);
}

export async function savePricingPlan(plan: PricingPlan): Promise<void> {
  const current = await fetchPricing();
  const existingIdx = current.findIndex((p) => p.id === plan.id);
  let updated: PricingPlan[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...current[existingIdx],
      ...plan,
      updatedAt: new Date().toISOString(),
    };
  } else {
    updated = [...current, { ...plan, order: current.length + 1, updatedAt: new Date().toISOString() }];
  }

  writeLocal(STORAGE_KEYS.PRICING, updated);
  notifier.notifyPricing(updated);
}

// ----------------- Testimonials API (Local Mock Data) -----------------

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const initial = DEFAULT_TESTIMONIALS.map((t, i) => ({
    ...t,
    order: t.order || i + 1,
  }));
  return readLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, initial);
}

export function subscribeToTestimonials(
  onSuccess: (items: Testimonial[]) => void,
  _onError?: (error: unknown) => void
): () => void {
  fetchTestimonials().then(onSuccess);
  return notifier.onTestimonials(onSuccess);
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const current = await fetchTestimonials();
  const existingIdx = current.findIndex((t) => t.id === testimonial.id);
  let updated: Testimonial[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...current[existingIdx],
      ...testimonial,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const newT: Testimonial = {
      ...testimonial,
      id: testimonial.id || `test-${Date.now()}`,
      order: current.length + 1,
      updatedAt: new Date().toISOString(),
    };
    updated = [...current, newT];
  }

  writeLocal(STORAGE_KEYS.TESTIMONIALS, updated);
  notifier.notifyTestimonials(updated);
}

export async function deleteTestimonial(id: string): Promise<void> {
  const current = await fetchTestimonials();
  const updated = current.filter((t) => t.id !== id);
  writeLocal(STORAGE_KEYS.TESTIMONIALS, updated);
  notifier.notifyTestimonials(updated);
}

// ----------------- FAQs API (Local Mock Data) -----------------

export async function fetchFaqs(): Promise<FaqItem[]> {
  const initial = DEFAULT_FAQS.map((f, i) => ({
    id: `faq-${i + 1}`,
    question: f.question,
    answer: f.answer,
    order: i + 1,
  }));
  return readLocal<FaqItem[]>(STORAGE_KEYS.FAQS, initial);
}

export function subscribeToFaqs(
  onSuccess: (items: FaqItem[]) => void,
  _onError?: (error: unknown) => void
): () => void {
  fetchFaqs().then(onSuccess);
  return notifier.onFaqs(onSuccess);
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  const current = await fetchFaqs();
  const existingIdx = current.findIndex((f) => f.id === faq.id);
  let updated: FaqItem[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...current[existingIdx],
      ...faq,
      updatedAt: new Date().toISOString(),
    };
  } else {
    const newFaq: FaqItem = {
      ...faq,
      id: faq.id || `faq-${Date.now()}`,
      order: faq.order || current.length + 1,
      updatedAt: new Date().toISOString(),
    };
    updated = [...current, newFaq];
  }

  writeLocal(STORAGE_KEYS.FAQS, updated);
  notifier.notifyFaqs(updated);
}

export async function deleteFaq(id: string): Promise<void> {
  const current = await fetchFaqs();
  const updated = current.filter((f) => f.id !== id);
  writeLocal(STORAGE_KEYS.FAQS, updated);
  notifier.notifyFaqs(updated);
}

// ----------------- Site Settings / Profile (Local Mock Data) -----------------

export async function fetchSiteProfile(): Promise<SiteProfile> {
  const stored = readLocal<SiteProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  if (stored && (stored.email !== DEFAULT_PROFILE.email || stored.messengerUrl !== DEFAULT_PROFILE.messengerUrl)) {
    const updated: SiteProfile = {
      ...stored,
      email: DEFAULT_PROFILE.email,
      messengerUrl: DEFAULT_PROFILE.messengerUrl,
      whatsappNumber: DEFAULT_PROFILE.whatsappNumber,
      whatsappUrl: DEFAULT_PROFILE.whatsappUrl,
      facebookPageUrl: DEFAULT_PROFILE.facebookPageUrl,
      whatsapp: DEFAULT_PROFILE.whatsapp,
      phone: DEFAULT_PROFILE.phone,
      socials: DEFAULT_PROFILE.socials,
    };
    writeLocal(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }
  return stored;
}

export function subscribeToSiteProfile(
  onSuccess: (profile: SiteProfile) => void,
  _onError?: (error: unknown) => void
): () => void {
  fetchSiteProfile().then(onSuccess);
  return notifier.onProfile(onSuccess);
}

export async function saveSiteProfile(profile: Partial<SiteProfile>): Promise<void> {
  const current = await fetchSiteProfile();
  const merged: SiteProfile = {
    ...DEFAULT_PROFILE,
    ...current,
    ...profile,
  };
  writeLocal(STORAGE_KEYS.PROFILE, merged);
  notifier.notifyProfile(merged);
}

// ----------------- Reset / Re-seed Local Data -----------------

export async function forceSeedDatabase(): Promise<void> {
  // Reset all local storage items back to the clean default data
  const initialProjects = DEFAULT_PROJECTS.map((p, i) => ({
    ...p,
    order: i + 1,
    featured: i < 3,
    hidden: false,
  }));
  const initialServices = DEFAULT_SERVICES.map((s, i) => ({
    ...s,
    order: i + 1,
  }));
  const initialPricing = DEFAULT_PRICING.map((pr, i) => ({
    ...pr,
    order: i + 1,
  }));
  const initialTestimonials = DEFAULT_TESTIMONIALS.map((t, i) => ({
    ...t,
    order: i + 1,
  }));
  const initialFaqs = DEFAULT_FAQS.map((f, i) => ({
    id: `faq-${i + 1}`,
    question: f.question,
    answer: f.answer,
    order: i + 1,
  }));

  writeLocal(STORAGE_KEYS.PROJECTS, initialProjects);
  writeLocal(STORAGE_KEYS.SERVICES, initialServices);
  writeLocal(STORAGE_KEYS.PRICING, initialPricing);
  writeLocal(STORAGE_KEYS.TESTIMONIALS, initialTestimonials);
  writeLocal(STORAGE_KEYS.FAQS, initialFaqs);
  writeLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);

  notifier.notifyProjects(initialProjects);
  notifier.notifyServices(initialServices);
  notifier.notifyPricing(initialPricing);
  notifier.notifyTestimonials(initialTestimonials);
  notifier.notifyFaqs(initialFaqs);
  notifier.notifyProfile(DEFAULT_PROFILE);
}

export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) {
      await forceSeedDatabase();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
