import { useState, useCallback, useMemo } from 'react';
import { usePortfolioData } from '../context/PortfolioDataContext';
import { CONTACT_CONFIG } from '../data/contactConfig';
import { fetchSiteProfile } from '../services/portfolioService';

export const useSiteProfile = () => {
  const { profile, isLoading, error, refreshData } = usePortfolioData();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setFetchError(null);
    try {
      await refreshData();
      await fetchSiteProfile();
    } catch (err: unknown) {
      setFetchError((err as Error).message || 'Failed to refresh profile.');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshData]);

  const messengerUrl = useMemo(() => {
    return profile.messengerUrl || CONTACT_CONFIG.messengerUrl;
  }, [profile.messengerUrl]);

  const whatsappUrl = useMemo(() => {
    return profile.whatsappUrl || CONTACT_CONFIG.whatsAppUrl;
  }, [profile.whatsappUrl]);

  const email = useMemo(() => {
    return profile.email || CONTACT_CONFIG.email;
  }, [profile.email]);

  const facebookPageUrl = useMemo(() => {
    return profile.facebookPageUrl || CONTACT_CONFIG.facebookPageUrl;
  }, [profile.facebookPageUrl]);

  return {
    profile,
    messengerUrl,
    whatsappUrl,
    email,
    facebookPageUrl,
    isLoading: isLoading || isRefreshing,
    error: fetchError || error,
    refresh,
  };
};

export default useSiteProfile;
