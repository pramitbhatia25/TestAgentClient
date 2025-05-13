import { useState, useEffect } from 'react';
import { SERVER_URL } from '../providers/server';
const useAccess = (user) => {
  const [role, setRole] = useState(null);
  const [environments, setEnvironments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    if (!user?.email) return;

    const fetchAccess = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch role (and environments)
        const roleRes = await fetch(`${SERVER_URL}/get_role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user }),
        });
        const roleData = await roleRes.json();
        console.log("Fetched role data:", roleData);
        if (!roleRes.ok) throw new Error(roleData.error || 'Failed to fetch role');
        setRole(roleData.role);
        setEnvironments(roleData.environments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccess();
  }, [user?.email, refreshCount]);

  const refreshAccess = () => setRefreshCount(c => c + 1);

  return { role, environments, loading, error, refreshAccess };
};

export default useAccess;
