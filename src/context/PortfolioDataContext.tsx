import React, { createContext, useContext, useEffect, useState } from 'react';
import { Project, Service, PricingPlan, Testimonial, FaqItem, SiteProfile } from '../types';
import {
  PROJECTS as DEFAULT_PROJECTS,
  SERVICES as DEFAULT_SERVICES,
  PRICING_PLANS as DEFAULT_PRICING,
  TESTIMONIALS as DEFAULT_TESTIMONIALS,
  FAQ_ITEMS as DEFAULT_FAQS,
  PROFILE_INFO as DEFAULT_PROFILE,
} from '../data/portfolioData';
import {
  subscribeToProjects,
  subscribeToServices,
  subscribeToPricing,
  subscribeToTestimonials,
  subscribeToFaqs,
  subscribeToSiteProfile,
} from '../services/portfolioService';

interface PortfolioDataContextType {
  projects: Project[];
  services: Service[];
  pricingPlans: PricingPlan[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  profile: SiteProfile;
  isLoading: boolean;
  isOnline: boolean;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(DEFAULT_PRICING);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS.map((f, i) => ({ id: `faq-${i + 1}`, ...f, order: i + 1 })));
  const [profile, setProfile] = useState<SiteProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const initializeData = async () => {
      try {
        const healthRes = await fetch('/api/health').catch(() => null);
        setIsOnline(Boolean(healthRes && healthRes.ok));

        // 1. Projects subscription
        const unsubProjects = subscribeToProjects(
          (items) => {
            if (items && items.length > 0) {
              setProjects(items);
            }
            setIsLoading(false);
          },
          (err) => {
            console.warn('Projects fetch warning, using defaults:', err);
            setIsLoading(false);
          }
        );
        unsubs.push(unsubProjects);

        // 2. Services subscription
        const unsubServices = subscribeToServices(
          (items) => {
            if (items && items.length > 0) setServices(items);
          },
          (err) => console.warn('Services fetch warning:', err)
        );
        unsubs.push(unsubServices);

        // 3. Pricing subscription
        const unsubPricing = subscribeToPricing(
          (items) => {
            if (items && items.length > 0) setPricingPlans(items);
          },
          (err) => console.warn('Pricing fetch warning:', err)
        );
        unsubs.push(unsubPricing);

        // 4. Testimonials subscription
        const unsubTestimonials = subscribeToTestimonials(
          (items) => {
            if (items && items.length > 0) setTestimonials(items);
          },
          (err) => console.warn('Testimonials fetch warning:', err)
        );
        unsubs.push(unsubTestimonials);

        // 5. FAQs subscription
        const unsubFaqs = subscribeToFaqs(
          (items) => {
            if (items && items.length > 0) setFaqs(items);
          },
          (err) => console.warn('FAQs fetch warning:', err)
        );
        unsubs.push(unsubFaqs);

        // 6. Profile subscription
        const unsubProfile = subscribeToSiteProfile(
          (item) => {
            if (item) setProfile(item);
          },
          (err) => console.warn('Profile fetch warning:', err)
        );
        unsubs.push(unsubProfile);

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
        services,
        pricingPlans,
        testimonials,
        faqs,
        profile,
        isLoading,
        isOnline,
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
