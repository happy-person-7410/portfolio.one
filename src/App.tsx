/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Services } from './components/Services';
import { Projects } from './components/Projects';
import { CreativeWork } from './components/CreativeWork';
import { BeforeAfter } from './components/BeforeAfter';
import { AddOns } from './components/AddOns';
import { MidPageCTA } from './components/MidPageCTA';
import { Process } from './components/Process';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { FloatingContactButton } from './components/FloatingContactButton';
import { EnvironmentVisualizer } from './components/EnvironmentVisualizer';
import { AdminRoute } from './components/admin/AdminRoute';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isVisualizerOpen, setIsVisualizerOpen] = useState<boolean>(false);

  // Owner Admin Route detection (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin/') || hash.startsWith('#admin/');
  });

  // Listen to popstate and hashchange for in-page navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const admin = path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin/') || hash.startsWith('#admin/');
      setIsAdminRoute(admin);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Pre-fill state for contact form when user triggers service or pricing cards
  const [selectedService, setSelectedService] = useState<string>('Website Design & Development');
  const [selectedBudget, setSelectedBudget] = useState<string>('৳5,000 - ৳15,000');

  // Track active section for navbar indicator
  useEffect(() => {
    const handleScroll = () => {
      if (isAdminRoute) return;
      const sections = ['home', 'about', 'projects', 'creative', 'before-after', 'services', 'pricing', 'addons', 'process', 'testimonials', 'faq', 'contact'];
      const scrollY = window.pageYOffset;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop - 120;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAdminRoute]);

  // Route listener for /admin or #admin & owner keyboard gateway
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const matchesAdmin = path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin';
      setIsAdminRoute(matchesAdmin);
    };

    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);

    // Discrete keyboard shortcut for website owner (Ctrl+Shift+A or Cmd+Shift+A)
    const handleKeyNav = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminRoute((prev) => {
          const next = !prev;
          if (next) {
            window.history.pushState({}, '', '/admin');
          } else {
            window.history.pushState({}, '', '/');
          }
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyNav);

    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('keydown', handleKeyNav);
    };
  }, []);

  const scrollToContact = (service?: string, budget?: string) => {
    if (service) setSelectedService(service);
    if (budget) setSelectedBudget(budget);

    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const topOffset = 80;
      const elementPosition = contactEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToProjects = () => {
    const projectsEl = document.getElementById('projects');
    if (projectsEl) {
      const topOffset = 80;
      const elementPosition = projectsEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // If viewing the private owner admin route
  if (isAdminRoute) {
    return (
      <AdminRoute
        onBackToSite={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  // Public visitor portfolio website (clean, zero exposed admin buttons or keys)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 transition-colors duration-250">
      
      {/* 1. Sticky Responsive Navbar with theme toggle */}
      <Navbar
        onHireMeClick={() => scrollToContact()}
        onOpenVisualizer={() => setIsVisualizerOpen(true)}
        activeSection={activeSection}
      />

      <main id="main-content">
        {/* 1. Home Section */}
        <Hero
          onViewWorkClick={scrollToProjects}
          onHireMeClick={() => scrollToContact()}
          onWatchVisualsClick={() => setIsVisualizerOpen(true)}
        />

        {/* 2. About Happy Person */}
        <About />

        {/* 3. Web Projects (Live demos + modal details) */}
        <Projects />

        {/* 4. Creative & AI Work (Logos, Banners, AI Images, AI Videos) */}
        <CreativeWork 
          onWatchMusicVisuals={() => setIsVisualizerOpen(true)}
        />

        {/* 5. Before / After Redesigns */}
        <BeforeAfter />

        {/* 6. Services */}
        <Services
          onRequestService={(serviceName) => scrollToContact(serviceName)}
        />

        {/* Mid-Page Conversion Strip */}
        <MidPageCTA
          onStartProject={() => scrollToContact()}
        />

        {/* 7. Pricing */}
        <Pricing
          onSelectPlan={(planName, serviceCategory) => {
            const budgetMap: Record<string, string> = {
              'Starter Landing Page': '৳5,000 - ৳15,000',
              'Business Website': '৳15,000 - ৳25,000',
              'Booking / Custom Website': '৳25,000 - ৳50,000'
            };
            scrollToContact(serviceCategory, budgetMap[planName] || '৳5,000 - ৳15,000');
          }}
        />

        {/* 8. Add-Ons */}
        <AddOns
          onSelectAddons={(addonNames) => {
            scrollToContact('Website Design & Development', '৳5,000 - ৳15,000');
          }}
        />

        {/* 9. Process */}
        <Process />

        {/* 10. Testimonials */}
        <Testimonials />

        {/* 11. FAQ */}
        <FAQ />

        {/* 12. Contact */}
        <Contact
          initialService={selectedService}
          initialBudget={selectedBudget}
        />
      </main>

      {/* 12. Footer */}
      <Footer />

      {/* 13. Floating Contact Button (Messenger as primary) */}
      <FloatingContactButton />

      {/* 14. Interactive Music in Environment Visuals Ambient Engine & Fullscreen Experience */}
      <EnvironmentVisualizer 
        isOpenExternally={isVisualizerOpen} 
        onCloseExternal={() => setIsVisualizerOpen(false)} 
      />

    </div>
  );
}
