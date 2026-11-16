'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useStore } from '@/store';

// Routes that require active user session
const PROTECTED_ROUTES = ['/profile', '/checkout'];

export default function AuthInitializer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { user, isLoading, refetch } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        useStore.getState().setUser(user);
      } else {
        useStore.getState().clearUser();
      }
      hasInitialized.current = true;
    }
  }, [user, isLoading]);

  // Route protection for protected user routes
  useEffect(() => {
    if (!isLoading && hasInitialized.current) {
      const isProtected = PROTECTED_ROUTES.some((route) =>
        pathname?.startsWith(route),
      );
      if (isProtected && !user) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    }
  }, [pathname, user, isLoading, router]);

  // Re-verify session on window focus
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetch]);

  return <>{children}</>;
}
