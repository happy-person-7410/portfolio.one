import { useState, useMemo, useCallback } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { Project } from '../types';
import { fetchProjects } from '../services/portfolioService';

export interface UseProjectsOptions {
  initialCategory?: string;
  autoFilterHidden?: boolean;
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const { initialCategory = 'All', autoFilterHidden = true } = options;
  const { projects, isLoading, error, refreshData } = usePortfolioData();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const categories = useMemo(() => {
    return [
      'All',
      'Business',
      'Booking',
      'Restaurant',
      'Real Estate',
      'E-commerce',
      'Dashboard',
    ];
  }, []);

  const visibleProjects = useMemo(() => {
    if (!autoFilterHidden) return projects;
    return projects.filter((p) => !p.hidden);
  }, [projects, autoFilterHidden]);

  const featuredProjects = useMemo(() => {
    return visibleProjects.filter((p) => p.featured);
  }, [visibleProjects]);

  const filteredProjects = useMemo(() => {
    let result = visibleProjects;

    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => {
        if (selectedCategory === 'Business') return p.category.includes('Business');
        if (selectedCategory === 'Booking') return p.category.includes('Booking');
        if (selectedCategory === 'Dashboard') return p.category.includes('Dashboard');
        return p.category === selectedCategory;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some((t: string) => t.toLowerCase().includes(query)) ||
          (p.client || '').toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchTerm, visibleProjects]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      // Also perform direct Firestore fetch to guarantee freshness
      await fetchProjects();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh projects.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  return {
    projects,
    visibleProjects,
    filteredProjects,
    featuredProjects,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: projects.length,
    visibleCount: filteredProjects.length,
  };
};

export default useProjects;
