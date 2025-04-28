import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LocalStorageManager } from '@/helpers/localStorageManager'; // Import the specific class
import { SessionStorageManager } from '@/helpers/sessionStorageManager';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants';

// Define interfaces for token structure and refresh response
interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// Placeholder for your API base URL - replace with environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Replace with your actual API URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// --- Token Management --- Using LocalStorageManager class


const getAccessToken = (): string | null => {
  return LocalStorageManager.get(ACCESS_TOKEN) || SessionStorageManager.get(ACCESS_TOKEN);
};

const getRefreshToken = (): string | null => {
  return LocalStorageManager.get(REFRESH_TOKEN) || SessionStorageManager.get(REFRESH_TOKEN);
};

const setTokens = (tokens: Tokens): void => {
  LocalStorageManager.set(ACCESS_TOKEN, tokens.accessToken);
  LocalStorageManager.set(REFRESH_TOKEN, tokens.refreshToken);
};

const clearTokens = (): void => {
  LocalStorageManager.remove(ACCESS_TOKEN);
  LocalStorageManager.remove(REFRESH_TOKEN);
  // Potentially trigger logout state update here
  // if (typeof window !== 'undefined') window.location.href = '/login';
};

// --- Request Interceptor --- Add Access Token to Headers

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// --- Response Interceptor --- Handle Token Refresh on 401

let isRefreshing = false;
// Queue for requests waiting for token refresh
let failedQueue: {
    resolve: (token: string | null | undefined) => void;
    reject: (error: Error | AxiosError) => void;
}[] = [];

// Processes the queue of failed requests
const processQueue = (error: AxiosError | Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if the error is 401, not a retry, and config exists
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the original request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: resolve as (token: string | null | undefined) => void, reject });
        })
          .then(token => {
            // Retry with the new token after refresh is complete
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err); // Propagate the error if refresh failed
          });
      }

      originalRequest._retry = true; // Mark the request as retried
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        console.error('No refresh token available.');
        clearTokens();
        isRefreshing = false;
        processQueue(error); // Reject queued requests as refresh is not possible
        return Promise.reject(error);
      }

      try {
        // Replace '/auth/refresh' with your actual refresh token endpoint
        const refreshResponse = await axios.post<RefreshResponse>(
          `${API_BASE_URL}/auth/refresh`, // Use the base URL + refresh endpoint
          { refreshToken }, // Send refresh token in the body
          { headers: { 'Content-Type': 'application/json' } } // Ensure correct headers
        );

        const newTokens = refreshResponse.data;
        setTokens(newTokens);

        // Update the Authorization header for the original request
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
        }

        // Process the queue with the new token
        processQueue(null, newTokens.accessToken);

        // Retry the original request with the new token
        return axiosInstance(originalRequest);
      } catch (refreshError: unknown) {
          let errorToReject: Error | AxiosError;
          if (axios.isAxiosError(refreshError)) {
              console.error('Failed to refresh token (Axios Error):', refreshError.response?.data || refreshError.message);
              errorToReject = refreshError;
          } else if (refreshError instanceof Error) {
              console.error('Failed to refresh token (Error):', refreshError.message);
              errorToReject = refreshError;
          } else {
              console.error('Failed to refresh token (Unknown error):', refreshError);
              errorToReject = new Error('An unknown error occurred during token refresh.');
          }

        clearTokens(); // Clear tokens on refresh failure
        processQueue(errorToReject); // Reject queued requests
        return Promise.reject(errorToReject);
      } finally {
        isRefreshing = false;
      }
    }

    // For errors other than 401 or if it's already a retry attempt
    return Promise.reject(error);
  }
);

export default axiosInstance;