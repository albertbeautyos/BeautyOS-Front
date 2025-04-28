import { AxiosError } from 'axios'; // Import AxiosError for better type checking
import axiosInstance from '@/api/axiosInstance'; // Import the configured instance
import { LocalStorageManager } from '@/helpers/localStorageManager'; // Import static class
import { SessionStorageManager } from '@/helpers/sessionStorageManager'; // Import static class

// Define the expected user data structure based on the provided response
interface Location {
    coordinates: number[];
    type: string;
}

interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    location: Location;
}

export interface UserData {
    status: string; // e.g., "CREATED"
    role: string[]; // Array of roles, e.g., ["PROFESSIONAL"]
    address: Address;
    birthday: string; // ISO 8601 date string
    rating: number;
    services: number;
    level: number;
    pronouns: string;
    gender: string; // e.g., "Male"
    phone: string;
    email: string;
    profileImage: string;
    username: string;
    lastName: string;
    firstName: string;
    id: string;
    salons:{id:string,isSingle:boolean}[]
}

// Constants for token keys (matching axiosInstance.ts)
const ACCESS_TOKEN_KEY = 'accessToken';

export const getCurrentUser = async (): Promise<UserData> => {
    // Ensure this code runs only on the client-side
    if (typeof window === 'undefined') {
        throw new Error("Cannot fetch user data: Not running in a browser environment.");
    }

    // Attempt to get the token from local storage first, then session storage
    let token = LocalStorageManager.get(ACCESS_TOKEN_KEY);
    if (!token) {
        token = SessionStorageManager.get(ACCESS_TOKEN_KEY);
    }

    if (!token) {
        console.error("Authentication token not found in local or session storage.");
        throw new Error("Authentication token not found.");
    }

    try {
        // No need to manually set Authorization header, the interceptor does it
        const response = await axiosInstance.get<UserData>('/users/me');
        const selectedSalonId =LocalStorageManager.get('SELECTED_SALON_ID');

        if(!selectedSalonId){
            LocalStorageManager.set('selectedSalonId',response.data.salons[0].id);

        }

        return response.data;
    } catch (error: unknown) {
        console.error("Failed to fetch current user:", error);

        if (error instanceof AxiosError) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.message || 'Unknown API error';
                if (status === 401) {
                    // Interceptor handles token refresh attempts and clearing.
                    // We just report the final error after interceptor fails.
                    console.error("Unauthorized: Token might be invalid, expired, or refresh failed.");
                    throw new Error(`Unauthorized (401): ${message}. Please login again.`);
                } else {
                    throw new Error(`API Error (${status}): ${message}`);
                }
            } else if (error.request) {
                console.error("Network error: No response received from API.");
                throw new Error("Network error: Could not connect to the API.");
            } else {
                console.error("Error setting up request:", error.message);
                throw new Error(`Error fetching user data: ${error.message}`);
            }
        } else if (error instanceof Error) {
            console.error("Generic error:", error.message);
            throw new Error(`Error fetching user data: ${error.message}`);
        } else {
            console.error("An unexpected error occurred:", error);
            throw new Error("An unexpected error occurred while fetching user data.");
        }
    }
};
