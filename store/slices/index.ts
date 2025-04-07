import authReducer, { authSlice } from './authSlice';
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from './authActions';

// Export all slice reducers
export {
  authReducer,
  authSlice,
};

// Export auth actions
export {
  loginUser,
  registerUser,
  logoutUser,
  fetchCurrentUser,
};

// Export a map of all reducers for easy import in store configuration
export const reducers = {
  auth: authReducer,
};