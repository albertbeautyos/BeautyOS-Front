import { store } from '@/store/store';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser
} from '@/store/slices';
import { LoginCredentials, RegisterCredentials } from '@/services/auth';

/**
 * Utility class for auth-related operations
 * Provides a simple interface to Redux auth actions
 */
export const Auth = {
  /**
   * Login with email and password
   * @param credentials User login credentials
   * @returns Promise resolving to login result
   */
  login: (credentials: LoginCredentials) => {
    return store.dispatch(loginUser(credentials)).unwrap();
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise resolving to registration result
   */
  register: (userData: RegisterCredentials) => {
    return store.dispatch(registerUser(userData)).unwrap();
  },

  /**
   * Logout the current user
   * @returns Promise resolving when logout is complete
   */
  logout: () => {
    return store.dispatch(logoutUser()).unwrap();
  },

  /**
   * Get the current user profile
   * @returns Promise resolving to current user data
   */
  getCurrentUser: () => {
    return store.dispatch(fetchCurrentUser()).unwrap();
  },

  /**
   * Check if the user is authenticated
   * @returns Boolean indicating if user is authenticated
   */
  isAuthenticated: () => {
    return store.getState().auth.isAuthenticated;
  },

  /**
   * Get the current user from the Redux store
   * @returns Current user object or null
   */
  getUser: () => {
    return store.getState().auth.user;
  },
};