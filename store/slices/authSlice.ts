import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sendLoginCode, verifyOtpAndLogin, logout as logoutService } from '@/services/auth';
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { SessionStorageManager } from "@/helpers/sessionStorageManager";
import { RootState } from '../store'; // Import RootState type from store

// Define the structure of the user info we expect after login
// Derived from LoginResponse in services/auth.ts, excluding accessToken
interface UserInfo {
  id: string;
  phone: string;
  email: string;
  role: string[];
  status: string;
}

// Define the structure for the verifyOtp thunk argument
interface VerifyOtpPayload {
  loginAttemptId: string;
  otp: string;
  rememberMe: boolean;
}

// Define the shape of the authentication state
interface AuthState {
  loading: 'idle' | 'pending';
  error: string | null;
  userInfo: UserInfo | null;
  loginAttemptId: string | null; // Store the ID between steps
  isAuthenticated: boolean;
}

// Initial state
const initialState: AuthState = {
  loading: 'idle',
  error: null,
  userInfo: null,
  loginAttemptId: null,
  isAuthenticated: false,
};

// Async Thunks
export const sendCodeThunk = createAsyncThunk(
  'auth/sendCode',
  async (emailOrPhone: string, { rejectWithValue }) => {
    try {
      const loginId = await sendLoginCode(emailOrPhone);
      return loginId;
    } catch (error) {
      // Type check the error
      const message = error instanceof Error ? error.message : 'Failed to send code';
      return rejectWithValue(message);
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ loginAttemptId, otp, rememberMe }: VerifyOtpPayload, { rejectWithValue }) => {
    try {
      const response = await verifyOtpAndLogin(loginAttemptId, otp);

      if (rememberMe) {
        LocalStorageManager.set('accessToken', response.accessToken);
      }
      return response;
    } catch (error) {
       // Type check the error
      const message = error instanceof Error ? error.message : 'Failed to verify code';
      return rejectWithValue(message);
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
        logoutService();
    } catch (error) {
        // Type check the error
        const message = error instanceof Error ? error.message : 'Logout cleanup failed';
        console.error("Client-side logout cleanup error:", message, error);
        return rejectWithValue(message + ', but state reset initiated.');
    }
  }
);

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Potential synchronous reducers like clearError, etc.
    clearAuthError(state) {
      state.error = null;
    },
    // Could add a reducer to check initial auth state from storage on app load
    // checkInitialAuthState(state) { ... }
  },
  extraReducers: (builder) => {
    builder
      // Send Code
      .addCase(sendCodeThunk.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.loginAttemptId = null; // Clear previous attempts
      })
      .addCase(sendCodeThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = 'idle';
        state.loginAttemptId = action.payload; // Store the received ID
      })
      .addCase(sendCodeThunk.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload as string || 'Unknown error sending code';
      })
      // Verify OTP
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action: PayloadAction<UserInfo & { accessToken: string }>) => {
        state.loading = 'idle';
        state.isAuthenticated = true;
        state.userInfo = {
             id: action.payload.id,
             phone: action.payload.phone,
             email: action.payload.email,
             role: action.payload.role,
             status: action.payload.status,
        };
        state.loginAttemptId = null; // Clear attempt ID after success
        state.error = null;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = 'idle';
        state.isAuthenticated = false;
        state.userInfo = null;
        state.error = action.payload as string || 'Unknown error verifying code';
      })
      // Logout
       .addCase(logoutThunk.pending, (state) => {
           // Optional: Show loading state during logout? Usually fast enough not to.
           state.loading = 'pending';
       })
      .addCase(logoutThunk.fulfilled, (state) => {
        // Reset entire state to initial on successful logout cleanup
        return initialState;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
         console.warn("Logout rejected action payload:", action.payload)
         // Reset state even if cleanup had minor issues
         return { ...initialState, error: action.payload as string || 'Logout failed' };
      });
  },
});

// Export actions and reducer
export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
/**
 * Selector to get the user information from the auth state.
 * @param state The root state of the Redux store.
 * @returns The user information object or null if not authenticated.
 */
export const selectUserInfo = (state: RootState) => state.auth.userInfo;

/**
 * Selector to get the authentication status.
 * @param state The root state of the Redux store.
 * @returns True if the user is authenticated, false otherwise.
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

/**
 * Selector to get the loading status of the auth slice.
 * @param state The root state of the Redux store.
 * @returns The current loading status ('idle' or 'pending').
 */
export const selectAuthLoading = (state: RootState) => state.auth.loading;

/**
 * Selector to get any authentication error message.
 * @param state The root state of the Redux store.
 * @returns The error message string or null if no error.
 */
export const selectAuthError = (state: RootState) => state.auth.error;