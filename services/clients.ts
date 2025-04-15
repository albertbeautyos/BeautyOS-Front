// Define the structure for a Client (matching the API response/request)

import axiosInstance from "@/api/axiosInstance";

// Updated Client interface to match the detailed structure from POST response
// Note: This might differ from the structure returned by GET /clients
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  username?: string; // Added field
  profileImage?: string; // Added field
  email: string;
  phone: string;
  gender?: string; // Now part of the main Client type
  pronouns?: string; // Now part of the main Client type
  referredBy?: string; // Now part of the main Client type
  clientType?: string; // Now part of the main Client type
  birthday?: string | Date; // Keep Date for potential use, but API likely uses string
  address?: AddressData; // Added AddressData back
  status?: string; // Added field
  showRate?: number;
  avgVisit?: number;
  avgVisitValue?: number;
  createdAt?: string | Date; // Added field
  updatedAt?: string | Date; // Added field
  otp?: string; // Added field - Consider security implications
}

// Interface for the overall API response structure for GET /clients (as defined previously)
interface GetClientsResponse {
    metadata: {
        totalRecords: number;
        pageSize: number;
        page: number;
    };
    records: Client[];
    type: string;
}

// Define the structure for data needed to create a new client (omit server-generated fields like id, last_visit)
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

// Updated NewClientData interface to match the client creation request structure
export interface NewClientData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  gender?: string; // Optional fields
  pronouns?: string;
  referredBy?: string;
  clientType?: string; // Made required as per user request
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
    const response = await axiosInstance.get<GetClientsResponse>('clients?top=1000000 ');
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
        // Ensure data matches the exact request structure
        // Remove any fields from clientData that are not in NewClientData definition if necessary
        const dataToSend: NewClientData = {
            ...clientData,
            // Ensure birthday is ISO string if it's a Date object
            birthday: clientData.birthday instanceof Date ? clientData.birthday.toISOString() : clientData.birthday,
            clientType: clientData.clientType || "REGULAR",
           address:{ ...clientData.address, location: {
            coordinates: [0, 0],
            type: "Point"
           }  }
        };
        // Expect the detailed Client structure in the response
        const response = await axiosInstance.post<Client>('/clients', dataToSend);
        return response.data;
    } catch (error) {
        console.error("API Error adding client:", error);
        // More specific error handling could be added here based on response
        throw new Error('Failed to add client. Please check the details and try again.');
    }
};

/**
 * Fetches a single client by ID from the API.
 * @param id - The ID of the client to fetch (required path parameter).
 * @returns A promise that resolves to a Client object.
 * @throws Throws an error if the API call fails.
 */
export const getClientById = async (id: string): Promise<Client> => {
  try {
    console.log(`Fetching client with ID: ${id}`);

    // Pass client-id as a query parameter since the API requires it
    const response = await axiosInstance.get<Client>(`/clients/${id}`);

    return response.data;
  } catch (error) {
    console.error(`API Error fetching client with ID ${id}:`, error);
    throw new Error(`Failed to fetch client with ID ${id}. Please try again.`);
  }
};

/**
 * Updates an existing client via the API.
 * @param id - The ID of the client to update.
 * @param clientData - The updated data for the client (partial data is acceptable).
 * @returns A promise that resolves to the updated Client object.
 * @throws Throws an error if the API call fails.
 */
export const updateClient = async (id: string, clientData: Partial<NewClientData>): Promise<Client> => {
  try {
    // Ensure any Date objects are converted to ISO strings
    const dataToSend = {
      ...clientData,
      birthday: clientData.birthday instanceof Date ? clientData.birthday.toISOString() : clientData.birthday
    };

    const response = await axiosInstance.put<Client>(`/clients/${id}`, dataToSend);
    return response.data;
  } catch (error) {
    console.error("API Error updating client:", error);
    throw new Error('Failed to update client. Please check the details and try again.');
  }
};

// TODO: Add function for deleting (DELETE /clients/:id) clients as needed.


