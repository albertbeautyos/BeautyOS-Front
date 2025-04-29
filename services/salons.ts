// Define the structure for a Client (matching the API response/request)

import axiosInstance from "@/api/axiosInstance";

// Define interface for invitation payload
interface InviteUserPayload {
  username: string;
  role: string;
}

// Function to invite a user to a salon
export const inviteUser = async (salonId: string, payload: InviteUserPayload): Promise<void> => {
  try {
    const response = await axiosInstance.post(`/salons/${salonId}/invite`, payload);

  } catch (error) {
    console.error('Error inviting user to salon:', error);
    throw error instanceof Error
      ? error
      : new Error('An unexpected error occurred while sending the invitation');
  }
};





