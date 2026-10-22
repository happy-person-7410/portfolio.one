import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Wrench,
  BadgeDollarSign,
  MessageSquareQuote,
  HelpCircle,
  Settings,
  LayoutDashboard,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit,
  Star,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Inbox,
  CheckCheck,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolioData } from '../../context/PortfolioDataContext';
import { useTheme } from '../../context/ThemeContext';
import { Project, Service, PricingPlan, Testimonial, FaqItem } from '../../types';
import {
  saveProject,
  deleteProject,
  deleteTestimonial,
  deleteFaq,
  saveSiteProfile,
  forceSeedDatabase,
  seedInitialDataIfEmpty,
  fetchContactRequests,
  updateContactRequestStatus,
  deleteContactRequest,
  initDatabaseOnServer,
  StoredContactRequest,
  saveCreativeWork,
  deleteCreativeWork,
  fetchStorageStatus,
  StorageStatusResponse,
} from '../../services/portfolioService';
import { ProjectEditModal } from './ProjectEditModal';
import { ServiceEditModal } from './ServiceEditModal';
import { PricingEditModal } from './PricingEditModal';
import { TestimonialEditModal } from './TestimonialEditModal';
import { FaqEditModal } from './FaqEditModal';
import { CreativeWorkEditModal } from './CreativeWorkEditModal';
import { ImageUploader } from './ImageUploader';
import { AssetInventoryView, ASSET_INVENTORY_DATA } from './AssetInventoryView';
import { CreativeItem, CreativeCategory } from '../../data/creativeData';

interface AdminDashboardProps {
  onBackToSite: () => void;
}

type TabType = 'overview' | 'projects' | 'creative' | 'services' | 'pricing' | 'testimonials' | 'faqs' | 'inquiries' | 'settings' | 'assets';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToSite }) => {
  const { user, ownerEmail, logout } = useAuth();
  const { projects, creativeWorks, services, pricingPlans, testimonials, faqs, profile, isOnline } = usePortfolioData();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('projects');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [reSeeding, setReSeeding] = useState(false);
  const [syncingDb, setSyncingDb] = useState(false);
  const [inquiries, setInquiries] = useState<StoredContactRequest[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatusResponse | null>(null);

  // Creative works filter
  const [creativeCategoryFilter, setCreativeCategoryFilter] = useState<CreativeCategory | 'All'>('All');

  // Modals state
  const [editingProject, setEditingProject] = useState<Project | null | undefined>(undefined);
  const [editingCreative, setEditingCreative] = useState<CreativeItem | null | undefined>(undefined);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingPricing, setEditingPricing] = useState<PricingPlan | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null | undefined>(undefined);
  const [editingFaq, setEditingFaq] = useState<FaqItem | null | undefined>(undefined);

  // Settings form state
  const [profileForm, setProfileForm] = useState(profile);
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchStorageStatus().then(setStorageStatus).catch(() => {});
  }, []);

  useEffect(() => {
    if (profile) {
      setProfileForm(profile);
    }
  }, [profile]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Auto-seed database on owner login if empty
  useEffect(() => {
    let mounted = true;
    seedInitialDataIfEmpty().then((seeded) => {
      if (seeded && mounted) {
        showToast('Initialized database with default showcase portfolio data!');
      }
    }).catch((err) => {
      console.warn('Auto-seed check note:', err);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleReSeed = async () => {
    if (window.confirm('Reset/Re-seed all portfolio data in database with default rich data?')) {
      setReSeeding(true);
      try {
        await forceSeedDatabase();
        showToast('Database re-seeded successfully!');
      } catch (err) {
        alert('Failed to reseed: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setReSeeding(false);
      }
    }
  };

  const handleToggleFeatured = async (p: Project) => {
    try {
      await saveProject({ ...p, featured: !p.featured });
      showToast(`Project "${p.title}" ${!p.featured ? 'featured' : 'unfeatured'}`);
    } catch {
      alert('Failed to update project status');
    }
  };

  const handleToggleHidden = async (p: Project) => {
    try {
      await saveProject({ ...p, hidden: !p.hidden });
      showToast(`Project "${p.title}" ${!p.hidden ? 'hidden from public' : 'visible on public site'}`);
    } catch {
      alert('Failed to update project status');
    }
  };

  const handleDeleteProject = async (p: Project) => {
    if (window.confirm(`Are you sure you want to delete "${p.title}"?`)) {
      try {
        await deleteProject(p.id);
        showToast(`Project "${p.title}" deleted.`);
      } catch {
        alert('Failed to delete project');
      }
    }
  };

  const handleMoveProject = async (p: Project, direction: 'up' | 'down') => {
    const sorted = [...projects].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = sorted.findIndex((item) => item.id === p.id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === sorted.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const currentOrder = p.order || idx + 1;
    const swapOrder = sorted[swapIdx].order || swapIdx + 1;

    try {
      await saveProject({ ...p, order: swapOrder });
      await saveProject({ ...sorted[swapIdx], order: currentOrder });
      showToast('Project order updated');
    } catch {
      alert('Failed to reorder projects');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await saveSiteProfile(profileForm);
      showToast('Profile & Contact information updated in database!');
    } catch (err: unknown) {
      alert('Failed to save profile: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSavingProfile(false);
    }
  };

  const loadInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const data = await fetchContactRequests();
      setInquiries(data);
    } catch (err) {
      console.warn('Failed to fetch inquiries:', err);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'inquiries') {
      loadInquiries();
    }
  }, [activeTab]);

  const handleUpdateInquiryStatus = async (id: string, status: string) => {
    const ok = await updateContactRequestStatus(id, status);
    if (ok) {
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status } : inq)));
      showToast(`Inquiry marked as ${status}`);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (window.confirm('Delete this inquiry?')) {
      const ok = await deleteContactRequest(id);
      if (ok) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        showToast('Inquiry deleted');
      }
    }
  };

  const handleSyncDatabase = async () => {
    setSyncingDb(true);
    try {
      const res = await initDatabaseOnServer();
      showToast('Neon database migrated and verified successfully!');
      if (res.log && res.log.length > 0) {
        console.log('Migration log:', res.log);
      }
    } catch (err: unknown) {
      alert('Database sync notice: ' + ((err as Error).message || String(err)));
    } finally {
      setSyncingDb(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
            HP
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm tracking-tight text-slate-100">Happy Person Studio CMS</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live DB
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Free Assets (/public/images/)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Owner: {user?.email || ownerEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onBackToSite}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-medium transition cursor-pointer border border-slate-700/60"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Public Site
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-60 border-r border-slate-800 bg-slate-900/40 p-4 shrink-0 hidden md:flex flex-col justify-between">
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <FolderKanban className="w-4 h-4" /> Projects Showcase
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{projects.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('creative')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'creative'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4" /> Creative & AI Work
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{creativeWorks.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Wrench className="w-4 h-4" /> Services (8)
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{services.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <BadgeDollarSign className="w-4 h-4" /> Pricing Plans
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{pricingPlans.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'testimonials'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <MessageSquareQuote className="w-4 h-4" /> Testimonials
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{testimonials.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('faqs')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'faqs'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4" /> FAQs
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{faqs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" /> Client Inquiries
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{inquiries.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'assets'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4" /> Image Inventory
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px]">{ASSET_INVENTORY_DATA.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" /> Profile & Contact Info
              </span>
            </button>
          </nav>

          {/* Bottom Storage sync box */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-blue-400" /> Local Studio Storage
              </span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Changes sync instantly across public site and CMS.
            </p>
            <button
              onClick={handleReSeed}
              disabled={reSeeding}
              className="w-full mt-2 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${reSeeding ? 'animate-spin' : ''}`} />
              Reset to Default Data
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          
          {/* Toast Notification */}
          {successToast && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 shadow-lg animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* TAB: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Portfolio Projects</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage portfolio case studies, live demo links, videos, and display order.
                  </p>
                </div>
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add New Project
                </button>
              </div>

              {/* Projects Table / Card List */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="divide-y divide-slate-800">
                  {projects.map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Thumbnail */}
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-16 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                        />
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-slate-100 truncate">{p.title}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-blue-400 border border-slate-700">
                              {p.category}
                            </span>
                            {p.featured && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                <Star className="w-3 h-3 fill-amber-400" /> Featured
                              </span>
                            )}
                            {p.hidden && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> Hidden
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 truncate mt-1 max-w-xl">{p.description}</p>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                            <span>Client: {p.client}</span>
                            <span>•</span>
                            <a
                              href={p.liveDemoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Demo <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Reorder */}
                        <button
                          onClick={() => handleMoveProject(p, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveProject(p, 'down')}
                          disabled={idx === projects.length - 1}
                          title="Move Down"
                          className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        {/* Toggle Featured */}
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          title={p.featured ? 'Unfeature' : 'Mark as Featured'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            p.featured ? 'text-amber-400 bg-amber-500/10' : 'text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <Star className="w-4 h-4" />
                        </button>

                        {/* Toggle Hidden */}
                        <button
                          onClick={() => handleToggleHidden(p)}
                          title={p.hidden ? 'Make Visible' : 'Hide from Public'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            p.hidden ? 'text-red-400 bg-red-500/10' : 'text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {p.hidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditingProject(p)}
                          title="Edit Project"
                          className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteProject(p)}
                          title="Delete Project"
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CREATIVE & AI WORKS */}
          {activeTab === 'creative' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Creative & AI Work Showcase</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage vector logos, social media banners, AI concept imagery, and cinematic AI motion reels.
                  </p>
                </div>
                <button
                  onClick={() => setEditingCreative(null)}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/25 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Creative Work
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['All', 'Logos & Branding', 'Banners & Social Media', 'AI Images', 'AI Videos'] as (CreativeCategory | 'All')[]).map((cat) => {
                  const isCurrent = creativeCategoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCreativeCategoryFilter(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {creativeWorks
                  .filter((item) => creativeCategoryFilter === 'All' || item.category === creativeCategoryFilter)
                  .map((item, idx, arr) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition group shadow-md"
                    >
                      <div>
                        {/* Thumbnail / Video Badge */}
                        <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/brand/happy-person-mascot.webp';
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-semibold text-white border border-white/10">
                              {item.category}
                            </span>
                          </div>
                          {item.category === 'AI Videos' && (
                            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-red-600/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                              {item.youtubeUrl || item.youtubeId ? 'YouTube Embed' : 'Direct R2 Video'}
                            </div>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-100 mb-1">{item.title}</h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                          {item.shortDescription}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 mb-2">
                          {item.toolsUsed?.map((tool) => (
                            <span
                              key={tool}
                              className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md font-mono"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={async () => {
                              const list = [...creativeWorks];
                              const i = list.findIndex((c) => c.id === item.id);
                              if (i > 0) {
                                const swap = list[i - 1];
                                await saveCreativeWork({ ...item, order: (swap.order || i) - 1 });
                                showToast('Reordered creative work');
                              }
                            }}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-25 cursor-pointer"
                            title="Move earlier"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              const list = [...creativeWorks];
                              const i = list.findIndex((c) => c.id === item.id);
                              if (i < list.length - 1) {
                                const swap = list[i + 1];
                                await saveCreativeWork({ ...item, order: (swap.order || i) + 1 });
                                showToast('Reordered creative work');
                              }
                            }}
                            disabled={idx === arr.length - 1}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-25 cursor-pointer"
                            title="Move later"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingCreative(item)}
                            className="px-2.5 py-1 text-xs text-blue-400 hover:bg-blue-500/10 rounded-lg transition font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete creative work "${item.title}"?`)) {
                                await deleteCreativeWork(item.id);
                                showToast(`Deleted "${item.title}"`);
                              }
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Services Offerings (8 Cards)</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Customize the 8 service cards shown on the website including deliverables and benefits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {s.id}
                        </span>
                        <button
                          onClick={() => setEditingService(s)}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>
                      <h3 className="text-base font-bold text-slate-100 mb-1.5">{s.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{s.description}</p>
                      
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Deliverables:</span>
                        {s.highlights.map((h, i) => (
                          <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-6xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Pricing Packages</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Update upfront pricing estimates, turnaround guarantees, and package deliverables.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-6 rounded-3xl bg-slate-900 border transition flex flex-col justify-between ${
                      plan.isRecommended ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-slate-100">{plan.name}</h3>
                        <button
                          onClick={() => setEditingPricing(plan)}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                      </div>

                      <div className="mb-3">
                        <span className="text-2xl font-extrabold text-slate-100">{plan.price}</span>
                        <span className="text-xs text-slate-400 ml-1.5">/ project</span>
                      </div>

                      <p className="text-xs text-slate-400 mb-4">{plan.subtitle}</p>
                      
                      <div className="space-y-2 border-t border-slate-800 pt-4">
                        {plan.features.map((f, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                      Turnaround: <span className="text-slate-200 font-medium">{plan.turnaroundTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Client Testimonials</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage client reviews, star ratings, and social proof quotes.
                  </p>
                </div>
                <button
                  onClick={() => setEditingTestimonial(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Review
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingTestimonial(t)}
                            className="p-1 text-blue-400 hover:bg-slate-800 rounded-md cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(`Delete review from ${t.name}?`)) {
                                await deleteTestimonial(t.id);
                                showToast('Testimonial removed');
                              }
                            }}
                            className="p-1 text-red-400 hover:bg-slate-800 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 italic mb-4 leading-relaxed">"{t.quote}"</p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                      <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{t.name}</h4>
                        <p className="text-[11px] text-slate-400">{t.role} · {t.businessType}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: FAQS */}
          {activeTab === 'faqs' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Frequently Asked Questions</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage FAQs answered on the public website.
                  </p>
                </div>
                <button
                  onClick={() => setEditingFaq(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Question
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, idx) => (
                  <div
                    key={faq.id || idx}
                    className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-1">{faq.question}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setEditingFaq(faq)}
                        className="p-1.5 text-blue-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (faq.id && window.confirm('Delete this FAQ question?')) {
                            await deleteFaq(faq.id);
                            showToast('FAQ deleted');
                          }
                        }}
                        className="p-1.5 text-red-400 hover:bg-slate-800 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: CLIENT INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Client Contact Requests & Inquiries</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct inquiries saved securely in your Neon PostgreSQL database from the website contact form.
                  </p>
                </div>
                <button
                  onClick={loadInquiries}
                  disabled={loadingInquiries}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingInquiries ? 'animate-spin' : ''}`} /> Refresh Inbox
                </button>
              </div>

              {loadingInquiries ? (
                <div className="py-16 text-center text-slate-500">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs">Loading inquiries from Neon database...</p>
                </div>
              ) : inquiries.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl">
                  <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-300">No Inquiries Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    When prospective clients fill out the contact form on your portfolio, their project requirements, budget, and contact info will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-sm font-bold text-slate-100">{req.name}</span>
                          {req.business_name && (
                            <span className="text-xs text-slate-400">· {req.business_name}</span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                              req.status === 'contacted'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                          {req.service_needed && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">Service</span>
                              <span className="text-slate-200">{req.service_needed}</span>
                            </div>
                          )}
                          {req.budget_range && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">Budget</span>
                              <span className="text-emerald-400 font-medium">{req.budget_range}</span>
                            </div>
                          )}
                          {req.preferred_contact && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">Preferred Channel</span>
                              <span className="text-blue-400 font-medium">{req.preferred_contact}</span>
                            </div>
                          )}
                        </div>

                        {req.project_details && (
                          <div className="p-3 bg-slate-950/60 rounded-xl text-xs text-slate-300 border border-slate-800/80 mt-2">
                            <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Project Details</span>
                            <p className="whitespace-pre-line leading-relaxed">{req.project_details}</p>
                          </div>
                        )}

                        <div className="text-[10px] text-slate-500">
                          Submitted: {new Date(req.created_at).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center gap-2 shrink-0">
                        {req.status !== 'contacted' ? (
                          <button
                            onClick={() => handleUpdateInquiryStatus(req.id, 'contacted')}
                            className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCheck className="w-3.5 h-3.5" /> Mark Contacted
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateInquiryStatus(req.id, 'new')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-xs font-medium transition cursor-pointer"
                          >
                            Mark New
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteInquiry(req.id)}
                          className="p-1.5 text-red-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SETTINGS & PROFILE */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Studio Profile & Database Management</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your Neon PostgreSQL connection, safe migrations, brand identity, and direct communication channels.
                </p>
              </div>

              {/* Neon Database Management Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                        Neon PostgreSQL Database Connection
                      </h2>
                      <p className="text-xs text-slate-400">
                        Integrated via Cloudflare Pages Functions and @neondatabase/serverless driver.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSyncDatabase}
                    disabled={syncingDb}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${syncingDb ? 'animate-spin' : ''}`} />
                    {syncingDb ? 'Verifying Schema...' : 'Run Safe Migrations & Sync'}
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                  <span className="text-emerald-400 font-semibold">✓ Safe & Idempotent: </span>
                  Running migrations never drops or resets your existing database data. It checks each table (<code>projects</code>, <code>site_settings</code>, <code>creative_works</code>, <code>services</code>, <code>pricing_plans</code>, <code>testimonials</code>, <code>contact_requests</code>, <code>admin_users</code>) using <code>CREATE TABLE IF NOT EXISTS</code>.
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Brand / Studio Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.brandName}
                      onChange={(e) => setProfileForm({ ...profileForm, brandName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Studio Type</label>
                    <input
                      type="text"
                      required
                      value={profileForm.studioType}
                      onChange={(e) => setProfileForm({ ...profileForm, studioType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Hero Headline</label>
                  <input
                    type="text"
                    required
                    value={profileForm.headline}
                    onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Hero Subheading</label>
                  <textarea
                    rows={2}
                    required
                    value={profileForm.subheading}
                    onChange={(e) => setProfileForm({ ...profileForm, subheading: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">About Bio</label>
                  <textarea
                    rows={4}
                    required
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-800">
                  <ImageUploader
                    value={profileForm.avatar}
                    onChange={(url) => setProfileForm({ ...profileForm, avatar: url })}
                    folder="brand"
                    label="Brand Mascot Avatar Image"
                    description="Upload directly from computer to repository /public/images/brand/. Square avatar."
                    aspectRatio="square"
                    recommendedDimensions="400 × 400px"
                    presetChoices={[
                      { label: 'Happy Mascot', url: '/images/brand/happy-person-mascot.webp' },
                      { label: 'Studio Badge', url: '/images/creative/logo-brand-01.webp' }
                    ]}
                  />

                  <ImageUploader
                    value={profileForm.ogBanner || '/images/banners/og-preview.webp'}
                    onChange={(url) => setProfileForm({ ...profileForm, ogBanner: url })}
                    folder="brand"
                    label="Open Graph / Social Preview Banner"
                    description="Preview image when shared across Facebook, Messenger, WhatsApp, and LinkedIn."
                    aspectRatio="wide"
                    recommendedDimensions="1200 × 630px"
                    presetChoices={[
                      { label: 'Studio OG Banner', url: '/images/banners/og-preview.webp' },
                      { label: 'Panoramic Banner', url: '/images/banners/happy-person-banner.webp' }
                    ]}
                  />
                </div>

                {/* Primary & Direct Messaging Channels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Facebook Messenger URL (Primary Channel)</span>
                      <span className="text-[10px] text-blue-400 font-semibold uppercase">Primary Method</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://m.me/happyperson7410"
                      value={profileForm.messengerUrl || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProfileForm({ 
                          ...profileForm, 
                          messengerUrl: val,
                          socials: { ...profileForm.socials, messenger: val }
                        });
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Direct link to your Messenger chat (e.g. <code>https://m.me/yourusername</code> or Facebook page)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Facebook Profile / Page Link</label>
                    <input
                      type="url"
                      placeholder="https://www.facebook.com/happyperson7410"
                      value={profileForm.socials?.facebook || ''}
                      onChange={(e) => setProfileForm({
                        ...profileForm,
                        socials: { ...profileForm.socials, facebook: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Public Facebook page or profile linked across the site
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Contact Email (Backup)
                    </label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      WhatsApp / Phone (Secondary)
                    </label>
                    <input
                      type="text"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Availability Status</label>
                    <input
                      type="text"
                      value={profileForm.availability}
                      onChange={(e) => setProfileForm({ ...profileForm, availability: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-xs shadow-lg shadow-blue-600/25 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Save Profile Settings'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: ASSETS INVENTORY */}
          {activeTab === 'assets' && <AssetInventoryView />}

        </main>
      </div>

      {/* Modals */}
      {editingProject !== undefined && (
        <ProjectEditModal
          project={editingProject}
          isOpen={true}
          totalProjects={projects.length}
          onClose={() => setEditingProject(undefined)}
          onSaved={() => showToast(editingProject ? 'Project updated successfully' : 'New project added')}
        />
      )}

      {editingService && (
        <ServiceEditModal
          service={editingService}
          isOpen={true}
          onClose={() => setEditingService(null)}
          onSaved={() => showToast('Service updated successfully')}
        />
      )}

      {editingPricing && (
        <PricingEditModal
          plan={editingPricing}
          isOpen={true}
          onClose={() => setEditingPricing(null)}
          onSaved={() => showToast('Pricing package updated successfully')}
        />
      )}

      {editingTestimonial !== undefined && (
        <TestimonialEditModal
          testimonial={editingTestimonial}
          isOpen={true}
          onClose={() => setEditingTestimonial(undefined)}
          onSaved={() => showToast('Testimonial saved successfully')}
        />
      )}

      {editingFaq !== undefined && (
        <FaqEditModal
          faq={editingFaq}
          isOpen={true}
          totalFaqs={faqs.length}
          onClose={() => setEditingFaq(undefined)}
          onSaved={() => showToast('FAQ saved successfully')}
        />
      )}

      {editingCreative !== undefined && (
        <CreativeWorkEditModal
          item={editingCreative}
          isOpen={true}
          totalItems={creativeWorks.length}
          onClose={() => setEditingCreative(undefined)}
          onSaved={() => showToast(editingCreative ? 'Creative work updated successfully' : 'New creative work added')}
        />
      )}

    </div>
  );
};
