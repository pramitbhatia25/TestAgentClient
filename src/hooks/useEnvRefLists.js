import { useState, useEffect } from 'react';
import { SERVER_URL } from '../providers/server'; 
const useEnvRefLists = (environments, user) => {
  const [refLists, setRefLists] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRefLists = async () => {
    if (!environments || environments.length === 0) {
      setError('No environments provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/list_reference_lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environments, user }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reference lists');
      }

      if (data.status === 'error') {
        throw new Error(data.error_message);
      }

      setRefLists(data.reference_lists);
      console.log("refLists", data.reference_lists);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefLists();
  }, [environments]);

  const refreshRefLists = () => {
    fetchRefLists();
  };

  return {
    refLists,
    refLists_environments: environments,
    refLists_loading: loading,
    refLists_error: error,
    refreshRefLists,
  };
};

export default useEnvRefLists;
