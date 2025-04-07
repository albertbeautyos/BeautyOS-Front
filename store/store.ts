import { configureStore } from '@reduxjs/toolkit';
import { reducers } from './slices';

// Create and configure the store
export const store = configureStore({
  reducer: reducers,
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
export type AppDispatch = typeof store.dispatch;