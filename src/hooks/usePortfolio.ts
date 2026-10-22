import { usePortfolioData } from '../context/PortfolioDataContext';

/**
 * usePortfolio
 * Root custom hook providing unified access to the PortfolioDataProvider context,
 * server sync status, and global refresh methods.
 */
export const usePortfolio = () => {
  const context = usePortfolioData();

  const hasData =
    context.projects.length > 0 ||
    context.creativeWorks.length > 0 ||
    context.services.length > 0;

  return {
    ...context,
    hasData,
  };
};

export default usePortfolio;
