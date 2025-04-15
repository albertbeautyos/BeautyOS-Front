// Define the structure for a Client (matching the API response/request)

import axiosInstance from "@/api/axiosInstance";

// Updated Client interface to match the API response structure
export interface Client {
  id: string;
  firstName: string; // Changed from first_name
  lastName: string;  // Changed from last_name
  email: string;
  phone: string;     // Changed from contact
  showRate?: number; // Added field, assumed optional for safety
  avgVisit?: number; // Added field, assumed optional for safety
  avgVisitValue?: number; // Added field, assumed optional for safety
  // Removed last_visit as it's not in the new structure
}

// Interface for the overall API response structure
interface GetClientsResponse {
    metadata: {
        totalRecords: number;
        pageSize: number;
        page: number;
    };
    records: Client[];
}

// Define the structure for data needed to create a new client (omit server-generated fields like id, last_visit)
interface LocationData {
  coordinates: number[];
  type: string;
}

interface AddressData {
  street?: string;      // Made optional
  city?: string;        // Made optional
  state?: string;       // Made optional
  postalCode?: string;  // Made optional
  country?: string;     // Made optional
  location?: LocationData;
}

export interface NewClientData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender?: string; // Optional fields
  pronouns?: string;
  referredBy?: string;
  clientType: string;
  birthday?: Date | string; // Allow string initially, convert before sending
  address?: AddressData; // Make address optional initially
}

/**
 * Fetches a list of clients from the API.
 * @returns A promise that resolves to an array of Client objects.
 * @throws Throws an error if the API call fails.
 */
export const getClients = async (): Promise<Client[]> => {
  try {
    // Expect the nested structure based on the provided JSON
    const response = await axiosInstance.get<GetClientsResponse>('clients');
    // Return only the records array
    return response.data.records;
  } catch (error) {
    console.error("API Error fetching clients:", error);
    // Re-throw the error or handle it as needed for UI feedback
    throw new Error('Failed to fetch clients. Please try again.');
  }
};

/**
 * Adds a new client via the API.
 * @param clientData - The data for the new client.
 * @returns A promise that resolves to the newly created Client object.
 * @throws Throws an error if the API call fails.
 */
export const addClient = async (clientData: NewClientData): Promise<Client> => {
    try {
        // Potentially transform data before sending, e.g., ensure birthday is ISO string if needed by API
        const dataToSend = {
            ...clientData,
            // Example: convert Date object to ISO string if needed
            birthday: clientData.birthday instanceof Date ? clientData.birthday.toISOString() : clientData.birthday
        };
        const response = await axiosInstance.post<Client>('/clients', dataToSend);
        return response.data;
    } catch (error) {
        console.error("API Error adding client:", error);
        // More specific error handling could be added here based on response
        throw new Error('Failed to add client. Please check the details and try again.');
    }
};

// TODO: Add functions for updating (PUT/PATCH /clients/:id) and deleting (DELETE /clients/:id) clients as needed.


