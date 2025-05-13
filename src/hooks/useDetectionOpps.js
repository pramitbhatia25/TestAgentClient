import { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../providers/server'; 
export const useDetectionOpps = (user) => {
  const [detectionOpps, setDetectionOpps] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const transformData = (data) => {
    const transformed = {};
    
    if (data.cisa_data) {
      transformed.cisa_data = data.cisa_data.records.map((record, index) => ({
        id: index + 1,
        ruleText: record.data || "",
        revision_id: "Not Deployed Yet",
        name: record.title,
        status: record.Status != null ? record.Status : "New",
        create_time: record.datetime,
        description: record.title,
        alerting: false,
        archive_time: "",
        archived: false,
        enabled: false,
        resource_name: record.title,
        revision_create_time: record.datetime,
        run_frequency: "Not Deployed Yet",
        type: "Not Deployed Yet",
        url: record.url,
        source: 'CISA'
      }));
    }

    if (data.github_data) {
      transformed.github_data = data.github_data.map((record, index) => ({
        // Add appropriate transformation based on GitHub data structure
        // This is a placeholder - implement based on actual data
        ...record,
        id: index + 1,
        source: 'GitHub'
      }));
    }

    // Add more source transformations as needed
    return transformed;
  };

  const fetchDetectionOpps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${SERVER_URL}/detections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });
      const data = await response.json();
      const transformedData = transformData(data);
      setDetectionOpps(transformedData);
      console.log(transformedData);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching detection opportunities:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDetectionOpps();
  }, [fetchDetectionOpps]);

  return {
    detectionOpps,
    detections_loading: loading,
    detections_error: error,
    detections_refresh: fetchDetectionOpps
  };
}; 