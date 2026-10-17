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
import { MidPageCTA } from './components/MidPageCTA';
import { Process } from './components/Process';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { FloatingContactButton } from './components/FloatingContactButton';
import { AdminRoute } from './components/admin/AdminRoute';
import { AdminSetup } from './components/admin/AdminSetup';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('home');

  // Owner Admin Route detection (/admin or #admin)
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin/') || hash.startsWith('#admin/');
  });

  // Dedicated One-Time Setup Route (/admin/setup)
  const [isSetupRoute, setIsSetupRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === '/admin/setup' || path.startsWith('/admin/setup') || hash === '#/admin/setup' || hash === '#admin/setup';
  });

  // Listen to popstate and hashchange for in-page navigation
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      const admin = path === '/admin' || path.startsWith('/admin/') || hash === '#admin' || hash === '#/admin' || hash.startsWith('#/admin/') || hash.startsWith('#admin/');
      const setup = path === '/admin/setup' || path.startsWith('/admin/setup') || hash === '#/admin/setup' || hash === '#admin/setup';
      setIsAdminRoute(admin);
      setIsSetupRoute(setup);
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
  const [selectedBudget, setSelectedBudget] = useState<string>('$500 - $1,000');

  // Track active section for navbar indicator
  useEffect(() => {
    const handleScroll = () => {
      if (isAdminRoute) return;
      const sections = ['home', 'about', 'services', 'projects', 'process', 'testimonials', 'pricing', 'contact'];
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
    if (isSetupRoute) {
      return (
        <AdminSetup
          onBackToSite={() => {
            window.history.pushState({}, '', '/');
            setIsAdminRoute(false);
            setIsSetupRoute(false);
          }}
          onGoToLogin={() => {
            window.history.pushState({}, '', '/admin');
            setIsSetupRoute(false);
          }}
        />
      );
    }

    return (
      <AdminRoute
        onBackToSite={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
          setIsSetupRoute(false);
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
        activeSection={activeSection}
      />

      <main id="main-content">
        {/* 2. Hero Section (Single H1 on homepage) */}
        <Hero
          onViewWorkClick={scrollToProjects}
          onHireMeClick={() => scrollToContact()}
        />

        {/* 3. About Me Section */}
        <About />

        {/* 4. Services Section (8 Service Cards) */}
        <Services
          onRequestService={(serviceName) => scrollToContact(serviceName)}
        />

        {/* 5. Featured Projects Gallery & Detail Modal (8 Projects) */}
        <Projects />

        {/* 6. Mid-Page High-Conversion CTA Strip */}
        <MidPageCTA
          onStartProject={() => scrollToContact()}
        />

        {/* 7. My Process Section */}
        <Process />

        {/* 8. Testimonials Section */}
        <Testimonials />

        {/* 9. Pricing Section */}
        <Pricing
          onSelectPlan={(planName, serviceCategory) => {
            const budgetMap: Record<string, string> = {
              'Basic Landing Page': 'Under $500',
              'Business Website': '$500 - $1,000',
              'Custom Web App / Booking': '$1,000 - $2,500'
            };
            scrollToContact(serviceCategory, budgetMap[planName] || '$500 - $1,000');
          }}
        />

        {/* 10. FAQ Accordion Section */}
        <FAQ />

        {/* 11. Contact Form & Direct Channels */}
        <Contact
          initialService={selectedService}
          initialBudget={selectedBudget}
        />
      </main>

      {/* 12. Footer */}
      <Footer />

      {/* 13. Floating Contact Button (Messenger as primary) */}
      <FloatingContactButton />

    </div>
  );
}
