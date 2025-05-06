import axiosInstance from '@/api/axiosInstance';

// Types based on the provided response structure
export interface Backbar {
  colorValue: number;
  bleachValue: number;
  tonerValue: number;
  treatmentValue: number;
}

export interface Duration {
  start: number;
  break: number;
  finish: number;
}

export interface Addon {
  id: string;
  name: string;
  cost: number;
  duration: Duration;
  hasBreak: boolean;
  canBookOnline: boolean;
  doubleBooking: boolean;
  bookScheduleBeforeMinutes: number;
  bookScheduleAfterMinutes: number;
  active: boolean;
  order: number;
  categoryId: string;
  groupId: string;
  type: "ADDON";
  parentServiceId: string;
  backbar?: Backbar;
  salonId: string;
}

export interface Service {
  id: string;
  name: string;
  cost: number;
  duration: Duration;
  hasBreak: boolean;
  canBookOnline: boolean;
  doubleBooking: boolean;
  bookScheduleBeforeMinutes: number;
  bookScheduleAfterMinutes: number;
  active: boolean;
  order: number;
  categoryId: string;
  groupId: string;
  type: "SERVICE";
  parentServiceId: string;
  backbar?: Backbar;
  salonId: string;
  addons: Addon[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
  groupId: string;
  services: Service[];
}

export interface SalonServicesResponse {
  categories: Category[];
}

export interface ReorderItemRequest {
  itemType: 'category' | 'service' | 'addon';
  itemId: string;
  newOrder: number;
}

// Specific data types for each item type
export interface CategoryData {
  id: string;
  name: string;
  order: number;
  active: boolean;
  groupId: string;
}

export interface ServiceData {
  id: string;
  name: string;
  cost: number;
  order: number;
  active: boolean;
  categoryId: string;
}

export interface AddonData {
  id: string;
  name: string;
  cost: number;
  order: number;
  active: boolean;
  serviceId: string;
}

export type ReorderItemData = CategoryData | ServiceData | AddonData;

export interface ReorderItemResponse {
  success: boolean;
  message: string;
  data: ReorderItemData;
}

export interface CategoryOrderResponse {
  success: boolean;
  message: string;
  data: CategoryData;
}

/**
 * Fetches salon services data including categories, services, and add-ons hierarchy
 * @param salonId - The ID of the salon to fetch services for
 * @returns Promise with the salon services data
 */
export const getSalonServices = async (salonId: string): Promise<SalonServicesResponse> => {
  try {
    const response = await axiosInstance.get(`/salon-services`, {
      params: { salonId }
    });

    return response.data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
};

/**
 * Updates the order of a salon category
 * @param salonCategoryId - The ID of the salon category to reorder
 * @param newOrderIndex - The new order index for the category
 * @param salonId - The ID of the salon to use in the user-id header
 * @returns Promise with the response data
 */
export const updateCategoryOrder = async (
  salonCategoryId: string,
  newOrderIndex: number,
  salonId: string
): Promise<CategoryOrderResponse> => {
  try {
    const response = await axiosInstance.patch(
      `/salon-categories/${salonCategoryId}/order`,
      { newOrderIndex },
      {
        headers: {
          'user-id': salonId
        }
      }
    );

    return response.data;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Failed to update category order');
  }
};

