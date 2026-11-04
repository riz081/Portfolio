import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

const EMPTY = {
  bio: null,
  skill_groups: [],
  experiences: [],
  education: [],
  projects: [],
};

const PortfolioContext = createContext({
  data: EMPTY,
  status: 'loading', // 'loading' | 'success' | 'error'
  reload: () => {},
});

export function PortfolioProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading');

  const reload = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await api.fetchPortfolio();
      setData(res.data || EMPTY);
      setStatus('success');
    } catch (e) {
      console.error('[portfolio] load error:', e);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <PortfolioContext.Provider value={{ data, status, reload }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  return useContext(PortfolioContext);
}