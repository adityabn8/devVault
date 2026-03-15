import { useState, useCallback } from 'react';
import { getResources } from '../services/resourceService';

const useResources = (vaultId) => {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async (params = {}) => {
    if (!vaultId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getResources({ vault: vaultId, ...params });
      setResources(data.resources || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  return { resources, pagination, loading, error, fetchResources };
};

export default useResources;
