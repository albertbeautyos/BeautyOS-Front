"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, PencilIcon, XIcon, Trash2, Copy } from 'lucide-react'; // Icons

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription, // Added
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addClient, NewClientData, Client, updateClient } from '@/services/clients';
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // For conditional classnames
import { useAppSelector } from '@/store/hooks';
import { selectSalonId } from '@/store/slices/authSlice';

// --- Updated Zod Schema ---
const locationSchema = z.object({
  type: z.string(), // No default
  coordinates: z.array(z.number()) // No default
});

// Basic address schema with individual error messages
const addressSchema = z.object({
    street: z.string().optional()
      .refine(val => !val || val.trim() !== "", { message: "Street cannot be empty if provided" }),
    city: z.string().optional()
      .refine(val => !val || val.trim() !== "", { message: "City cannot be empty if provided" }),
    state: z.string().optional()
      .refine(val => !val || val.trim() !== "", { message: "State cannot be empty if provided" }),
    postalCode: z.string().optional()
      .refine(val => !val || val.trim() !== "", { message: "Postal code cannot be empty if provided" }),
    country: z.string().optional()
      .refine(val => !val || val.trim() !== "", { message: "Country cannot be empty if provided" }),
    location: locationSchema.optional() // Location is optional
}).optional();

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  email: z.string().email({ message: "Invalid email address." }).min(1, { message: "Email is required." }),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  referredBy: z.string().optional(),
  clientType: z.string().optional(), // Changed from required to optional
  birthday: z.date().optional().nullable(), // Allow null for empty input
  address: addressSchema,
  salonId: z.string().optional() // Add salonId field as optional in the schema
})
// Add refine to handle the address validation
.refine(
  (data) => {
    // If no address data provided, that's valid
    if (!data.address) return true;

    // Check if any address field has a value
    const hasAnyAddressValue =
      !!data.address.street ||
      !!data.address.city ||
      !!data.address.state ||
      !!data.address.postalCode ||
      !!data.address.country;

    // If no fields have values, that's valid
    if (!hasAnyAddressValue) return true;

    // If any field has a value, all required fields must have values
    return (
      !!data.address.street &&
      !!data.address.city &&
      !!data.address.state &&
      !!data.address.postalCode &&
      !!data.address.country
    );
  },
  {
    message: "If any address field is filled, all address fields (street, city, state, postal code, country) are required",
    path: ["address"], // Point to the address field
  }
);
// ---

// Helper function to check if address is empty with proper typing
const isAddressEmpty = (address: z.infer<typeof formSchema>['address']) => {
  if (!address) return true;
  return (
    (!address.street || address.street.trim() === '') &&
    (!address.city || address.city.trim() === '') &&
    (!address.state || address.state.trim() === '') &&
    (!address.postalCode || address.postalCode.trim() === '') &&
    (!address.country || address.country.trim() === '')
  );
};

// Helper function to format Date to YYYY-MM-DD
const formatDateForInput = (date: Date | undefined | null): string => {
  if (!date) return "";
  // Ensure it's a valid date object before formatting
  if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return "";
};

// Helper function to parse YYYY-MM-DD to Date or null
const parseDateFromInput = (value: string): Date | null => {
  if (!value) return null;
  // Attempt to parse, considering potential timezone issues
  // Adding time component avoids potential off-by-one day errors
  const date = new Date(value + 'T00:00:00');
  if (!isNaN(date.getTime())) {
      return date;
  }
  return null; // Return null if parsing fails
};

interface AddClientFormProps {
    initialData?: Partial<NewClientData> & { id?: string; birthday?: string | Date | null; salonId?: string }; // Added salonId
    isInitiallyEditing?: boolean; // Control initial mode - THIS WILL NOW BE THE ONLY SOURCE OF TRUTH FOR EDIT STATE
    onSuccess?: (data: NewClientData | Client) => void; // Updated type
    onCancelEdit?: () => void; // Optional callback for cancelling edit
    onRequestDeleteFromForm?: () => void; // New prop for delete action
    className?: string;
    submitButtonLabel?: string; // Added prop for customizing submit button text
}

export function AddClientForm({
    initialData,
    isInitiallyEditing = !initialData, // Default to edit if no initial data, view otherwise
    onSuccess,
    onCancelEdit,
    onRequestDeleteFromForm, // Destructure new prop
    className,
    submitButtonLabel = initialData ? "Save Changes" : "Add Client" // Default label based on mode
}: AddClientFormProps) {

  const salonId=useAppSelector(selectSalonId) || ""
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Function to safely create a Date from initial data
  const getInitialDate = (birthday: string | Date | undefined | null): Date | undefined => {
    if (!birthday) return undefined;
    const date = new Date(birthday);
    return isNaN(date.getTime()) ? undefined : date;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    defaultValues: initialData ? { // Populate with initialData or defaults
        firstName: initialData.firstName ?? "",
        lastName: initialData.lastName ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        gender: initialData.gender ?? "",
        pronouns: initialData.pronouns ?? "",
        referredBy: initialData.referredBy ?? "",
        clientType: initialData.clientType ?? "",
        birthday: getInitialDate(initialData.birthday), // Use helper
        address: {
            street: initialData.address?.street ?? "",
            city: initialData.address?.city ?? "",
            state: initialData.address?.state ?? "",
            postalCode: initialData.address?.postalCode ?? "",
            country: initialData.address?.country ?? "",
            location: {
              type: initialData.address?.location?.type ?? "Point", // Provide default
              coordinates: initialData.address?.location?.coordinates ?? [0, 0] // Provide default
            }
        },
        salonId: initialData.salonId ?? salonId // Provide default salonId
    } : {
        // Default empty values if no initialData
        firstName: "", lastName: "", phone: "", email: "", gender: "",
        pronouns: "", referredBy: "", clientType: "", birthday: undefined,
        address: {
          street: "", city: "", state: "", postalCode: "", country: "",
          location: { type: "Point", coordinates: [0, 0] }
        },
        salonId: salonId // Provide default salonId
    },
  });

  // Helper function for copy to clipboard
  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    if (!navigator.clipboard) {
      toast.error("Clipboard API not available");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${fieldName} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error(`Failed to copy ${fieldName}`);
    }
  };

  // Reset form if initialData changes
  useEffect(() => {
      if (initialData) {
          form.reset({
            firstName: initialData.firstName ?? "",
            lastName: initialData.lastName ?? "",
            phone: initialData.phone ?? "",
            email: initialData.email ?? "",
            gender: initialData.gender ? initialData.gender:"opt-out",
            pronouns: initialData.pronouns ?? "",
            referredBy: initialData.referredBy ?? "",
            clientType: initialData.clientType ?? "",
            birthday: getInitialDate(initialData.birthday), // Use helper for reset
            address: {
                street: initialData.address?.street ?? "",
                city: initialData.address?.city ?? "",
                state: initialData.address?.state ?? "",
                postalCode: initialData.address?.postalCode ?? "",
                country: initialData.address?.country ?? "",
                location: {
                  type: initialData.address?.location?.type ?? "Point", // Reset with default
                  coordinates: initialData.address?.location?.coordinates ?? [0, 0] // Reset with default
                }
            },
            salonId: initialData.salonId ?initialData.salonId : salonId // Reset salonId
          });
      }
  }, [initialData, form.reset]); // form.reset is stable

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
        // Check if address is empty
        const addressIsEmpty = isAddressEmpty(values.address);

        // Create base payload - remove spread of values to have more control
        const dataPayload: NewClientData = {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone,
            email: values.email,
            // API service functions already handle Date -> ISO string conversion
            birthday: values.birthday ?? undefined, // Send undefined if null
            gender: values.gender ?values.gender: 'opt-out',
            pronouns: values.pronouns,
            referredBy: values.referredBy,
            clientType: values.clientType,
            // Add salonId with a default value
            salonId: values.salonId, // Use form value with fallback
        };

        // Only add address if it's not empty
        if (!addressIsEmpty && values.address) {
          dataPayload.address = {
            ...values.address,
            location: values.address.location
              ? {
                  type: values.address.location.type,
                  coordinates: values.address.location.coordinates
                }
              : { type: "Point", coordinates: [0, 0] }
          };
        }

        // Determine if we're updating an existing client
        const isUpdating = initialData && initialData.id && typeof initialData.id === 'string';

        if (isUpdating && initialData?.id) {
          const {salonId ,...updatePayload}=dataPayload;
            // UPDATE LOGIC


            const updatedClient = await updateClient(initialData.id, updatePayload);
            toast.success("Client Updated", { description: `${updatedClient.firstName} ${updatedClient.lastName} details updated.` });
            onSuccess?.(updatedClient);
        } else {
            // ADD LOGIC
            let finalPayload: NewClientData;
            if ('id' in dataPayload) {
                const { id, ...cleanDataPayload } = dataPayload as NewClientData & { id: string };
                finalPayload = cleanDataPayload;
            } else {
                finalPayload = dataPayload;
            }
            const addedClient = await addClient(finalPayload);
            toast.success("Client Added", { description: `${addedClient.firstName} ${addedClient.lastName} has been successfully added.` });
            form.reset(); // Reset after successful add
            onSuccess?.(addedClient);
        }
    } catch (error) {
      console.error("Failed operation:", error);
      toast.error(initialData?.id ? "Error Updating Client" : "Error Adding Client", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCancelEdit = () => {
    form.reset(); // Reset to initialData values
    onCancelEdit?.(); // Notify parent to handle mode change or close
  }

  // Determine if fields should be disabled (view mode)
  const isDisabled = !isInitiallyEditing && !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* --- Fields --- */}
          {/* Use isDisabled prop on Input/Button/Calendar etc. */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input {...field} disabled={isDisabled} className={cn(isDisabled && "pr-10")} />
                    {isDisabled && field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-7 w-7"
                        onClick={() => handleCopyToClipboard(field.value, 'Phone')}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy Phone</span>
                      </Button>
                    )}
                  </div>
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
                <FormLabel>Email {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <div className="relative flex items-center">
                    <Input type="email" {...field} disabled={isDisabled} className={cn(isDisabled && "pr-10")} />
                    {isDisabled && field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 h-7 w-7"
                        onClick={() => handleCopyToClipboard(field.value, 'Email')}
                      >
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy Email</span>
                      </Button>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="pronouns"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pronouns</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="referredBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referred By</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="clientType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Type</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isDisabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* --- Updated Birthday Field --- */}
          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => {
              // Adapt the field props for <input type="date">
              const { value, onChange, ...rest } = field;
              return (
                <FormItem>
                  <FormLabel>Date of birth</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...rest} // Pass rest props like name, onBlur, ref
                      value={formatDateForInput(value)} // Format Date to YYYY-MM-DD
                      onChange={(e) => {
                        const dateValue = parseDateFromInput(e.target.value); // Parse YYYY-MM-DD to Date or null
                        onChange(dateValue); // Update react-hook-form state
                      }}
                      className="block w-full" // Ensure it fills the grid cell
                      disabled={isDisabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Address Fields - updated with validation error display */}
        <h3 className="text-lg font-medium pt-4 border-t">Address</h3>
        <p className="text-sm text-muted-foreground mb-4">If any address field is filled, all fields become required.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Street <span className="text-amber-500">*</span></FormLabel>
                    <FormControl>
                        <Input
                          {...field}
                          disabled={isDisabled}
                          className={cn(form.formState.errors.address?.street ? "border-red-500" : "")}
                        />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address?.street?.message && (
                        <p className="text-red-500 text-sm">{form.formState.errors.address.street.message}</p>
                      )}
                    </FormMessage>
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
                        <Input
                          {...field}
                          disabled={isDisabled}
                          className={cn(form.formState.errors.address?.city ? "border-red-500" : "")}
                        />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address?.city?.message && (
                        <p className="text-red-500 text-sm">{form.formState.errors.address.city.message}</p>
                      )}
                    </FormMessage>
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
                        <Input
                          {...field}
                          disabled={isDisabled}
                          className={cn(form.formState.errors.address?.state ? "border-red-500" : "")}
                        />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address?.state?.message && (
                        <p className="text-red-500 text-sm">{form.formState.errors.address.state.message}</p>
                      )}
                    </FormMessage>
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
                        <Input
                          {...field}
                          disabled={isDisabled}
                          className={cn(form.formState.errors.address?.postalCode ? "border-red-500" : "")}
                        />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address?.postalCode?.message && (
                        <p className="text-red-500 text-sm">{form.formState.errors.address.postalCode.message}</p>
                      )}
                    </FormMessage>
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
                        <Input
                          {...field}
                          disabled={isDisabled}
                          className={cn(form.formState.errors.address?.country ? "border-red-500" : "")}
                        />
                    </FormControl>
                    <FormMessage>
                      {form.formState.errors.address?.country?.message && (
                        <p className="text-red-500 text-sm">{form.formState.errors.address.country.message}</p>
                      )}
                    </FormMessage>
                    </FormItem>
                )}
            />
        </div>

        {/* General address error message */}
        {form.formState.errors.address && form.formState.errors.address.message && (
          <p className="text-red-500 text-sm mt-2">{form.formState.errors.address.message}</p>
        )}

        {/* Submit, Cancel, and Delete Buttons at the end */}
        {/* Only show if in edit mode */}
        {isInitiallyEditing && (
            <div className="flex justify-end items-center gap-2 pt-4">
                {/* Delete Icon Button - Only show when editing existing data */}
                {initialData && onRequestDeleteFromForm && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={onRequestDeleteFromForm}
                        disabled={isSubmitting}
                        aria-label="Delete Client"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                {/* Spacer to push cancel/save to the right if delete is present */}
                {initialData && onRequestDeleteFromForm && <div className="flex-grow"></div>}

                {/* Cancel Button */}
                <Button type="button" variant="ghost" onClick={onCancelEdit} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {submitButtonLabel}
                </Button>
            </div>
        )}

        {/* Hidden salonId field */}
        <FormField
          control={form.control}
          name="salonId"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} type="hidden" />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}