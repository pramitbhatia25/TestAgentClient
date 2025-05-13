import { useState, useEffect, useCallback } from 'react';
import { SERVER_URL } from '../providers/server';

const useAdmin = (user, role) => {
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch only customers
  const refreshCustomers = useCallback(async () => {
    if (role !== "Admin" || !user) return;
    setLoading(true);
    setError(null);
    try {
      const customersRes = await fetch(`${SERVER_URL}/list_customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
      const customersData = await customersRes.json();
      if (!customersRes.ok) throw new Error(customersData.error || "Failed to fetch customers");
      setCustomers(customersData.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  // Fetch both users and customers
  const refresh = useCallback(async () => {
    if (role !== "Admin" || !user) return;
    setLoading(true);
    setError(null);
    try {
      const [usersRes, customersRes] = await Promise.all([
        fetch(`${SERVER_URL}/get_users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        }),
        fetch(`${SERVER_URL}/list_customers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user }),
        }),
      ]);
      const usersData = await usersRes.json();
      const customersData = await customersRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || "Failed to fetch users");
      if (!customersRes.ok) throw new Error(customersData.error || "Failed to fetch customers");
      setUsers(usersData.users || []);
      setCustomers(customersData.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  const refreshUsers = useCallback(async () => {
    if (role !== "Admin" || !user) return;
    setLoading(true);
    setError(null);
    try {
      const usersRes = await fetch(`${SERVER_URL}/get_users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user }),
      });
      const usersData = await usersRes.json();
      if (!usersRes.ok) throw new Error(usersData.error || "Failed to fetch users");
      setUsers(usersData.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (role === "Admin") {
      refresh();
    }
  }, [refresh, role]);

  return { users, setUsers, customers, loading, error, refresh, refreshCustomers, refreshUsers };
};

export default useAdmin;
