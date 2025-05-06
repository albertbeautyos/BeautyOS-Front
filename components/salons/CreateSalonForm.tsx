import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { Loader2, PlusCircle, XCircle } from 'lucide-react';
import { updateSalons ,updateSelectedSalonId} from "@/store/slices/authSlice";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createSalon, updateSalon, SalonResponse, Address, UpdateSalonRequest, CreateSalonRequest } from '@/services/salons';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { SELECTED_SALON_ID } from '@/constants';
import { LocalStorageManager } from '@/helpers/localStorageManager';

interface CreateSalonFormProps {
  onSuccess: (response: unknown) => void;
  initialData?: SalonResponse | null;
  isEditing?: boolean;
}

// Location schema for both addresses
const locationSchema = z.object({
  type: z.string(),
  coordinates: z.array(z.number())
});

// Address schema for both primary and secondary addresses
const addressSchema: z.ZodType<Address> = z.object({
  street: z.string().min(1, { message: "Street is required" }),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  postalCode: z.string().min(1, { message: "Postal code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  location: locationSchema
});

// Main form schema
const formSchema = z.object({
  name: z.string().min(1, { message: "Salon name is required." }),
  image: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([
      z.string().email({ message: "Invalid email address." }),
      z.literal("")
    ]).optional(),
  website: z.union([
      z.string().url({ message: "Invalid website URL." }),
      z.literal("")
    ]).optional(),
  beautyosUrl: z.string().optional(),
  serviceLocation: z.string().optional(),
  address: addressSchema,
  address2: addressSchema.optional()
});

type FormValues = z.infer<typeof formSchema>;

// Helper to create default Address
const createDefaultAddress = (): Address => ({
  street: "", city: "", state: "", postalCode: "", country: "",
  location: { type: "Point", coordinates: [0, 0] }
});

// Initial default values for the form
const initialFormValues: FormValues = {
  name: "",
  image: "",
  description: "",
  phone: "",
  email: "",
  website: "",
  beautyosUrl: "",
  serviceLocation: "AT_MY_SALON", // Use empty string as default
  address: createDefaultAddress(),
  address2: undefined, // Optional object default
};

export const CreateSalonForm = ({ onSuccess, initialData, isEditing }: CreateSalonFormProps) => {

  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddress2, setShowAddress2] = useState(!!initialData?.address2);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues, // Provide initial defaults here
  });

  // Effect to reset form ONLY when initialData changes for editing
  useEffect(() => {
    if (isEditing && initialData) {
      // Map SalonResponse to FormValues
      const editValues: Partial<FormValues> = {
        name: initialData.name || "",
        image: initialData.image || "",
        description: initialData.description || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
        beautyosUrl: initialData.beautyosUrl || "",
        serviceLocation: initialData.serviceLocation || "", // Use empty string
        address: initialData.address || createDefaultAddress(),
        address2: initialData.address2 || undefined,
      };
      form.reset(editValues as FormValues);
      setShowAddress2(!!initialData.address2);
    }
    // No need for an else block to reset for create mode,
    // as defaultValues in useForm handles that now.
  }, [isEditing, initialData, form.reset]); // Keep form.reset in dependency array

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    // Prepare payload matching CreateSalonRequest or UpdateSalonRequest structure
    // Note: The final type assertion depends on which API is called
    const payload: Partial<CreateSalonRequest & UpdateSalonRequest> = { ...values };

    if (!showAddress2) {
      delete payload.address2;
    }

    // Handle empty strings for optional fields if API expects null/undefined
    if (payload.email === "") payload.email = undefined;
    if (payload.website === "") payload.website = undefined;
    // Add more similar cleanups if needed...

    try {
      let response;
      if (isEditing && initialData?.id) {
        // Payload for updateSalon (UpdateSalonRequest)
        response = await updateSalon(initialData.id, payload as UpdateSalonRequest);
        toast.success("Salon updated successfully");
      } else {
        // Payload for createSalon (CreateSalonRequest)
        response = await createSalon(payload as CreateSalonRequest);
        // Dispatch create actions for Redux store
        dispatch(updateSalons({
          // Construct UserSalon from SalonResponse
          id: response.id,
          name: response.name,
          isSingle: response.isSingle,
          status: response.status,
          roles: ["PROFFESIONAL"] // Assuming default role
        }));
        LocalStorageManager.set(SELECTED_SALON_ID, response.id);
        dispatch(updateSelectedSalonId(response.id));
        toast.success("Salon created successfully");
      }
      onSuccess(response);
    } catch (error) {
      toast.error(isEditing ? "Failed to update salon" : "Failed to create salon");
      console.error("Salon form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAddress2 = (show: boolean) => {
    setShowAddress2(show);
    if (!show) {
      form.setValue('address2', undefined);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 mb-4 max-h-[calc(100vh-200px)]">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salon Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter salon name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter image URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter salon description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter phone number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="Enter email address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter website URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="beautyosUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>BeautyOS URL</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter BeautyOS URL" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-medium">Primary Address</h3>
            <p className="text-sm text-muted-foreground mb-4">All primary address fields are required.</p>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street <span className="text-amber-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter street address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City <span className="text-amber-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State <span className="text-amber-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter state" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code <span className="text-amber-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter postal code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country <span className="text-amber-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {showAddress2 ? (
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Secondary Address</h3>
                <Button variant="ghost" size="sm" onClick={() => toggleAddress2(false)}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">If any secondary address field is filled, all become required.</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address2.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Street <span className="text-amber-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter street address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City <span className="text-amber-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State <span className="text-amber-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code <span className="text-amber-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter postal code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address2.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country <span className="text-amber-500">*</span></FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter country" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ) : (
            <Button variant="outline" type="button" onClick={() => toggleAddress2(true)} className="w-full">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Secondary Address
            </Button>
          )}
        </div>

        <div className="mt-auto pt-4 border-t">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Salon" : "Create Salon"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};