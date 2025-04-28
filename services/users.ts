// Define the structure for a User (matching the API response/request)

import axiosInstance from "@/api/axiosInstance";

// Updated User interface to match the API response structure
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  level?: number;
  services?: number;
  rating?: number;
  // Additional fields from the create user response
  gender?: string;
  pronouns?: string;
  birthday?: string | Date;
  address?: AddressData;
  role?: string[];
  salonId?: string;
  // Keeping some optional fields that might be useful
  username?: string;
  referredBy?: string;
  clientType?: string;
  status?: string;
  showRate?: number;
  avgVisit?: number;
  avgVisitValue?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  otp?: string;
}

// Interface for the overall API response structure for GET /users
interface GetUsersResponse {
    metadata: {
        totalRecords: number;
        pageSize: number;
        page: number;
    };
    records: User[];
}

// Define the structure for data needed to create a new user
interface LocationData {
  coordinates: number[];
  type: string;
}

// Updated AddressData to include location explicitly as per request/response
interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  location?: LocationData;
}

// Updated NewUserData interface to match the user creation request structure
export interface NewUserData {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  profileImage?: string;
  gender?: string;
  pronouns?: string;
  birthday?: Date | string;
  address?: AddressData;
  role?: string[];
  salonId?: string;
  // Keeping some optional fields that might be useful
  referredBy?: string;
  clientType?: string;
  level?: number;
  services?: number;
  rating?: number;
}

/**
 * Fetches a list of users from the API.
 * @param searchQuery - Optional search query to filter users
 * @param skip - Optional number of records to skip (for pagination)
 * @param top - Optional number of records to return (for pagination)
 * @returns A promise that resolves to a paginated response with users array and metadata.
 * @throws Throws an error if the API call fails.
 */
export const getUsers = async (
  searchQuery?: string,
  skip?: number,
  top: number = 10
): Promise<{
  records: User[];
  metadata: {
    totalRecords: number;
    pageSize: number;
    page: number;
  }
}> => {
  try {
    // Construct URL with query parameters
    let url = 'users?';

    // Add pagination parameters
    url += `top=${top}`;

    if (skip !== undefined) {
      url += `&skip=${skip}`;
    }

    // Add search query parameter if provided
    if (searchQuery && searchQuery.trim() !== '') {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }

    // Expect the nested structure based on the provided JSON
    const response = await axiosInstance.get<GetUsersResponse>(url);

    // Return both records and metadata for pagination
    return {
      records: response.data.records,
      metadata: response.data.metadata
    };
  } catch (error) {
    console.error("API Error fetching users:", error);
    // Re-throw the error or handle it as needed for UI feedback
    throw new Error('Failed to fetch users. Please try again.');
  }
};

/**
 * Adds a new user via the API.
 * @param userData - The data for the new user.
 * @returns A promise that resolves to the newly created User object.
 * @throws Throws an error if the API call fails.
 */
export const addUser = async (userData: NewUserData): Promise<User> => {
    try {
        // Ensure data matches the exact request structure
        const dataToSend: NewUserData = {
            ...userData,
            // Ensure birthday is ISO string if it's a Date object
            birthday: userData.birthday instanceof Date ? userData.birthday.toISOString() : userData.birthday,
            // Set default role if not provided
            role: userData.role || ["USER"],
            // Ensure address location has the correct structure

        };

        // Expect the detailed User structure in the response
        const response = await axiosInstance.post<User>('/users', dataToSend);
        return response.data;
    } catch (error) {
        console.error("API Error adding user:", error);
        // More specific error handling could be added here based on response
        throw new Error('Failed to add user. Please check the details and try again.');
    }
};

/**
 * Fetches a single user by ID from the API.
 * @param id - The ID of the user to fetch (required path parameter).
 * @returns A promise that resolves to a User object.
 * @throws Throws an error if the API call fails.
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    // Pass user-id as a query parameter since the API requires it
    const response = await axiosInstance.get<User>(`/users/${id}`);

    return response.data;
  } catch (error) {
    console.error(`API Error fetching user with ID ${id}:`, error);
    throw new Error(`Failed to fetch user with ID ${id}. Please try again.`);
  }
};

/**
 * Updates an existing user via the API.
 * @param id - The ID of the user to update.
 * @param userData - The updated data for the user (partial data is acceptable).
 * @returns A promise that resolves to the updated User object.
 * @throws Throws an error if the API call fails.
 */
export const updateUser = async (id: string, userData: Partial<NewUserData>): Promise<User> => {
  try {
    // Ensure any Date objects are converted to ISO strings
    const dataToSend = {
      ...userData,
      birthday: userData.birthday instanceof Date ? userData.birthday.toISOString() : userData.birthday,

    };

    const response = await axiosInstance.put<User>(`/users/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("API Error updating user:", error);
    throw new Error('Failed to update user. Please check the details and try again.');
  }
};

/**
 * Deletes a user by ID via the API.
 * @param id - The ID of the user to delete.
 * @returns A promise that resolves when the deletion is successful.
 * @throws Throws an error if the API call fails.
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/users/${id}`);
  } catch (error) {
    console.error(`API Error deleting user with ID ${id}:`, error);
    throw new Error('Failed to delete user. Please try again.');
  }
};


