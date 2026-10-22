import { useState, useCallback, useMemo } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { Testimonial } from '../types';
import { fetchTestimonials } from '../services/portfolioService';

export const useTestimonials = () => {
  const { testimonials, isLoading, error, refreshData } = usePortfolioData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchTestimonials();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh testimonials.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  const averageRating = useMemo(() => {
    if (!testimonials || testimonials.length === 0) return 5;
    const total = testimonials.reduce((acc, t) => acc + (t.rating || 5), 0);
    return Math.round((total / testimonials.length) * 10) / 10;
  }, [testimonials]);

  const fiveStarCount = useMemo(() => {
    return testimonials.filter((t) => t.rating === 5).length;
  }, [testimonials]);

  return {
    testimonials,
    averageRating,
    fiveStarCount,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: testimonials.length,
  };
};

export default useTestimonials;
