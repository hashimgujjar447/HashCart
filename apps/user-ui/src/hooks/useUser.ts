import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';

const fetchUser = async () => {
  const response = await axiosInstance.get('/auth/logged-in-user');
  return response.data.user;
};

export const useUser = () => {
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

  return { user, isLoading, isError, refetch };
};
