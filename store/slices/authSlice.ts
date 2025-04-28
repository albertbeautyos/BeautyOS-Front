import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sendLoginCode, verifyOtpAndLogin, logout as logoutService, LoginResponse } from '@/services/auth'; // Import LoginResponse type
import { getCurrentUser, UserData as FetchedUserData } from '@/services/getProfile'; // Import user service and type
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { SessionStorageManager } from "@/helpers/sessionStorageManager";
import { RootState } from '../store'; // Import RootState type from store
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants';

// User info type directly uses the one from the service
type UserInfo = FetchedUserData;

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
  userInfo: UserInfo | null; // Use the type alias
  loginAttemptId: string | null; // Store the ID between steps
  isAuthenticated: boolean;
  initialCheckComplete: boolean; // Ensure this is not optional
}

// Initial state
const initialState: AuthState = {
  loading: 'idle',
  error: null,
  userInfo: null,
  loginAttemptId: null,
  isAuthenticated: false,
  initialCheckComplete: false,
};

// --- Async Thunks ---

// Send Login Code Thunk
export const sendCodeThunk = createAsyncThunk(
  'auth/sendCode',
  async (emailOrPhone: string, { rejectWithValue }) => {
    try {
      const loginId = await sendLoginCode(emailOrPhone);
      return loginId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send code';
      return rejectWithValue(message);
    }
  }
);

// Verify OTP Thunk
export const verifyOtpThunk = createAsyncThunk<LoginResponse, VerifyOtpPayload>(
  'auth/verifyOtp',
  async ({ loginAttemptId, otp, rememberMe }, { rejectWithValue }) => {
    try {
      const response = await verifyOtpAndLogin(loginAttemptId, otp);

      // Determine storage based on rememberMe
      const storage = rememberMe ? LocalStorageManager : SessionStorageManager;
      storage.set(ACCESS_TOKEN, response.accessToken);
      // Safely handle refreshToken - check if it exists on the response object
      if (response.refreshToken) {
          storage.set('refreshToken', response.refreshToken);
      }

      // Return the full response, the reducer will extract user info
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify code';
      return rejectWithValue(message);
    }
  }
);

// Fetch Current User Thunk
export const fetchCurrentUserThunk = createAsyncThunk<UserInfo>(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = LocalStorageManager.get(ACCESS_TOKEN) || SessionStorageManager.get(ACCESS_TOKEN);
      if (!token) {
         return rejectWithValue('No token found, cannot fetch user.');
      }
      const userData = await getCurrentUser();
      return userData;
    } catch (error) {
       console.error('fetchCurrentUserThunk: Error fetching user:', error)
      const message = error instanceof Error ? error.message : 'Failed to fetch current user';
      if (message.includes('(401)')) {
          LocalStorageManager.remove(ACCESS_TOKEN);
          LocalStorageManager.remove(REFRESH_TOKEN);
          SessionStorageManager.remove(ACCESS_TOKEN);
          SessionStorageManager.remove(REFRESH_TOKEN);
      }
      return rejectWithValue(message);
    }
  }
);


// Logout Thunk
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
        logoutService(); // This service should handle token removal
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Logout cleanup failed';
        console.error("Client-side logout cleanup error:", message, error);
        return rejectWithValue(message + ', but state reset initiated.');
    }
  }
);

// --- Auth Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setInitialAuthState(state, action: PayloadAction<{ isAuthenticated: boolean; userInfo: UserInfo | null }>) {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.userInfo = action.payload.userInfo;
        state.initialCheckComplete = true;
        state.loading = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Code Cases
      .addCase(sendCodeThunk.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
        state.loginAttemptId = null;
      })
      .addCase(sendCodeThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = 'idle';
        state.loginAttemptId = action.payload;
      })
      .addCase(sendCodeThunk.rejected, (state, action) => {
        state.loading = 'idle';
        state.error = action.payload as string || 'Unknown error sending code';
      })
      // Verify OTP Cases
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = 'pending';
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = 'idle';
        state.isAuthenticated = true;
        // Extract user info from the LoginResponse payload
        state.userInfo = {
            id: action.payload.id,
            firstName: action.payload.firstName,
            lastName: action.payload.lastName,
            username: action.payload.username,
            profileImage: action.payload.profileImage,
            email: action.payload.email,
            phone: action.payload.phone,
            gender: action.payload.gender,
            pronouns: action.payload.pronouns,
            level: action.payload.level,
            services: action.payload.services,
            rating: action.payload.rating,
            birthday: action.payload.birthday,
            address: action.payload.address,
            role: action.payload.role,
            status: action.payload.status,
            salons: action.payload.salons
        };
        state.loginAttemptId = null;
        state.error = null;
        state.initialCheckComplete = true;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = 'idle';
        state.isAuthenticated = false;
        state.userInfo = null;
        state.error = action.payload as string || 'Unknown error verifying code';
        state.initialCheckComplete = true;
      })
       // Fetch Current User Cases
      .addCase(fetchCurrentUserThunk.pending, (state) => {
          state.loading = 'pending';
          state.error = null;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action: PayloadAction<UserInfo>) => {
          state.loading = 'idle';
          state.isAuthenticated = true;
           state.userInfo = {
            id: action.payload.id,
            firstName: action.payload.firstName,
            lastName: action.payload.lastName,
            username: action.payload.username,
            profileImage: action.payload.profileImage,
            email: action.payload.email,
            phone: action.payload.phone,
            gender: action.payload.gender,
            pronouns: action.payload.pronouns,
            level: action.payload.level,
            services: action.payload.services,
            rating: action.payload.rating,
            birthday: action.payload.birthday,
            address: action.payload.address,
            role: action.payload.role,
            status: action.payload.status,
            salons: action.payload.salons
        };// Payload is already UserInfo
          state.error = null;
          state.initialCheckComplete = true;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
          state.loading = 'idle';
          state.isAuthenticated = false;
          state.userInfo = null;
          if (action.payload !== 'No token found, cannot fetch user.') {
              state.error = action.payload as string || 'Failed to fetch user data';
          }
          state.initialCheckComplete = true;
      })
      // Logout Cases
       .addCase(logoutThunk.pending, (state) => {
           state.loading = 'pending';
       })
      .addCase(logoutThunk.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logoutThunk.rejected, (state, action) => {
         console.warn("Logout rejected action payload:", action.payload)
         return { ...initialState, error: action.payload as string || 'Logout failed' };
      });
  },
});

// Export actions and reducer
export const { clearAuthError, setInitialAuthState } = authSlice.actions;
export default authSlice.reducer;

// --- Selectors ---
export const selectUserInfo = (state: RootState) => state.auth.userInfo;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectInitialCheckComplete = (state: RootState) => state.auth.initialCheckComplete;
export const selectSalonId=(state: RootState) => state.auth.userInfo?.salons[0]?.id;