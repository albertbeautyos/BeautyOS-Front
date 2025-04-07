import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/auth';
import { setToken } from '../../services/auth';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: authService.LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // Store the token in localStorage
      setToken(response.token);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Login failed');
    }
  }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: authService.RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      // Store the token in localStorage
      setToken(response.token);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Registration failed');
    }
  }
);

// Async thunk for logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Logout failed');
    }
  }
);

// Async thunk to get current user
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getCurrentUser();
      return user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue('Failed to fetch user');
    }
  }
);