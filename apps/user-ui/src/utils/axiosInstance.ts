import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
  withCredentials: true,
});

let refreshing = false;
let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// Handle adding new access token to the queued requests
const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

// Handling api requests

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
);

// Handle expired token and refresh logic

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    console.log(
      `[Axios Response Interceptor] Error received: status ${status}`,
      error.config?.url,
    );

    if ((status === 401 || status === 500) && !originalRequest._retry) {
      if (refreshing) {
        console.log(
          '[Axios] Refresh already in progress. Queuing request:',
          originalRequest.url,
        );
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => resolve(axiosInstance(originalRequest)));
        });
      }
      originalRequest._retry = true;
      refreshing = true;

      const refreshUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:8080'}/auth/refresh-token-user`;
      console.log('[Axios] Attempting to refresh token at:', refreshUrl);

      try {
        await axios.post(refreshUrl, {}, { withCredentials: true });
        console.log(
          '[Axios] Token refreshed successfully! Retrying original request...',
        );
        refreshing = false;
        onRefreshSuccess();
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        console.error('[Axios] Token refresh failed:', refreshErr);
        refreshing = false;
        refreshSubscribers = [];
        handleLogout();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
