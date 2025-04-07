'use client';

import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser
} from '@/store/slices';
import {
  selectUser,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError
} from '@/store/slices/authSlice';
import { LoginCredentials, RegisterCredentials } from '@/services/auth';

/**
 * Custom hook for authentication
 * Provides authentication state and methods for components
 */
export function useAuth() {
  const dispatch = useAppDispatch();

  // Select auth state from Redux
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  // Login method
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        await dispatch(loginUser(credentials)).unwrap();
        return true;
      } catch (err) {
        console.error('Login error:', err);
        return false;
      }
    },
    [dispatch]
  );

  // Register method
  const register = useCallback(
    async (userData: RegisterCredentials) => {
      try {
        await dispatch(registerUser(userData)).unwrap();
        return true;
      } catch (err) {
        console.error('Registration error:', err);
        return false;
      }
    },
    [dispatch]
  );

  // Logout method
  const logout = useCallback(
    async () => {
      try {
        await dispatch(logoutUser()).unwrap();
        return true;
      } catch (err) {
        console.error('Logout error:', err);
        return false;
      }
    },
    [dispatch]
  );

  // Get current user method
  const getCurrentUser = useCallback(
    async () => {
      try {
        if (isAuthenticated) {
          return user;
        }
        const userData = await dispatch(fetchCurrentUser()).unwrap();
        return userData;
      } catch (err) {
        console.error('Fetch user error:', err);
        return null;
      }
    },
    [dispatch, isAuthenticated, user]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
  };
}