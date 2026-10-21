import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, ArrowUpRight } from 'lucide-react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onHireMeClick: () => void;
  activeSection?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onHireMeClick,
  activeSection = 'home'
}) => {
  const { profile } = usePortfolioData();
  const { theme, toggleTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Web Projects', href: '#projects', id: 'projects' },
    { name: 'Creative & AI', href: '#creative', id: 'creative' },
    { name: 'Before/After', href: '#before-after', id: 'before-after' },
    { name: 'Services', href: '#services', id: 'services' },
    { name: 'Pricing', href: '#pricing', id: 'pricing' },
    { name: 'Add-Ons', href: '#addons', id: 'addons' },
    { name: 'Process', href: '#process', id: 'process' },
    { name: 'Reviews', href: '#testimonials', id: 'testimonials' },
    { name: 'FAQ', href: '#faq', id: 'faq' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      const topOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-[#1e293b] py-3.5' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 md:gap-8">
          
          {/* Zone 1: Brand Wordmark & Cat-Monster Mascot Avatar */}
          <a 
            href="#home" 
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center gap-3 group whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
            aria-label="Happy Person Studio Home"
          >
            {/* Mascot Avatar Icon */}
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-600 dark:bg-blue-600 border border-slate-200 dark:border-slate-700 shadow-xs group-hover:scale-105 transition-transform duration-200 shrink-0">
              <img
                src={profile.avatar}
                alt="Happy Person cat monster mascot"
                width={40}
                height={40}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-xs -z-10">
                {profile.shortName || 'HP'}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {profile.brandName || 'Happy Person'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Independent Creative Studio
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links with Animated Underline Effect (Desktop) */}
          <nav className="hidden lg:flex items-center gap-3 xl:gap-4 text-xs xl:text-[13px] font-medium text-slate-600 dark:text-slate-300 overflow-x-auto scrollbar-none py-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`nav-link-animated py-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0 ${
                    isActive ? 'text-blue-600 dark:text-blue-400 font-semibold active' : ''
                  }`}
                >
                  {link.name}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Actions (Theme Toggle + Hire Me CTA) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Dark / Light Toggle Button */}
            <button
              onClick={toggleTheme}
              className="relative p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100/80 hover:bg-slate-200 dark:bg-[#171f33] dark:hover:bg-[#1e293b] border border-slate-200/80 dark:border-[#1e293b] transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 active:scale-95"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 rotate-0 hover:-rotate-12" />
              )}
            </button>

            <button
              onClick={onHireMeClick}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:scale-95 cursor-pointer whitespace-nowrap shrink-0 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <span>Hire Happy Person</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#171f33] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 dark:bg-[#0b0f17]/98 backdrop-blur-xl border-b border-slate-200 dark:border-[#1e293b] px-6 py-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3.5 py-2.5 rounded-xl text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </a>
            ))}

            {/* Mobile Theme Switcher Row */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#1e293b] flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Interface Theme
              </span>
              <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#171f33] border border-slate-200 dark:border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-[#111726] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Mobile CTA */}
            <div className="pt-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onHireMeClick();
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>Hire Happy Person</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
