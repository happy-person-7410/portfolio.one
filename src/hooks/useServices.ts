import { useState, useCallback, useMemo } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { Service } from '../types';
import { fetchServices } from '../services/portfolioService';

export const useServices = () => {
  const { services, isLoading, error, refreshData } = usePortfolioData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchServices();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh services.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  // Group services by category if needed
  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return Array.from(set);
  }, [services]);

  return {
    services,
    categories,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: services.length,
  };
};

export default useServices;
