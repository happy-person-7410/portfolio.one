import { useState, useCallback } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { FaqItem } from '../types';
import { fetchFaqs } from '../services/portfolioService';

export const useFaqs = (initialOpenIndex: number | null = 0) => {
  const { faqs, isLoading, error, refreshData } = usePortfolioData();
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const toggleAccordion = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchFaqs();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh FAQs.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  return {
    faqs,
    openIndex,
    setOpenIndex,
    toggleAccordion,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
    totalCount: faqs.length,
  };
};

export default useFaqs;
