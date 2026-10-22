import { useState, useEffect, useCallback } from 'react';
import {
  fetchContactRequests,
  updateContactRequestStatus,
  deleteContactRequest,
  StoredContactRequest,
} from '../services/portfolioService';

export const useInquiries = (autoFetch: boolean = true) => {
  const [inquiries, setInquiries] = useState<StoredContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchContactRequests();
      setInquiries(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to load inquiries.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchInquiries();
    }
  }, [autoFetch, fetchInquiries]);

  const updateStatus = useCallback(
    async (id: string, status: 'new' | 'in_review' | 'contacted' | 'archived') => {
      try {
        await updateContactRequestStatus(id, status);
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        );
      } catch (err: unknown) {
        throw new Error((err as Error).message || 'Failed to update status.');
      }
    },
    []
  );

  const removeInquiry = useCallback(async (id: string) => {
    try {
      await deleteContactRequest(id);
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      throw new Error((err as Error).message || 'Failed to delete inquiry.');
    }
  }, []);

  const unreadCount = inquiries.filter((i) => i.status === 'new').length;

  return {
    inquiries,
    unreadCount,
    isLoading,
    error,
    refresh: fetchInquiries,
    updateStatus,
    removeInquiry,
  };
};

export default useInquiries;
