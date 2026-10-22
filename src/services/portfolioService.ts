/**
 * Portfolio Data Service for Happy Person Creative Studio.
 * Connects frontend components to the Neon PostgreSQL backend via Cloudflare Pages Functions (/api/*).
 */

import { Project, Service, PricingPlan, Testimonial, FaqItem, SiteProfile } from '../types';
import { CreativeItem } from '../data/creativeData';
import {
  PROJECTS as DEFAULT_PROJECTS,
  SERVICES as DEFAULT_SERVICES,
  PRICING_PLANS as DEFAULT_PRICING,
  TESTIMONIALS as DEFAULT_TESTIMONIALS,
  FAQ_ITEMS as DEFAULT_FAQS,
  PROFILE_INFO as DEFAULT_PROFILE,
} from '../data/portfolioData';
import { CREATIVE_ITEMS as DEFAULT_CREATIVE } from '../data/creativeData';
import { compressImage, sanitizeFilename, fileToDataUrl } from '../utils/imageCompressor';

// Local storage fallback cache keys
const STORAGE_KEYS = {
  PROJECTS: 'hp_portfolio_projects',
  SERVICES: 'hp_portfolio_services',
  PRICING: 'hp_portfolio_pricing',
  TESTIMONIALS: 'hp_portfolio_testimonials',
  FAQS: 'hp_portfolio_faqs',
  PROFILE: 'hp_portfolio_profile',
  CREATIVE: 'hp_portfolio_creative',
  TOKEN: 'hp_admin_token',
} as const;

export function getAuthToken(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem(STORAGE_KEYS.TOKEN) || null;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  } catch {}
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Event listeners for instantaneous cross-component updates
type Listener<T> = (data: T) => void;

class ChangeNotifier {
  private projectListeners = new Set<Listener<Project[]>>();
  private serviceListeners = new Set<Listener<Service[]>>();
  private pricingListeners = new Set<Listener<PricingPlan[]>>();
  private testimonialListeners = new Set<Listener<Testimonial[]>>();
  private faqListeners = new Set<Listener<FaqItem[]>>();
  private profileListeners = new Set<Listener<SiteProfile>>();
  private creativeListeners = new Set<Listener<CreativeItem[]>>();

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
  notifyCreative(data: CreativeItem[]) {
    this.creativeListeners.forEach((fn) => fn(data));
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
  onCreative(fn: Listener<CreativeItem[]>) {
    this.creativeListeners.add(fn);
    return () => this.creativeListeners.delete(fn);
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
  } catch {}
}

// ----------------- Projects API (Neon Backend + Fallback) -----------------

export async function fetchProjects(): Promise<Project[]> {
  try {
    const res = await fetch('/api/projects');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as Project[];
    if (Array.isArray(data) && data.length > 0) {
      writeLocal(STORAGE_KEYS.PROJECTS, data);
      return data;
    }
  } catch (err) {
    console.warn('API /api/projects fetch failed, loading local cache/defaults:', err);
  }
  return readLocal<Project[]>(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
}

export function subscribeToProjects(
  onSuccess: (projects: Project[]) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchProjects().then(onSuccess).catch(onError);
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

  // Update local memory and cache immediately
  writeLocal(STORAGE_KEYS.PROJECTS, updated);
  notifier.notifyProjects(updated);

  // Sync to Neon backend via Cloudflare API
  try {
    const res = await fetch('/api/admin/projects', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(project),
    });
    if (!res.ok) {
      const err = await res.json();
      console.warn('Server project save response:', err);
    }
  } catch (err) {
    console.warn('Network error saving project to backend:', err);
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  const current = await fetchProjects();
  const updated = current.filter((p) => p.id !== projectId);
  writeLocal(STORAGE_KEYS.PROJECTS, updated);
  notifier.notifyProjects(updated);

  try {
    await fetch(`/api/admin/projects/${projectId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Failed to delete project on server:', err);
  }
}

// ----------------- Creative Works API -----------------

export async function fetchCreativeWorks(): Promise<CreativeItem[]> {
  try {
    const res = await fetch('/api/creative-works');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as CreativeItem[];
    if (Array.isArray(data) && data.length > 0) {
      writeLocal(STORAGE_KEYS.CREATIVE, data);
      return data;
    }
  } catch (err) {
    console.warn('API /api/creative-works failed, using fallback:', err);
  }
  return readLocal<CreativeItem[]>(STORAGE_KEYS.CREATIVE, DEFAULT_CREATIVE);
}

export function subscribeToCreativeWorks(
  onSuccess: (items: CreativeItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchCreativeWorks().then(onSuccess).catch(onError);
  return notifier.onCreative(onSuccess);
}

export async function saveCreativeWork(item: CreativeItem): Promise<void> {
  const current = await fetchCreativeWorks();
  const existingIdx = current.findIndex((c) => c.id === item.id);
  let updated: CreativeItem[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...item };
  } else {
    updated = [item, ...current];
  }

  writeLocal(STORAGE_KEYS.CREATIVE, updated);
  notifier.notifyCreative(updated);

  try {
    await fetch('/api/admin/creative-works', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(item),
    });
  } catch (err) {
    console.warn('Network error saving creative work:', err);
  }
}

export async function deleteCreativeWork(id: string): Promise<void> {
  const current = await fetchCreativeWorks();
  const updated = current.filter((c) => c.id !== id);
  writeLocal(STORAGE_KEYS.CREATIVE, updated);
  notifier.notifyCreative(updated);

  try {
    await fetch(`/api/admin/creative-works/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Failed to delete creative work on server:', err);
  }
}

// ----------------- Services API -----------------

export async function fetchServices(): Promise<Service[]> {
  try {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as Service[];
    if (Array.isArray(data) && data.length > 0) {
      writeLocal(STORAGE_KEYS.SERVICES, data);
      return data;
    }
  } catch (err) {
    console.warn('API /api/services failed, using fallback:', err);
  }
  return readLocal<Service[]>(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
}

export function subscribeToServices(
  onSuccess: (services: Service[]) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchServices().then(onSuccess).catch(onError);
  return notifier.onServices(onSuccess);
}

export async function saveService(service: Service): Promise<void> {
  const current = await fetchServices();
  const existingIdx = current.findIndex((s) => s.id === service.id);
  let updated: Service[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...service, updatedAt: new Date().toISOString() };
  } else {
    updated = [...current, { ...service, order: current.length + 1, updatedAt: new Date().toISOString() }];
  }

  writeLocal(STORAGE_KEYS.SERVICES, updated);
  notifier.notifyServices(updated);

  try {
    await fetch('/api/admin/services', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(service),
    });
  } catch (err) {
    console.warn('Failed to save service on server:', err);
  }
}

export async function deleteService(id: string): Promise<void> {
  const current = await fetchServices();
  const updated = current.filter((s) => s.id !== id);
  writeLocal(STORAGE_KEYS.SERVICES, updated);
  notifier.notifyServices(updated);

  try {
    await fetch(`/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Failed to delete service on server:', err);
  }
}

// ----------------- Pricing Plans API -----------------

export async function fetchPricing(): Promise<PricingPlan[]> {
  try {
    const res = await fetch('/api/pricing');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as PricingPlan[];
    if (Array.isArray(data) && data.length > 0) {
      writeLocal(STORAGE_KEYS.PRICING, data);
      return data;
    }
  } catch (err) {
    console.warn('API /api/pricing failed, using fallback:', err);
  }
  return readLocal<PricingPlan[]>(STORAGE_KEYS.PRICING, DEFAULT_PRICING);
}

export function subscribeToPricing(
  onSuccess: (plans: PricingPlan[]) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchPricing().then(onSuccess).catch(onError);
  return notifier.onPricing(onSuccess);
}

export async function savePricingPlan(plan: PricingPlan): Promise<void> {
  const current = await fetchPricing();
  const existingIdx = current.findIndex((p) => p.id === plan.id);
  let updated: PricingPlan[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...plan, updatedAt: new Date().toISOString() };
  } else {
    updated = [...current, { ...plan, order: current.length + 1, updatedAt: new Date().toISOString() }];
  }

  writeLocal(STORAGE_KEYS.PRICING, updated);
  notifier.notifyPricing(updated);

  try {
    await fetch('/api/admin/pricing', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(plan),
    });
  } catch (err) {
    console.warn('Failed to save pricing on server:', err);
  }
}

// ----------------- Testimonials API -----------------

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const res = await fetch('/api/testimonials');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as Testimonial[];
    if (Array.isArray(data) && data.length > 0) {
      writeLocal(STORAGE_KEYS.TESTIMONIALS, data);
      return data;
    }
  } catch (err) {
    console.warn('API /api/testimonials failed, using fallback:', err);
  }
  return readLocal<Testimonial[]>(STORAGE_KEYS.TESTIMONIALS, DEFAULT_TESTIMONIALS);
}

export function subscribeToTestimonials(
  onSuccess: (items: Testimonial[]) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchTestimonials().then(onSuccess).catch(onError);
  return notifier.onTestimonials(onSuccess);
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const current = await fetchTestimonials();
  const existingIdx = current.findIndex((t) => t.id === testimonial.id);
  let updated: Testimonial[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...testimonial, updatedAt: new Date().toISOString() };
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

  try {
    await fetch('/api/admin/testimonials', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(testimonial),
    });
  } catch (err) {
    console.warn('Failed to save testimonial on server:', err);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const current = await fetchTestimonials();
  const updated = current.filter((t) => t.id !== id);
  writeLocal(STORAGE_KEYS.TESTIMONIALS, updated);
  notifier.notifyTestimonials(updated);

  try {
    await fetch(`/api/admin/testimonials/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Failed to delete testimonial on server:', err);
  }
}

// ----------------- FAQs API -----------------

export async function fetchFaqs(): Promise<FaqItem[]> {
  try {
    const res = await fetch('/api/faqs');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as FaqItem[];
    if (Array.isArray(data) && data.length > 0) {
      writeLocal(STORAGE_KEYS.FAQS, data);
      return data;
    }
  } catch (err) {
    console.warn('API /api/faqs failed, using fallback:', err);
  }
  return readLocal<FaqItem[]>(STORAGE_KEYS.FAQS, DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
}

export function subscribeToFaqs(
  onSuccess: (items: FaqItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchFaqs().then(onSuccess).catch(onError);
  return notifier.onFaqs(onSuccess);
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  const current = await fetchFaqs();
  const existingIdx = current.findIndex((f) => f.id === faq.id);
  let updated: FaqItem[];

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = { ...current[existingIdx], ...faq, updatedAt: new Date().toISOString() };
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

  try {
    await fetch('/api/admin/faqs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(faq),
    });
  } catch (err) {
    console.warn('Failed to save FAQ on server:', err);
  }
}

export async function deleteFaq(id: string): Promise<void> {
  const current = await fetchFaqs();
  const updated = current.filter((f) => f.id !== id);
  writeLocal(STORAGE_KEYS.FAQS, updated);
  notifier.notifyFaqs(updated);

  try {
    await fetch(`/api/admin/faqs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } catch (err) {
    console.warn('Failed to delete FAQ on server:', err);
  }
}

// ----------------- Site Settings / Profile -----------------

export async function fetchSiteProfile(): Promise<SiteProfile> {
  try {
    const res = await fetch('/api/site-settings');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json() as Record<string, string>;
    const mapped: SiteProfile = {
      ...DEFAULT_PROFILE,
      availability: data.availabilityStatus || DEFAULT_PROFILE.availability,
      headline: data.heroHeadline || DEFAULT_PROFILE.headline,
      subheading: data.heroSubheadline || DEFAULT_PROFILE.subheading,
      bio: data.aboutText || DEFAULT_PROFILE.bio,
      ogBanner: data.ogImageUrl || DEFAULT_PROFILE.ogBanner,
      email: data.email || DEFAULT_PROFILE.email,
      whatsappNumber: data.whatsappNumber || DEFAULT_PROFILE.whatsappNumber,
      messengerUrl: data.messengerLink || DEFAULT_PROFILE.messengerUrl,
    };
    writeLocal(STORAGE_KEYS.PROFILE, mapped);
    return mapped;
  } catch (err) {
    console.warn('API /api/site-settings failed, using fallback:', err);
  }
  return readLocal<SiteProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function subscribeToSiteProfile(
  onSuccess: (profile: SiteProfile) => void,
  onError?: (error: unknown) => void
): () => void {
  fetchSiteProfile().then(onSuccess).catch(onError);
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

  try {
    await fetch('/api/admin/site-settings', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        availabilityStatus: merged.availability,
        heroHeadline: merged.headline,
        heroSubheadline: merged.subheading,
        aboutText: merged.bio,
        ogImageUrl: merged.ogBanner,
        email: merged.email,
        whatsappNumber: merged.whatsappNumber,
        messengerLink: merged.messengerUrl,
      }),
    });
  } catch (err) {
    console.warn('Failed to save site settings on server:', err);
  }
}

// ----------------- Contact Requests API -----------------

export interface ContactFormData {
  name: string;
  email?: string;
  messengerLink?: string;
  whatsappNumber?: string;
  businessName?: string;
  businessType?: string;
  serviceNeeded?: string;
  budgetRange?: string;
  deadline?: string;
  referenceLinks?: string;
  projectDetails?: string;
  preferredContact?: string;
}

export async function submitContactRequest(data: ContactFormData): Promise<{ success: boolean; message: string; requestId?: string }> {
  try {
    const res = await fetch('/api/contact-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json() as { error?: string };
      throw new Error(err.error || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Contact request error:', err);
    throw err;
  }
}

export interface StoredContactRequest {
  id: string;
  name: string;
  email: string;
  messenger_link?: string;
  whatsapp_number?: string;
  business_name?: string;
  business_type?: string;
  service_needed?: string;
  budget_range?: string;
  deadline?: string;
  reference_links?: string;
  project_details?: string;
  preferred_contact?: string;
  status: string;
  created_at: string;
}

export async function fetchContactRequests(): Promise<StoredContactRequest[]> {
  try {
    const res = await fetch('/api/admin/contact-requests', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to fetch contact requests:', err);
    return [];
  }
}

export async function updateContactRequestStatus(id: string, status: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/contact-requests/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteContactRequest(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/admin/contact-requests/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ----------------- Database Migration / Sync Trigger -----------------

export async function initDatabaseOnServer(): Promise<{ success: boolean; log: string[] }> {
  const res = await fetch('/api/admin/init-db', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error || 'Failed to initialize database');
  }
  return await res.json();
}

export async function forceSeedDatabase(): Promise<void> {
  writeLocal(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
  writeLocal(STORAGE_KEYS.SERVICES, DEFAULT_SERVICES);
  writeLocal(STORAGE_KEYS.PRICING, DEFAULT_PRICING);
  writeLocal(STORAGE_KEYS.TESTIMONIALS, DEFAULT_TESTIMONIALS);
  writeLocal(STORAGE_KEYS.FAQS, DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
  writeLocal(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
  writeLocal(STORAGE_KEYS.CREATIVE, DEFAULT_CREATIVE);

  notifier.notifyProjects(DEFAULT_PROJECTS);
  notifier.notifyServices(DEFAULT_SERVICES);
  notifier.notifyPricing(DEFAULT_PRICING);
  notifier.notifyTestimonials(DEFAULT_TESTIMONIALS);
  notifier.notifyFaqs(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
  notifier.notifyProfile(DEFAULT_PROFILE);
  notifier.notifyCreative(DEFAULT_CREATIVE);

  try {
    await initDatabaseOnServer();
  } catch {}
}

export async function seedInitialDataIfEmpty(): Promise<boolean> {
  const current = readLocal<Project[] | null>(STORAGE_KEYS.PROJECTS, null);
  if (!current || current.length === 0) {
    await forceSeedDatabase();
    return true;
  }
  return false;
}

// ----------------- Cloudflare R2 / Storage API -----------------

export interface StorageStatusResponse {
  connected: boolean;
  provider: 'cloudflare_r2_binding' | 'cloudflare_r2_s3' | 'local_public';
  bucket: string;
  publicUrlBase: string;
  folders: string[];
}

export interface UploadImageResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  provider: 'cloudflare_r2_binding' | 'cloudflare_r2_s3' | 'local_public';
  message: string;
}

export async function fetchStorageStatus(): Promise<StorageStatusResponse> {
  try {
    const res = await fetch('/api/admin/storage-status', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return (await res.json()) as StorageStatusResponse;
    }
  } catch (err) {
    console.warn('Storage status check error:', err);
  }
  return {
    connected: false,
    provider: 'local_public',
    bucket: 'Not set',
    publicUrlBase: '/images/uploads',
    folders: ['projects', 'projects/screenshots', 'creative/logos', 'creative/banners', 'creative/ai-images', 'creative/videos', 'testimonials', 'brand', 'settings'],
  };
}

export async function uploadImageFile(
  file: File,
  folder: string,
  customFilename?: string,
  onProgress?: (pct: number) => void
): Promise<UploadImageResult> {
  onProgress?.(15);

  let fileToUpload = file;
  let fileDataUrl: string | undefined = undefined;

  // Compress image if applicable
  if (file.type.startsWith('image/') && file.type !== 'image/gif' && file.type !== 'image/svg+xml') {
    onProgress?.(30);
    try {
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1440, quality: 0.88 });
      fileToUpload = compressed.file;
      fileDataUrl = compressed.dataUrl;
    } catch {
      // Fallback
    }
  }

  onProgress?.(55);

  const cleanName = sanitizeFilename(customFilename || fileToUpload.name);

  if (!fileDataUrl) {
    fileDataUrl = await fileToDataUrl(fileToUpload);
  }

  onProgress?.(75);

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileData: fileDataUrl,
      folder,
      filename: cleanName,
      contentType: fileToUpload.type || 'image/webp',
    }),
  });

  onProgress?.(95);

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorJson.error || `Upload failed (Status ${res.status})`);
  }

  const result = (await res.json()) as UploadImageResult;
  onProgress?.(100);
  return result;
}

export async function deleteStorageFile(key: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/admin/upload', {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    const errorJson = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorJson.error || `Delete failed (Status ${res.status})`);
  }

  return (await res.json()) as { success: boolean; message: string };
}


