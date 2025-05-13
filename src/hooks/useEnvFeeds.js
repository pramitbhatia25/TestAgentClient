import { useState, useEffect } from 'react';
import { SERVER_URL } from '../providers/server';
const useEnvFeeds = (environments, user) => {
  const [feeds, setFeeds] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeeds = async () => {
    if (!environments || environments.length === 0) {
      setError('No environments provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_URL}/list_feeds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ environments, user }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feeds');
      }

      if (data.status === 'error') {
        throw new Error(data.error_message);
      }

      setFeeds(data.feeds);
      console.log("feeds", data.feeds);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
    // eslint-disable-next-line
  }, [environments]);

  const refreshFeeds = () => {
    fetchFeeds();
  };

  return {
    feeds,
    feeds_environments: environments,
    feeds_loading: loading,
    feeds_error: error,
    refreshFeeds,
  };
};

export default useEnvFeeds;
