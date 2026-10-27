import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';

interface PostLoginCheckResult {
  needsAddress: boolean;
  redirectUrl: string | null;
  isChecking: boolean;
}

/**
 * Hook for the login page to use after a successful login.
 * Checks if the logged-in user has shipping addresses.
 * Returns whether an address is needed and the redirect URL (if any).
 *
 * SSR-safe: relies on useSearchParams (client-side only).
 */
export const usePostLoginCheck = (
  user: any | null | undefined,
): PostLoginCheckResult => {
  const searchParams = useSearchParams();
  const redirectParam = searchParams ? searchParams.get('redirect') : null;

  const [needsAddress, setNeedsAddress] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const checkAddresses = async () => {
      setIsChecking(true);
      try {
        const response = await axiosInstance.get('/auth/get-addresses', {
          withCredentials: true,
        });
        const addresses: any[] = response.data?.addresses ?? [];
        if (!cancelled) {
          setNeedsAddress(addresses.length === 0);
        }
      } catch {
        // If the request fails, we don't force address entry
        if (!cancelled) {
          setNeedsAddress(false);
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    };

    checkAddresses();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    needsAddress,
    redirectUrl: redirectParam,
    isChecking,
  };
};

export default usePostLoginCheck;
