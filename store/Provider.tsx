'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { ReactNode } from 'react';

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Redux Provider component for Next.js applications
 * Must be used as a Client Component
 */
export function ReduxProvider({ children }: ReduxProviderProps) {
  return <Provider store={store}>{children}</Provider>;
}