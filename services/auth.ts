import axiosInstance from '@/api/axiosInstance';
// Import storage managers
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { SessionStorageManager } from "@/helpers/sessionStorageManager"; // Assuming this exists


interface LoginResponse {
  id: string;
  phone: string,
  email: string,
  role: string[]
  status: string,
  accessToken: string
}


export const sendLoginCode = async (username: string): Promise<string> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/login', { username });

  if (!response.data || typeof response.data.id !== 'string') {
    throw new Error("Initial login call successful, but received invalid ID.");
  }
  return response.data.id; // Return only the ID needed for the next step
};


export const verifyOtpAndLogin = async (id: string, otp: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>('/auth/verify-login-otp', {
    id,
    otp
  });

  if (!response.data || typeof response.data.id !== 'string' || typeof response.data.accessToken !== 'string') {
    throw new Error("Login verification successful, but received invalid user data or token.");
  }
  return response.data; // Return the full response including accessToken
};


export const logout = (): void => {
  try {
    // Remove token from localStorage
    LocalStorageManager.remove('accessToken');

    // Remove token (or other relevant session data) from sessionStorage
    SessionStorageManager.remove('accessToken');

    // Redirect the user to the login page
    window.location.href = '/';
  } catch (error) {
    // Handle potential errors during storage removal
    console.error("Error during logout storage cleanup:", error);
    // Still attempt to redirect even if storage cleanup failed
    window.location.href = '/login';
  }
};