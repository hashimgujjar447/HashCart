import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';

const fetchSeller = async () => {
  try {
    const response = await axiosInstance.get('/auth/logged-in-seller', {
      withCredentials: true,
    });
    return response.data?.seller ?? response.data?.user ?? null;
  } catch (error: any) {
    if (error?.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['seller'],
    queryFn: fetchSeller,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return { seller, isLoading, isError, refetch };
};
