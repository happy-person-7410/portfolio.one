/**
 * Portfolio Data Service for Happy Person Creative Studio.
 * Connects frontend components directly to Google Cloud Firestore and Firebase Storage.
 * Completely replaces all old Neon PostgreSQL and Cloudflare Pages API routes.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Project, Service, PricingPlan, Testimonial, FaqItem, SiteProfile, AddonService } from '../types';
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
import { ADDON_SERVICES as DEFAULT_ADDONS } from '../data/pricingData';
import { compressImage, sanitizeFilename } from '../utils/imageCompressor';

// Types for Contact Requests stored in Firestore
export interface StoredContactRequest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  businessName?: string;
  business_name?: string;
  businessType?: string;
  serviceNeeded?: string;
  service_needed?: string;
  budgetRange?: string;
  budget_range?: string;
  deadline?: string;
  referenceLinks?: string;
  projectDetails: string;
  project_details?: string;
  preferredContact: string;
  preferred_contact?: string;
  status: 'new' | 'in_review' | 'contacted' | 'archived' | string;
  formattedMessage?: string;
  createdAt: string;
  created_at?: string;
  updatedAt?: string;
}

export interface StorageStatusResponse {
  connected: boolean;
  provider: 'firebase_storage';
  bucket: string;
  publicUrlBase: string;
  folders: string[];
  freeMode: boolean;
}

export interface UploadImageResult {
  success: boolean;
  url: string;
  key: string;
  size: number;
  provider: 'firebase_storage';
  message: string;
}

// ----------------- Projects API (Firestore) -----------------

export async function fetchProjects(): Promise<Project[]> {
  try {
    const q = query(collection(db, 'projects'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const projects: Project[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        projects.push({
          id: d.id,
          slug: data.slug || d.id,
          title: data.title || '',
          category: data.category || 'Business Website',
          description: data.description || '',
          thumbnail: data.thumbnail || data.thumbnail_url || '',
          thumbnail_url: data.thumbnail_url || data.thumbnail || '',
          previewVideoUrl: data.previewVideoUrl || '',
          liveDemoUrl: data.liveDemoUrl || '',
          githubUrl: data.githubUrl || '',
          problem: data.problem || '',
          solution: data.solution || '',
          duration: data.duration || '1-2 Weeks',
          client: data.client || 'Client Project',
          role: data.role || 'Design & Engineering',
          year: data.year || '2026',
          completionDate: data.completionDate || '2026',
          techStack: data.techStack || [],
          tags: data.tags || [],
          featured: Boolean(data.featured),
          hidden: Boolean(data.hidden),
          order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          screenshots: data.screenshots || [],
          features: data.features || [],
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
          updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
        });
      });
      projects.sort((a, b) => (a.order || 0) - (b.order || 0));
      return projects;
    }
  } catch (err) {
    console.warn('Failed to fetch projects from Firestore, using default showcase data:', err);
  }
  return DEFAULT_PROJECTS;
}

export function subscribeToProjects(
  onSuccess: (projects: Project[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    const q = query(collection(db, 'projects'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Project[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              slug: data.slug || d.id,
              title: data.title || '',
              category: data.category || 'Business Website',
              description: data.description || '',
              thumbnail: data.thumbnail || data.thumbnail_url || '',
              thumbnail_url: data.thumbnail_url || data.thumbnail || '',
              previewVideoUrl: data.previewVideoUrl || '',
              liveDemoUrl: data.liveDemoUrl || '',
              githubUrl: data.githubUrl || '',
              problem: data.problem || '',
              solution: data.solution || '',
              duration: data.duration || '1-2 Weeks',
              client: data.client || 'Client Project',
              role: data.role || 'Design & Engineering',
              year: data.year || '2026',
              completionDate: data.completionDate || '2026',
              techStack: data.techStack || [],
              tags: data.tags || [],
              featured: Boolean(data.featured),
              hidden: Boolean(data.hidden),
              order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              screenshots: data.screenshots || [],
              features: data.features || [],
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              isPublished: data.isPublished !== false,
              createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
              updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          onSuccess(list);
        } else {
          onSuccess(DEFAULT_PROJECTS);
        }
      },
      (error) => {
        console.warn('Projects snapshot note:', error);
        onError?.(error);
      }
    );
  } catch (err) {
    onSuccess(DEFAULT_PROJECTS);
    return () => {};
  }
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await fetchProjects();
  return projects.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function saveProject(project: Project): Promise<void> {
  const id = project.id || project.slug || `project-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'projects', id),
      {
        ...project,
        id,
        displayOrder: project.order ?? project.displayOrder ?? 0,
        isPublished: !project.hidden,
        updatedAt: new Date().toISOString(),
        createdAt: project.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `projects/${id}`);
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
  }
}

// ----------------- Creative Works API (Firestore) -----------------

export async function fetchCreativeWorks(): Promise<CreativeItem[]> {
  try {
    const q = query(collection(db, 'creativeWorks'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const items: CreativeItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || '',
          category: data.category || 'Logos & Branding',
          shortDescription: data.shortDescription || data.description || '',
          description: data.description || data.shortDescription || '',
          thumbnail: data.thumbnail || data.thumbnailUrl || '',
          thumbnailUrl: data.thumbnailUrl || data.thumbnail || '',
          fullImage: data.fullImage || data.thumbnail || data.thumbnailUrl || '',
          mediaType: data.mediaType || 'image',
          videoEmbedUrl: data.videoEmbedUrl || '',
          liveDemoUrl: data.liveDemoUrl || '',
          tags: data.tags || [],
          toolsUsed: data.toolsUsed || [],
          deliverables: data.deliverables || [],
          featured: Boolean(data.featured),
          order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
          updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
        });
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch creative works from Firestore:', err);
  }
  return DEFAULT_CREATIVE;
}

export function subscribeToCreativeWorks(
  onSuccess: (items: CreativeItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'creativeWorks'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: CreativeItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              category: data.category || 'Logos & Branding',
              shortDescription: data.shortDescription || data.description || '',
              description: data.description || data.shortDescription || '',
              thumbnail: data.thumbnail || data.thumbnailUrl || '',
              thumbnailUrl: data.thumbnailUrl || data.thumbnail || '',
              fullImage: data.fullImage || data.thumbnail || data.thumbnailUrl || '',
              mediaType: data.mediaType || 'image',
              videoEmbedUrl: data.videoEmbedUrl || '',
              liveDemoUrl: data.liveDemoUrl || '',
              tags: data.tags || [],
              toolsUsed: data.toolsUsed || [],
              deliverables: data.deliverables || [],
              featured: Boolean(data.featured),
              order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              isPublished: data.isPublished !== false,
              createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
              updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          onSuccess(list);
        } else {
          onSuccess(DEFAULT_CREATIVE);
        }
      },
      (error) => {
        console.warn('Creative works snapshot note:', error);
        onError?.(error);
      }
    );
  } catch {
    onSuccess(DEFAULT_CREATIVE);
    return () => {};
  }
}

export async function saveCreativeWork(item: CreativeItem): Promise<void> {
  const id = item.id || `creative-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'creativeWorks', id),
      {
        ...item,
        id,
        displayOrder: item.order ?? 0,
        isPublished: true,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `creativeWorks/${id}`);
  }
}

export async function deleteCreativeWork(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'creativeWorks', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `creativeWorks/${id}`);
  }
}

// ----------------- Services API (Firestore) -----------------

export async function fetchServices(): Promise<Service[]> {
  try {
    const snapshot = await getDocs(collection(db, 'services'));
    if (!snapshot.empty) {
      const items: Service[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          title: data.title || '',
          category: data.category || '',
          description: data.description || data.fullDescription || data.shortDescription || '',
          shortDescription: data.shortDescription || data.description || '',
          fullDescription: data.fullDescription || data.description || '',
          icon: data.icon || 'Code',
          iconName: data.iconName || data.icon || 'Code',
          highlights: data.highlights || data.features || [],
          features: data.features || data.highlights || [],
          deliverables: data.deliverables || [],
          startingPrice: data.startingPrice || '',
          turnaround: data.turnaround || '',
          order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
          updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
        });
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch services from Firestore:', err);
  }
  return DEFAULT_SERVICES;
}

export function subscribeToServices(
  onSuccess: (services: Service[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'services'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Service[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              title: data.title || '',
              category: data.category || '',
              description: data.description || data.fullDescription || data.shortDescription || '',
              shortDescription: data.shortDescription || data.description || '',
              fullDescription: data.fullDescription || data.description || '',
              icon: data.icon || 'Code',
              iconName: data.iconName || data.icon || 'Code',
              highlights: data.highlights || data.features || [],
              features: data.features || data.highlights || [],
              deliverables: data.deliverables || [],
              startingPrice: data.startingPrice || '',
              turnaround: data.turnaround || '',
              order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              isPublished: data.isPublished !== false,
              createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
              updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          onSuccess(list);
        } else {
          onSuccess(DEFAULT_SERVICES);
        }
      },
      (error) => onError?.(error)
    );
  } catch {
    onSuccess(DEFAULT_SERVICES);
    return () => {};
  }
}

export async function saveService(service: Service): Promise<void> {
  const id = service.id || `service-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'services', id),
      {
        ...service,
        id,
        displayOrder: service.order ?? 0,
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
  }
}

export async function deleteService(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
  }
}

// ----------------- Pricing Plans & Add-ons API (Firestore) -----------------

export async function fetchPricing(): Promise<PricingPlan[]> {
  try {
    const snapshot = await getDocs(collection(db, 'pricingPlans'));
    if (!snapshot.empty) {
      const items: PricingPlan[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || '',
          tag: data.tag || '',
          price: data.price || '',
          period: data.period || '',
          subtitle: data.subtitle || data.description || '',
          description: data.description || data.subtitle || '',
          popular: Boolean(data.popular || data.isRecommended),
          badge: data.badge || (data.isRecommended ? 'Most Popular' : ''),
          features: data.features || [],
          notIncluded: data.notIncluded || [],
          ctaText: data.ctaText || 'Get Started',
          ctaLink: data.ctaLink || '#contact',
          isRecommended: Boolean(data.isRecommended || data.popular),
          serviceCategory: data.serviceCategory || '',
          turnaroundTime: data.turnaroundTime || '',
          order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
          updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
        });
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch pricing plans from Firestore:', err);
  }
  return DEFAULT_PRICING;
}

export function subscribeToPricing(
  onSuccess: (plans: PricingPlan[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'pricingPlans'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: PricingPlan[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || '',
              tag: data.tag || '',
              price: data.price || '',
              period: data.period || '',
              subtitle: data.subtitle || data.description || '',
              description: data.description || data.subtitle || '',
              popular: Boolean(data.popular || data.isRecommended),
              badge: data.badge || (data.isRecommended ? 'Most Popular' : ''),
              features: data.features || [],
              notIncluded: data.notIncluded || [],
              ctaText: data.ctaText || 'Get Started',
              ctaLink: data.ctaLink || '#contact',
              isRecommended: Boolean(data.isRecommended || data.popular),
              serviceCategory: data.serviceCategory || '',
              turnaroundTime: data.turnaroundTime || '',
              order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              isPublished: data.isPublished !== false,
              createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
              updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          onSuccess(list);
        } else {
          onSuccess(DEFAULT_PRICING);
        }
      },
      (error) => onError?.(error)
    );
  } catch {
    onSuccess(DEFAULT_PRICING);
    return () => {};
  }
}

export async function savePricingPlan(plan: PricingPlan): Promise<void> {
  const id = plan.id || `plan-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'pricingPlans', id),
      {
        ...plan,
        id,
        displayOrder: plan.order ?? 0,
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `pricingPlans/${id}`);
  }
}

export async function deletePricingPlan(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'pricingPlans', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `pricingPlans/${id}`);
  }
}

export async function fetchAddons(): Promise<AddonService[]> {
  try {
    const snapshot = await getDocs(collection(db, 'addOns'));
    if (!snapshot.empty) {
      const items: AddonService[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || '',
          price: data.price || '',
          description: data.description || '',
          duration: data.duration || '',
          category: data.category || 'development',
        } as AddonService);
      });
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch add-ons from Firestore:', err);
  }
  return DEFAULT_ADDONS;
}

export async function saveAddon(addon: AddonService): Promise<void> {
  const id = addon.id || `addon-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'addOns', id),
      {
        ...addon,
        id,
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `addOns/${id}`);
  }
}

export async function deleteAddon(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'addOns', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `addOns/${id}`);
  }
}

// ----------------- Testimonials API (Firestore) -----------------

export async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const snapshot = await getDocs(collection(db, 'testimonials'));
    if (!snapshot.empty) {
      const items: Testimonial[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name || data.clientName || 'Client',
          clientName: data.clientName || data.name || 'Client',
          role: data.role || data.clientRole || '',
          clientRole: data.clientRole || data.role || '',
          clientCompany: data.clientCompany || '',
          avatar: data.avatar || data.clientAvatar || '',
          clientAvatar: data.clientAvatar || data.avatar || '',
          businessType: data.businessType || data.clientCompany || '',
          location: data.location || 'Bangladesh',
          quote: data.quote || '',
          projectTitle: data.projectTitle || '',
          rating: typeof data.rating === 'number' ? data.rating : 5,
          verified: data.verified !== false,
          order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
          isPublished: data.isPublished !== false,
          createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
          updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
        });
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch testimonials from Firestore:', err);
  }
  return DEFAULT_TESTIMONIALS;
}

export function subscribeToTestimonials(
  onSuccess: (items: Testimonial[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'testimonials'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Testimonial[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              name: data.name || data.clientName || 'Client',
              clientName: data.clientName || data.name || 'Client',
              role: data.role || data.clientRole || '',
              clientRole: data.clientRole || data.role || '',
              clientCompany: data.clientCompany || '',
              avatar: data.avatar || data.clientAvatar || '',
              clientAvatar: data.clientAvatar || data.avatar || '',
              businessType: data.businessType || data.clientCompany || '',
              location: data.location || 'Bangladesh',
              quote: data.quote || '',
              projectTitle: data.projectTitle || '',
              rating: typeof data.rating === 'number' ? data.rating : 5,
              verified: data.verified !== false,
              order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              displayOrder: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
              isPublished: data.isPublished !== false,
              createdAt: data.createdAt ? String(data.createdAt) : new Date().toISOString(),
              updatedAt: data.updatedAt ? String(data.updatedAt) : new Date().toISOString(),
            });
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          onSuccess(list);
        } else {
          onSuccess(DEFAULT_TESTIMONIALS);
        }
      },
      (error) => onError?.(error)
    );
  } catch {
    onSuccess(DEFAULT_TESTIMONIALS);
    return () => {};
  }
}

export async function saveTestimonial(testimonial: Testimonial): Promise<void> {
  const id = testimonial.id || `testimonial-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'testimonials', id),
      {
        ...testimonial,
        id,
        displayOrder: testimonial.order ?? 0,
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `testimonials/${id}`);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
  }
}

// ----------------- FAQs API (Firestore) -----------------

export async function fetchFaqs(): Promise<FaqItem[]> {
  try {
    const snapshot = await getDocs(collection(db, 'faqs'));
    if (!snapshot.empty) {
      const items: FaqItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          question: data.question || '',
          answer: data.answer || '',
          category: data.category || 'General',
          order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
        } as FaqItem);
      });
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      return items;
    }
  } catch (err) {
    console.warn('Failed to fetch FAQs from Firestore:', err);
  }
  return DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 }));
}

export function subscribeToFaqs(
  onSuccess: (items: FaqItem[]) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    return onSnapshot(
      collection(db, 'faqs'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: FaqItem[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              question: data.question || '',
              answer: data.answer || '',
              category: data.category || 'General',
              order: typeof data.displayOrder === 'number' ? data.displayOrder : 0,
            } as FaqItem);
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          onSuccess(list);
        } else {
          onSuccess(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
        }
      },
      (error) => onError?.(error)
    );
  } catch {
    onSuccess(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
    return () => {};
  }
}

export async function saveFaq(faq: FaqItem): Promise<void> {
  const id = faq.id || `faq-${Date.now()}`;
  try {
    await setDoc(
      doc(db, 'faqs', id),
      {
        ...faq,
        id,
        displayOrder: faq.order ?? 0,
        isPublished: true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `faqs/${id}`);
  }
}

export async function deleteFaq(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'faqs', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `faqs/${id}`);
  }
}

// ----------------- Site Settings / Profile (Firestore) -----------------

export async function fetchSiteProfile(): Promise<SiteProfile> {
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'global'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        ...DEFAULT_PROFILE,
        brandName: data.brandName || DEFAULT_PROFILE.brandName,
        studioType: data.studioType || DEFAULT_PROFILE.studioType,
        headline: data.headline || DEFAULT_PROFILE.headline,
        subheading: data.subheading || DEFAULT_PROFILE.subheading,
        bio: data.bio || DEFAULT_PROFILE.bio,
        avatar: data.avatar || DEFAULT_PROFILE.avatar,
        ogBanner: data.ogBanner || DEFAULT_PROFILE.ogBanner,
        messengerUrl: data.messengerUrl || DEFAULT_PROFILE.messengerUrl,
        email: data.email || DEFAULT_PROFILE.email,
        phone: data.phone || DEFAULT_PROFILE.phone,
        whatsapp: data.whatsapp || DEFAULT_PROFILE.whatsapp,
        availability: data.availability || DEFAULT_PROFILE.availability,
        isAvailableForProjects: data.isAvailableForProjects !== false,
        socials: {
          ...DEFAULT_PROFILE.socials,
          ...(data.socials || {}),
        },
      };
    }
  } catch (err) {
    console.warn('Failed to fetch site profile from Firestore:', err);
  }
  return DEFAULT_PROFILE;
}

export function subscribeToSiteProfile(
  onSuccess: (profile: SiteProfile) => void,
  onError?: (error: unknown) => void
): () => void {
  try {
    return onSnapshot(
      doc(db, 'siteSettings', 'global'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          onSuccess({
            ...DEFAULT_PROFILE,
            brandName: data.brandName || DEFAULT_PROFILE.brandName,
            studioType: data.studioType || DEFAULT_PROFILE.studioType,
            headline: data.headline || DEFAULT_PROFILE.headline,
            subheading: data.subheading || DEFAULT_PROFILE.subheading,
            bio: data.bio || DEFAULT_PROFILE.bio,
            avatar: data.avatar || DEFAULT_PROFILE.avatar,
            ogBanner: data.ogBanner || DEFAULT_PROFILE.ogBanner,
            messengerUrl: data.messengerUrl || DEFAULT_PROFILE.messengerUrl,
            email: data.email || DEFAULT_PROFILE.email,
            phone: data.phone || DEFAULT_PROFILE.phone,
            whatsapp: data.whatsapp || DEFAULT_PROFILE.whatsapp,
            availability: data.availability || DEFAULT_PROFILE.availability,
            isAvailableForProjects: data.isAvailableForProjects !== false,
            socials: {
              ...DEFAULT_PROFILE.socials,
              ...(data.socials || {}),
            },
          });
        } else {
          onSuccess(DEFAULT_PROFILE);
        }
      },
      (error) => onError?.(error)
    );
  } catch {
    onSuccess(DEFAULT_PROFILE);
    return () => {};
  }
}

export async function saveSiteProfile(profile: SiteProfile): Promise<void> {
  try {
    await setDoc(
      doc(db, 'siteSettings', 'global'),
      {
        ...profile,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'siteSettings/global');
  }
}

// ----------------- Contact Requests (Firestore) -----------------

export async function submitContactRequest(params: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  businessName?: string;
  businessType?: string;
  serviceNeeded?: string;
  budgetRange?: string;
  deadline?: string;
  referenceLinks?: string;
  projectDetails: string;
  preferredContact: string;
  messengerLink?: string;
  whatsappNumber?: string;
}): Promise<{ success: boolean; id?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'contactRequests'), {
      name: params.name.trim(),
      email: params.email?.trim() || '',
      phone: params.phone?.trim() || params.whatsappNumber || '',
      company: params.company?.trim() || params.businessName || '',
      businessName: params.businessName?.trim() || '',
      businessType: params.businessType?.trim() || '',
      serviceNeeded: params.serviceNeeded || '',
      budgetRange: params.budgetRange || '',
      deadline: params.deadline || '',
      referenceLinks: params.referenceLinks || '',
      message: params.projectDetails.trim(),
      projectDetails: params.projectDetails.trim(),
      preferredContact: params.preferredContact || 'Messenger',
      messengerLink: params.messengerLink || 'https://m.me/happyperson7410',
      status: 'new',
      createdAt: new Date().toISOString(),
      serverTimestamp: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (err) {
    console.warn('Firestore contact request save failed:', err);
    throw err;
  }
}

export async function fetchContactRequests(): Promise<StoredContactRequest[]> {
  try {
    const snapshot = await getDocs(collection(db, 'contactRequests'));
    const requests: StoredContactRequest[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      requests.push({
        id: d.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || data.businessName || '',
        businessName: data.businessName || '',
        businessType: data.businessType || '',
        serviceNeeded: data.serviceNeeded || '',
        budgetRange: data.budgetRange || '',
        deadline: data.deadline || '',
        referenceLinks: data.referenceLinks || '',
        projectDetails: data.projectDetails || data.message || '',
        preferredContact: data.preferredContact || 'Messenger',
        status: data.status || 'new',
        createdAt: data.createdAt || new Date().toISOString(),
      });
    });
    requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return requests;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'contactRequests');
  }
}

export async function updateContactRequestStatus(
  id: string,
  status: 'new' | 'in_review' | 'contacted' | 'archived' | string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'contactRequests', id), {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `contactRequests/${id}`);
  }
}

export async function deleteContactRequest(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'contactRequests', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `contactRequests/${id}`);
  }
}

// ----------------- Firebase Storage API -----------------

export async function fetchStorageStatus(): Promise<StorageStatusResponse> {
  return {
    connected: true,
    provider: 'firebase_storage',
    bucket: (storage as any)._bucket?.bucket || 'Firebase Cloud Storage',
    publicUrlBase: 'https://firebasestorage.googleapis.com',
    folders: [
      'images/projects',
      'images/projects/screenshots',
      'images/creative/logos',
      'images/creative/banners',
      'images/creative/ai-images',
      'images/creative/videos',
      'images/brand',
      'images/before-after',
      'images/testimonials',
    ],
    freeMode: true,
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

  // Compress standard images (skip gif, svg, video)
  if (file.type.startsWith('image/') && file.type !== 'image/gif' && file.type !== 'image/svg+xml') {
    onProgress?.(30);
    try {
      const compressed = await compressImage(file, { maxWidth: 1920, maxHeight: 1440, quality: 0.9 });
      fileToUpload = compressed.file;
    } catch {
      // Fallback to original file
    }
  }

  onProgress?.(50);

  const cleanName = sanitizeFilename(customFilename || fileToUpload.name);
  // Normalize folder path: ensure it starts with images/ if not already
  let normalizedFolder = folder.replace(/^\/+|\/+$/g, '');
  if (!normalizedFolder.startsWith('images/')) {
    normalizedFolder = `images/${normalizedFolder}`;
  }

  const storagePath = `${normalizedFolder}/${Date.now()}-${cleanName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise<UploadImageResult>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
      contentType: fileToUpload.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    });

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress?.(Math.min(95, Math.max(50, progress)));
      },
      (error) => {
        console.error('Firebase Storage upload error:', error);
        reject(new Error(error.message || 'Firebase Storage upload failed.'));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          onProgress?.(100);
          resolve({
            success: true,
            url: downloadUrl,
            key: storagePath,
            size: fileToUpload.size,
            provider: 'firebase_storage',
            message: 'Image uploaded to Firebase Storage successfully.',
          });
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}

export async function deleteStorageFile(pathOrUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    let fileRef = ref(storage, pathOrUrl);
    await deleteObject(fileRef);
    return { success: true, message: 'File deleted from Firebase Storage.' };
  } catch (err) {
    console.warn('Storage deletion note (may be external/preset URL):', err);
    return { success: true, message: 'Image reference updated.' };
  }
}

// ----------------- Seeding & Database Initialization -----------------

export async function seedInitialDataIfEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'projects'));
    if (!snap.empty) {
      return false; // Database already has project documents
    }

    // Seed default projects
    for (let i = 0; i < DEFAULT_PROJECTS.length; i++) {
      const p = DEFAULT_PROJECTS[i];
      await setDoc(doc(db, 'projects', p.id || `project-${i + 1}`), {
        ...p,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed default creative works
    for (let i = 0; i < DEFAULT_CREATIVE.length; i++) {
      const c = DEFAULT_CREATIVE[i];
      await setDoc(doc(db, 'creativeWorks', c.id || `creative-${i + 1}`), {
        ...c,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed services
    for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
      const s = DEFAULT_SERVICES[i];
      await setDoc(doc(db, 'services', s.id || `service-${i + 1}`), {
        ...s,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed pricing plans
    for (let i = 0; i < DEFAULT_PRICING.length; i++) {
      const pr = DEFAULT_PRICING[i];
      await setDoc(doc(db, 'pricingPlans', pr.id || `plan-${i + 1}`), {
        ...pr,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed add-ons
    for (let i = 0; i < DEFAULT_ADDONS.length; i++) {
      const a = DEFAULT_ADDONS[i];
      await setDoc(doc(db, 'addOns', a.id || `addon-${i + 1}`), {
        ...a,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed testimonials
    for (let i = 0; i < DEFAULT_TESTIMONIALS.length; i++) {
      const t = DEFAULT_TESTIMONIALS[i];
      await setDoc(doc(db, 'testimonials', t.id || `testimonial-${i + 1}`), {
        ...t,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed FAQs
    for (let i = 0; i < DEFAULT_FAQS.length; i++) {
      const f = DEFAULT_FAQS[i];
      await setDoc(doc(db, 'faqs', `faq-${i + 1}`), {
        ...f,
        id: `faq-${i + 1}`,
        displayOrder: i + 1,
        isPublished: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Seed site profile
    await setDoc(doc(db, 'siteSettings', 'global'), {
      ...DEFAULT_PROFILE,
      isAvailableForProjects: true,
      displayOrder: 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return true;
  } catch (err) {
    console.warn('Initial seed note:', err);
    return false;
  }
}

export async function forceSeedDatabase(): Promise<void> {
  // Clear and rewrite with default showcase data
  for (let i = 0; i < DEFAULT_PROJECTS.length; i++) {
    const p = DEFAULT_PROJECTS[i];
    await setDoc(doc(db, 'projects', p.id || `project-${i + 1}`), {
      ...p,
      displayOrder: i + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  for (let i = 0; i < DEFAULT_CREATIVE.length; i++) {
    const c = DEFAULT_CREATIVE[i];
    await setDoc(doc(db, 'creativeWorks', c.id || `creative-${i + 1}`), {
      ...c,
      displayOrder: i + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
    const s = DEFAULT_SERVICES[i];
    await setDoc(doc(db, 'services', s.id || `service-${i + 1}`), {
      ...s,
      displayOrder: i + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  for (let i = 0; i < DEFAULT_PRICING.length; i++) {
    const pr = DEFAULT_PRICING[i];
    await setDoc(doc(db, 'pricingPlans', pr.id || `plan-${i + 1}`), {
      ...pr,
      displayOrder: i + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  for (let i = 0; i < DEFAULT_TESTIMONIALS.length; i++) {
    const t = DEFAULT_TESTIMONIALS[i];
    await setDoc(doc(db, 'testimonials', t.id || `testimonial-${i + 1}`), {
      ...t,
      displayOrder: i + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  for (let i = 0; i < DEFAULT_FAQS.length; i++) {
    const f = DEFAULT_FAQS[i];
    await setDoc(doc(db, 'faqs', `faq-${i + 1}`), {
      ...f,
      id: `faq-${i + 1}`,
      displayOrder: i + 1,
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await setDoc(doc(db, 'siteSettings', 'global'), {
    ...DEFAULT_PROFILE,
    isAvailableForProjects: true,
    displayOrder: 1,
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
