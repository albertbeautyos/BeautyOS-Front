// Define the structure for a Client (matching the API response/request)

import axiosInstance from "@/api/axiosInstance";

// Define interface for address
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  location: {
    type: string;
    coordinates: number[];
  };
}

// Define interface for working hours
export interface WorkingHours {
  day: string;
  isWorking: boolean;
  startTime: string;
  endTime: string;
}

// Define interface for salon creation request
export interface CreateSalonRequest {
  name: string;
  image?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  beautyosUrl?: string;
  serviceLocation?: "AT_MY_SALON";
  address: Address;
  address2?: Address;
  workingHours?: WorkingHours[];
  timezone?: string;
}

// Define interface for salon update request
interface UpdateSalonRequest {
  name: string;
  image?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  beautyosUrl?: string;
  serviceLocation?: "AT_MY_SALON";
  address: Address;
  address2?: Address;
  workingHours?: WorkingHours[];
  timezone?: string;
  status?: string;
}

// Define interface for salon response
export interface SalonResponse {
  id: string;
  name: string;
  image?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  beautyosUrl?: string;
  serviceLocation?: "AT_MY_SALON";
  address: Address;
  address2?: Address;
  workingHours?: WorkingHours[];
  timezone?: string;
  status: string;
  isSingle: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define interface for pagination metadata
export interface PaginationMetadata {
  totalRecords: number;
  pageSize: number;
  page: number;
}

// Define interface for paginated salon response
export interface PaginatedSalonResponse {
  metadata: PaginationMetadata;
  records: SalonResponse[]
}

// Define interface for get salons query parameters
export interface GetSalonsQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// Define interface for invitation payload
export interface InviteUserPayload {
  username: string;
  role: string;
}

// Function to get salons with pagination
export const getSalons = async (params?: GetSalonsQueryParams): Promise<PaginatedSalonResponse> => {
  try {
    const response = await axiosInstance.get<PaginatedSalonResponse>('/salons', {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching salons:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while fetching salons');
  }
};

// Function to create a new salon
export const createSalon = async (payload: CreateSalonRequest): Promise<SalonResponse> => {
  try {
    const response = await axiosInstance.post<SalonResponse>('/salons', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating salon:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while creating the salon');
  }
};

// Function to update an existing salon
export const updateSalon = async (salonId: string, payload: UpdateSalonRequest): Promise<SalonResponse> => {
  try {
    const response = await axiosInstance.put<SalonResponse>(`/salons/${salonId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating salon:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while updating the salon');
  }
};

// Function to invite a user to a salon
export const inviteUserToSalon = async (salonId: string, payload: InviteUserPayload): Promise<void> => {
  try {
    const response = await axiosInstance.post(`/salons/${salonId}/invite`, payload);

  } catch (error) {
    console.error('Error inviting user to salon:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while sending the invitation');
  }
};

// Function to get a salon by ID
export const getSalonById = async (salonId: string): Promise<SalonResponse> => {
  try {
    const response = await axiosInstance.get<SalonResponse>(`/salons/${salonId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching salon:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while fetching the salon');
  }
};

// Function to delete a salon by ID
export const deleteSalonById = async (salonId: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/salons/${salonId}`);
  } catch (error) {
    console.error('Error deleting salon:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while deleting the salon');
  }
};





