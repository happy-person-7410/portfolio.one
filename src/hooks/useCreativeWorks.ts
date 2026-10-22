import { useState, useMemo, useCallback } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { CreativeCategory, CreativeItem, CREATIVE_ITEMS } from '../data/creativeData';
import { fetchCreativeWorks } from '../services/portfolioService';

export interface UseCreativeWorksOptions {
  initialCategory?: CreativeCategory | 'All';
}

export const useCreativeWorks = (options: UseCreativeWorksOptions = {}) => {
  const { initialCategory = 'Logos & Branding' } = options;
  const { creativeWorks, isLoading, error, refreshData } = usePortfolioData();

  const [selectedTab, setSelectedTab] = useState<CreativeCategory | 'All'>(initialCategory);
  const [previewItem, setPreviewItem] = useState<CreativeItem | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const categories: Array<CreativeCategory | 'All'> = useMemo(() => {
    return [
      'Logos & Branding',
      'Banners & Social Media',
      'AI Images',
      'AI Videos',
      'All',
    ];
  }, []);

  const itemsToDisplay = useMemo(() => {
    return creativeWorks && creativeWorks.length > 0 ? creativeWorks : CREATIVE_ITEMS;
  }, [creativeWorks]);

  const filteredWorks = useMemo(() => {
    if (selectedTab === 'All') return itemsToDisplay;
    return itemsToDisplay.filter((item) => item.category === selectedTab);
  }, [selectedTab, itemsToDisplay]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchCreativeWorks();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh creative works.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  return {
    creativeWorks: itemsToDisplay,
    filteredWorks,
    categories,
    selectedTab,
    setSelectedTab,
    previewItem,
    setPreviewItem,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: itemsToDisplay.length,
    filteredCount: filteredWorks.length,
  };
};

export default useCreativeWorks;
