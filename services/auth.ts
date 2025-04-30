import axiosInstance from '@/api/axiosInstance';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/constants';
// Import storage managers
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { SessionStorageManager } from "@/helpers/sessionStorageManager"; // Assuming this exists
import { UserSalon } from './getProfile';

// Define expected response structure for login/verify
// Export this interface!
export interface LoginResponse {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    profileImage: string;
    email: string;
    phone: string;
    gender: string;
    pronouns: string;
    level: number;
    services: number;
    rating: number;
    birthday: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        location: {
            coordinates: number[];
            type: string;
        };
    };
    role: string[];
    status: string;
    accessToken: string;
    refreshToken?: string;
    salons:UserSalon[]
    // Make refreshToken optional if not always returned
}

// Define expected response structure for sending the code
interface SendCodeResponse {
    id: string;
}

/**
 * Sends a login code request to the backend.
 * @param emailOrPhone The user's email or phone number.
 * @returns A promise that resolves with the loginAttemptId.
 */
export const sendLoginCode = async (emailOrPhone: string): Promise<string> => {
    try {
        const response = await axiosInstance.post<SendCodeResponse>('/auth/login', {
           username: emailOrPhone,
        });
        if (!response.data.id) {
            throw new Error('loginAttemptId not found in response');
        }
        return response.data.id;
    } catch (error) {
        console.error("Error sending login code:", error);
        // Re-throw the error to be handled by the caller (e.g., Redux thunk)
        throw error;
    }
};

/**
 * Verifies the OTP code and completes the login.
 * @param loginAttemptId The ID received from sendLoginCode.
 * @param otp The One-Time Password entered by the user.
 * @returns A promise that resolves with the login response data (including tokens and user info).
 */
export const verifyOtpAndLogin = async (loginAttemptId: string, otp: string): Promise<LoginResponse> => {
    try {
        const response = await axiosInstance.post<LoginResponse>('/auth/verify-login-otp', {
            id:loginAttemptId,
            otp,
        });
        return response.data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        // Re-throw the error
        throw error;
    }
};

/**
 * Clears authentication tokens from both local and session storage.
 */
export const logout = (): void => {
    LocalStorageManager.remove(ACCESS_TOKEN);
    LocalStorageManager.remove(REFRESH_TOKEN);
    SessionStorageManager.remove(ACCESS_TOKEN);
    SessionStorageManager.remove(REFRESH_TOKEN);
    // Note: The axios interceptor also calls clearTokens on refresh failure,
    // so this provides explicit logout cleanup.
};