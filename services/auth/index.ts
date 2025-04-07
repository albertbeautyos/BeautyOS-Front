// Auth service for handling authentication operations

// Types for auth service
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
}

// Example API URL - replace with your actual API URL
// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';

/**
 * Login with email and password
 * @param credentials User credentials
 * @returns Promise with user data and token
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    // In a real app, this would be an actual API call
    // const response = await fetch(`${API_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(credentials),
    // });
    //
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.message || 'Login failed');
    // }
    //
    // return await response.json();

    // Mock implementation for demo purposes
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Simple validation
        if (credentials.email && credentials.password) {
          resolve({
            user: {
              id: '1',
              name: 'Demo User',
              email: credentials.email,
            },
            token: 'mock-jwt-token',
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800);
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during login');
  }
};

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with user data and token
 */
export const register = async (userData: RegisterCredentials): Promise<AuthResponse> => {
  try {
    // In a real app, this would be an actual API call
    // const response = await fetch(`${API_URL}/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(userData),
    // });
    //
    // if (!response.ok) {
    //   const error = await response.json();
    //   throw new Error(error.message || 'Registration failed');
    // }
    //
    // return await response.json();

    // Mock implementation for demo purposes
    return new Promise((resolve, reject) => {
      // Simulate API delay
      setTimeout(() => {
        // Simple validation
        if (userData.name && userData.email && userData.password) {
          resolve({
            user: {
              id: '1',
              name: userData.name,
              email: userData.email,
            },
            token: 'mock-jwt-token',
          });
        } else {
          reject(new Error('Invalid user data'));
        }
      }, 800);
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('An unknown error occurred during registration');
  }
};

/**
 * Logout the current user
 * @returns Promise that resolves when logout is complete
 */
export const logout = async (): Promise<void> => {
  try {
    // In a real app, you might call an API endpoint
    // await fetch(`${API_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${getToken()}`,
    //   },
    // });

    // For the mock version, just clear local storage
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the API call fails, we still want to clear local storage
    localStorage.removeItem('auth_token');
    return Promise.resolve();
  }
};

/**
 * Get current user profile
 * @returns Promise with user data
 */
export const getCurrentUser = async (): Promise<AuthResponse['user']> => {
  try {
    // In a real app, this would fetch the user profile
    // const token = getToken();
    // if (!token) throw new Error('No authentication token found');
    //
    // const response = await fetch(`${API_URL}/auth/me`, {
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    // });
    //
    // if (!response.ok) {
    //   throw new Error('Failed to fetch user profile');
    // }
    //
    // return await response.json();

    // Mock implementation for demo
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        setTimeout(() => {
          resolve({
            id: '1',
            name: 'Demo User',
            email: 'user@example.com',
          });
        }, 500);
      } else {
        reject(new Error('No authentication token found'));
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Get authentication token from storage
 * @returns The stored token or null
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

/**
 * Set authentication token in storage
 * @param token The token to store
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};