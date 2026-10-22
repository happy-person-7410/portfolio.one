import { useState, useCallback, useMemo } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { PricingPlan } from '../types';
import { fetchPricing } from '../services/portfolioService';

export const usePricing = () => {
  const { pricingPlans, isLoading, error, refreshData } = usePortfolioData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchPricing();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh pricing.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  const popularPlan = useMemo(() => {
    return pricingPlans.find((p) => p.isPopular) || pricingPlans[1] || pricingPlans[0];
  }, [pricingPlans]);

  return {
    pricingPlans,
    popularPlan,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: pricingPlans.length,
  };
};

export default usePricing;
