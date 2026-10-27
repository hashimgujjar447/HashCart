import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import { useStore } from '@/store';

const fetchUser = async () => {
  const response = await axiosInstance.get('/auth/logged-in-user', {
    withCredentials: true,
  });
  return response.data.user;
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
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (isError) {
      clearUser();
    }
  }, [isError, clearUser]);

  return { user, cachedUser, isLoading, isError, refetch };
};

export default useUser;
