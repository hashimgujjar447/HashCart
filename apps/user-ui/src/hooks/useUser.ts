import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import { useStore } from '@/store';

const fetchUser = async () => {
  try {
    const response = await axiosInstance.get('/auth/logged-in-user', {
      withCredentials: true,
    });
    return response.data?.user ?? null;
  } catch (error: any) {
    // Return null on 401/guest so queryFn never returns undefined
    return null;
  }
};

export const useUser = () => {
  const setUser = useStore((state) => state.setUser);
  const clearUser = useStore((state) => state.clearUser);
  // cachedUser gives an immediate value from persisted Zustand state
  // before the async query resolves
  const cachedUser = useStore((state) => state.user);

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        setUser(user);
      } else if (user === null && !cachedUser) {
        clearUser();
      }
    }
  }, [user, isLoading, cachedUser, setUser, clearUser]);

  // Active user: prefer live user if present, fallback to cachedUser while loading
  const activeUser =
    user !== undefined && user !== null
      ? user
      : isLoading
        ? cachedUser
        : user;

  return {
    user: activeUser,
    cachedUser,
    isLoading,
    isError,
    refetch,
  };
};

export default useUser;
