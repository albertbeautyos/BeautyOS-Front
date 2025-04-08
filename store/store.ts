import { configureStore } from '@reduxjs/toolkit';
// Import your slice reducers here
import authReducer from './slices/authSlice'; // Import the auth reducer
// import other reducers...

// Create and configure the store
export const store = configureStore({
  reducer: {
    // Add reducers here
    auth: authReducer, // Add the auth reducer to the store
    // other: otherReducer,
  },
  // Optional: Add middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {auth: AuthState, ...}
export type AppDispatch = typeof store.dispatch;