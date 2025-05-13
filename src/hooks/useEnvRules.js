import { useState, useEffect } from 'react';
import { SERVER_URL } from '../providers/server'; 
const useEnvRules = (environments, user) => {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRules = async () => {
    if (!environments || environments.length === 0) {
      setError('No environments provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/list_rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environments, user }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch rules');
      }

      if (data.status === 'error') {
        throw new Error(data.error_message);
      }

      setRules(data.rules);
      console.log("rules", data.rules);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [environments]);

  const refreshRules = () => {
    fetchRules();
  };

  return {
    rules,
    rules_environments: environments,
    rules_loading: loading,
    rules_error: error,
    refreshRules,
  };
};

export default useEnvRules; 