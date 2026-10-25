'use client';

import { useEffect, useState } from 'react';

const LOCATION_STORAGE_KEY = 'user_location';
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
  if (typeof window === 'undefined') return null;
  const storedData = localStorage.getItem(LOCATION_STORAGE_KEY);

  if (!storedData) return null;

  try {
    const parsedData = JSON.parse(storedData);
    const expiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - parsedData.timestamp > expiryTime;

    return isExpired ? null : parsedData;
  } catch {
    return null;
  }
};

export const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    country: string;
    city: string;
  } | null>(null);

  useEffect(() => {
    if (location) return;

    const cached = getStoredLocation();
    if (cached) {
      setLocation(cached);
      return;
    }

    fetch('http://ip-api.com/json/')
      .then((res) => res.json())
      .then((data) => {
        const newLocation = {
          country: data?.country || '',
          city: data?.city || '',
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            LOCATION_STORAGE_KEY,
            JSON.stringify({
              ...newLocation,
              timestamp: Date.now(),
            }),
          );
        }
        setLocation(newLocation);
      })
      .catch(() => {});
  }, [location]);

  return location;
};

export const useLocation = useLocationTracking;
export default useLocationTracking;