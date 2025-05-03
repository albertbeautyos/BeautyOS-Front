import axiosInstance from '@/api/axiosInstance';
import {
  SalonServicesResponse,
  Category,
  Service,
  Addon,
  Duration,
  Backbar
} from './services';

/**
 * Fetches template services data including categories, services, and add-ons hierarchy
 * @param params - Optional parameters for filtering templates
 * @returns Promise with the template services data
 */
export const getTemplateServices = async (
  params?: { groupId?: string; categoryId?: string }
): Promise<SalonServicesResponse> => {
  try {
    const response = await axiosInstance.get('/template-services', { params });

    return response.data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

/**
 * Fetches a specific template service by ID
 * @param templateId - The ID of the template to fetch
 * @returns Promise with the template service data
 */
export const getTemplateServiceById = async (templateId: string): Promise<Service> => {
  try {
    const response = await axiosInstance.get(`/template-services/${templateId}`);

    return response.data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

/**
 * Response interface for the template attachment API
 */
export interface AttachTemplateResponse {
  success: boolean;
  message: string;
  data?: {
    attachedServices: string[];
  };
}

/**
 * Attaches template services to a salon
 * @param userId - The ID of the user making the request
 * @param salonId - The ID of the salon to attach templates to
 * @param templateServiceIds - Array of template service IDs to attach
 * @returns Promise with the response data
 */
export const attachTemplateServices = async (
  userId: string,
  salonId: string,
  templateServiceIds: string[]
): Promise<AttachTemplateResponse> => {
  try {
    const response = await axiosInstance.post(
      '/salon-services/attach',
      { salonId, templateServiceIds },
      {
        headers: {
          'user-id': userId
        }
      }
    );

    return response.data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};
