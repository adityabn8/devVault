import { useState, useEffect, useCallback } from 'react';
import { getVaults, createVault, updateVault, deleteVault } from '../services/vaultService';

const useVaults = () => {
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVaults = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getVaults(params);
      setVaults(data.vaults || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVaults(); }, [fetchVaults]);

  const create = useCallback(async (data) => {
    const res = await createVault(data);
    await fetchVaults();
    return res.data.vault;
  }, [fetchVaults]);

  const update = useCallback(async (id, data) => {
    const res = await updateVault(id, data);
    setVaults((prev) => prev.map((v) => (v._id === id ? res.data.vault : v)));
    return res.data.vault;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteVault(id);
    setVaults((prev) => prev.filter((v) => v._id !== id));
  }, []);

  return { vaults, loading, error, fetchVaults, create, update, remove };
};

export default useVaults;
