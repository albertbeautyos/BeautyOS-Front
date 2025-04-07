'use client';

/**
 * Check if the user is authenticated
 * This is a simple client-side check using sessionStorage
 * In a real application, you would check with your backend or validate a JWT token
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem('isAuthenticated') === 'true';
};

/**
 * Log out the user by clearing session data
 */
export const logout = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('userEmail');
  sessionStorage.removeItem('verificationCode');

  // Clear auth cookie
  document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

  // Redirect to login page
  window.location.href = '/login';
};

/**
 * Get the user's email or other identification
 * In a real application, this would come from the session or decoded JWT
 */
export const getUserInfo = (): { email: string | null } => {
  if (typeof window === 'undefined') {
    return { email: null };
  }

  // Get the email from sessionStorage - in a real app, this would come from your JWT or session
  const email = sessionStorage.getItem('userEmail');
  return { email };
};