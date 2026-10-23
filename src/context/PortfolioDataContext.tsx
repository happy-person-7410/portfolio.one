import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
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
import {
  subscribeToProjects,
  subscribeToServices,
  subscribeToPricing,
  subscribeToTestimonials,
  subscribeToFaqs,
  subscribeToSiteProfile,
  subscribeToCreativeWorks,
  fetchProjects,
  fetchCreativeWorks,
  fetchServices,
  fetchPricing,
  fetchTestimonials,
  fetchFaqs,
  fetchSiteProfile,
  fetchAddons,
} from '../services/portfolioService';

interface PortfolioDataContextType {
  projects: Project[];
  creativeWorks: CreativeItem[];
  services: Service[];
  pricingPlans: PricingPlan[];
  addons: AddonService[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  profile: SiteProfile;
  isLoading: boolean;
  isOnline: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [creativeWorks, setCreativeWorks] = useState<CreativeItem[]>(DEFAULT_CREATIVE);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(DEFAULT_PRICING);
  const [addons, setAddons] = useState<AddonService[]>(DEFAULT_ADDONS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [p, c, s, pr, add, t, f, prof] = await Promise.allSettled([
        fetchProjects(),
        fetchCreativeWorks(),
        fetchServices(),
        fetchPricing(),
        fetchAddons(),
        fetchTestimonials(),
        fetchFaqs(),
        fetchSiteProfile(),
      ]);

      if (p.status === 'fulfilled' && p.value?.length) setProjects(p.value);
      if (c.status === 'fulfilled' && c.value?.length) setCreativeWorks(c.value);
      if (s.status === 'fulfilled' && s.value?.length) setServices(s.value);
      if (pr.status === 'fulfilled' && pr.value?.length) setPricingPlans(pr.value);
      if (add.status === 'fulfilled' && add.value?.length) setAddons(add.value);
      if (t.status === 'fulfilled' && t.value?.length) setTestimonials(t.value);
      if (f.status === 'fulfilled' && f.value?.length) setFaqs(f.value);
      if (prof.status === 'fulfilled' && prof.value) setProfile((prev) => ({ ...prev, ...prof.value }));
    } catch (err) {
      console.warn('Refresh error:', err);
      setError('Could not refresh latest portfolio data from server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initializeData = () => {
      try {
        setIsOnline(true);

        // 1. Projects
        const unsubProjects = subscribeToProjects(
          (items) => {
            if (items && items.length > 0) setProjects(items);
            setIsLoading(false);
          },
          () => setIsLoading(false)
        );
        unsubs.push(unsubProjects);

        // 2. Creative works
        const unsubCreative = subscribeToCreativeWorks(
          (items) => {
            if (items && items.length > 0) setCreativeWorks(items);
          }
        );
        unsubs.push(unsubCreative);

        // 3. Services
        const unsubServices = subscribeToServices(
          (items) => {
            if (items && items.length > 0) setServices(items);
          }
        );
        unsubs.push(unsubServices);

        // 4. Pricing
        const unsubPricing = subscribeToPricing(
          (items) => {
            if (items && items.length > 0) setPricingPlans(items);
          }
        );
        unsubs.push(unsubPricing);

        // 5. Testimonials
        const unsubTestimonials = subscribeToTestimonials(
          (items) => {
            if (items && items.length > 0) setTestimonials(items);
          }
        );
        unsubs.push(unsubTestimonials);

        // 6. FAQs
        const unsubFaqs = subscribeToFaqs(
          (items) => {
            if (items && items.length > 0) setFaqs(items);
          }
        );
        unsubs.push(unsubFaqs);

        // 7. Profile
        const unsubProfile = subscribeToSiteProfile(
          (item) => {
            if (item) setProfile((prev) => ({ ...DEFAULT_PROFILE, ...prev, ...item }));
          }
        );
        unsubs.push(unsubProfile);

        // 8. Addons
        fetchAddons().then((items) => {
          if (items && items.length > 0) setAddons(items);
        }).catch(() => {});

      } catch (err) {
        console.warn('Error loading portfolio data:', err);
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []);

  return (
    <PortfolioDataContext.Provider
      value={{
        projects,
        creativeWorks,
        services,
        pricingPlans,
        addons,
        testimonials,
        faqs,
        profile,
        isLoading,
        isOnline,
        error,
        refreshData,
      }}
    >
      {children}
    </PortfolioDataContext.Provider>
  );
};

export const usePortfolioData = (): PortfolioDataContextType => {
  const context = useContext(PortfolioDataContext);
  if (!context) {
    throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
  }
  return context;
};
