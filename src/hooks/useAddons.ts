import { useState, useCallback } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { fetchAddons } from '../services/portfolioService';
import { ADDON_SERVICES as DEFAULT_ADDONS } from '../data/pricingData';

export const useAddons = () => {
  const { addons, isLoading, error, refreshData } = usePortfolioData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchAddons();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh add-ons.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  return {
    addons: addons && addons.length > 0 ? addons : DEFAULT_ADDONS,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: (addons && addons.length > 0 ? addons : DEFAULT_ADDONS).length,
  };
};

export default useAddons;
