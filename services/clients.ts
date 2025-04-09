// Define the structure for a Client (matching the API response/request)

import axiosInstance from "@/api/axiosInstance";

// Should be consistent with the type used in the table columns definition
export interface Client {
  id: string; // Assuming API uses string IDs
  first_name: string;
  last_name: string;
  email: string;
  contact: string;
  last_visit: string | Date; // Assuming API might return string or Date
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
    const response = await axiosInstance.get<Client[]>('clients');
    // Perform any data transformation if needed, e.g., converting date strings
    return response.data;
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


