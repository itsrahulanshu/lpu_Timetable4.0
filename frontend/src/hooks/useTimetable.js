/**
 * useTimetable Hook
 * Custom hook for managing timetable data with smart fetching
 */

import { useState, useEffect } from 'react';
import { getTimetable, refreshTimetable, getTimetableStatus } from '../services/api';

// LocalStorage keys
const STORAGE_KEYS = {
  TIMETABLE_DATA: 'timetable_data',
  LAST_FETCH_DATE: 'last_fetch_date',
  LAST_REFRESH_TIME: 'last_refresh_time',
  CACHE_TIMESTAMP: 'cache_timestamp'
};

const REFRESH_COOLDOWN = 300000; // 5 minutes in milliseconds

export const useTimetable = () => {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [cached, setCached] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastFetchInfo, setLastFetchInfo] = useState('');
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval;
    
    const updateCooldown = () => {
      const lastRefreshTime = localStorage.getItem(STORAGE_KEYS.LAST_REFRESH_TIME);
      if (!lastRefreshTime) {
        setCooldownRemaining(0);
        return;
      }
      
      const timeSinceLastRefresh = Date.now() - parseInt(lastRefreshTime);
      const remaining = Math.max(0, REFRESH_COOLDOWN - timeSinceLastRefresh);
      
      setCooldownRemaining(remaining);
      
      if (remaining === 0 && interval) {
        clearInterval(interval);
      }
    };
    
    // Update immediately
    updateCooldown();
    
    // Then update every second
    interval = setInterval(updateCooldown, 1000);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshing]); // Re-run when refreshing changes

  /**
   * Check if we need to fetch data today
   */
  const shouldFetchToday = () => {
    const lastFetchDate = localStorage.getItem(STORAGE_KEYS.LAST_FETCH_DATE);
    const today = new Date().toDateString();
    
    return lastFetchDate !== today;
  };

  /**
   * Check if refresh cooldown has passed
   */
  const canRefresh = () => {
    const lastRefreshTime = localStorage.getItem(STORAGE_KEYS.LAST_REFRESH_TIME);
    if (!lastRefreshTime) return true;
    
    const timeSinceLastRefresh = Date.now() - parseInt(lastRefreshTime);
    return timeSinceLastRefresh >= REFRESH_COOLDOWN;
  };

  /**
   * Load cached data from localStorage
   */
  const loadCachedData = () => {
    try {
      const cachedData = localStorage.getItem(STORAGE_KEYS.TIMETABLE_DATA);
      const cacheTimestamp = localStorage.getItem(STORAGE_KEYS.CACHE_TIMESTAMP);
      
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setTimetableData(parsedData);
        setLastUpdated(cacheTimestamp ? new Date(cacheTimestamp).toISOString() : null);
        setCached(true);
        
        // Calculate time since last update
        if (cacheTimestamp) {
          const hoursSince = Math.floor((Date.now() - new Date(cacheTimestamp)) / (1000 * 60 * 60));
          setLastFetchInfo(hoursSince === 0 ? 'Updated less than an hour ago' : `Updated ${hoursSince} hours ago`);
        }
        
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  /**
   * Save data to localStorage
   */
  const saveToCacheAsync = (data, timestamp) => {
    try {
      localStorage.setItem(STORAGE_KEYS.TIMETABLE_DATA, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.CACHE_TIMESTAMP, timestamp);
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH_DATE, new Date().toDateString());
    } catch (err) {
      // Silent fail
    }
  };

  /**
   * Load timetable data with smart fetching
   */
  const loadTimetable = async (force = false) => {
    try {
      setLoading(true);
      setError(null);

      // First, try to load cached data immediately
      const hasCached = loadCachedData();

      // If offline, show cached data only
      if (!isOnline) {
        if (hasCached) {
          setError('You are offline. Showing cached data.');
          setCached(true);
        } else {
          setError('You are offline and no cached data is available.');
        }
        setLoading(false);
        return;
      }

      // Check if we should fetch today
      if (!force && !shouldFetchToday() && hasCached) {
        // Already fetched today, use cache
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const data = await getTimetable();
      
      if (data.success) {
        setTimetableData(data.data);
        setLastUpdated(data.timestamp);
        setCached(data.cached || false);
        
        // Save to localStorage
        saveToCacheAsync(data.data, data.timestamp);
        
        const hoursSince = 0;
        setLastFetchInfo('Just updated');
      } else if (hasCached) {
        // API returned no success but we have cache
        setError('Could not fetch fresh data. Showing cached version.');
        setCached(true);
      }
    } catch (err) {
      // On error, keep showing cached data if available
      const hasCached = loadCachedData();
      
      if (err.response?.status === 404) {
        if (!hasCached) {
          setError('first-time'); // Special flag for onboarding
        }
        setTimetableData([]);
      } else if (hasCached) {
        setError(`Couldn't refresh. ${isOnline ? 'Check your connection.' : 'You are offline.'} Showing cached data.`);
      } else {
        setError(isOnline ? 'Failed to load timetable. Please try again.' : 'You are offline and no cached data is available.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh timetable data with cooldown
   */
  const handleRefresh = async () => {
    // Check cooldown
    if (!canRefresh()) {
      const lastRefreshTime = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_REFRESH_TIME));
      const remainingMs = REFRESH_COOLDOWN - (Date.now() - lastRefreshTime);
      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.floor((remainingMs % 60000) / 1000);
      
      setError(`cooldown:${minutes}:${seconds}`);
      return;
    }

    try {
      setRefreshing(true);
      setError(null);

      if (!isOnline) {
        setError('You are offline. Cannot refresh now.');
        return;
      }

      const data = await refreshTimetable();

      if (data.success) {
        setTimetableData(data.data);
        setLastUpdated(data.timestamp);
        setCached(false);
        
        // Save to localStorage
        saveToCacheAsync(data.data, data.timestamp);
        
        // Update refresh time
        localStorage.setItem(STORAGE_KEYS.LAST_REFRESH_TIME, Date.now().toString());
        localStorage.setItem(STORAGE_KEYS.LAST_FETCH_DATE, new Date().toDateString());
        
        setLastFetchInfo('Just updated');
        setCooldownRemaining(REFRESH_COOLDOWN);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError('Too many requests. Please wait before refreshing again.');
      } else {
        setError('Failed to refresh. Please check your connection and try again.');
      }
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Load on mount
   */
  useEffect(() => {
    loadTimetable();
  }, []);

  return {
    timetableData,
    loading,
    refreshing,
    error,
    lastUpdated,
    cached,
    isOnline,
    lastFetchInfo,
    cooldownRemaining,
    refresh: handleRefresh,
    reload: loadTimetable
  };
};
