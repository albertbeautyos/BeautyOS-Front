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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addUser, NewUserData, User, updateUser } from '@/services/users';
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // For conditional classnames

// --- Updated Zod Schema --- Removing nested defaults
const locationSchema = z.object({
  type: z.string(), // Removed default
  coordinates: z.array(z.number()) // Removed default
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
  location: locationSchema.optional()
}).optional();

// Create the base form schema
const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  phone: z.string().min(1, { message: "Phone number is required." }),
  email: z.union([
    z.string().email({ message: "Invalid email address." }),
    z.string().max(0) // Empty string is valid
  ]).optional(),
  profileImage: z.string().optional(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  birthday: z.date().optional().nullable(),
  address: addressSchema,
  role: z.array(z.string()).min(1, { message: "At least one role is required." }).optional(),
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

// Define the form schema type
type FormData = z.infer<typeof formSchema>;

// Helper function to format Date to YYYY-MM-DD
const formatDateForInput = (date: Date | undefined | null): string => {
  if (!date) return "";
  if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  return "";
};

// Helper function to parse YYYY-MM-DD to Date or null
const parseDateFromInput = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value + 'T00:00:00');
  if (!isNaN(date.getTime())) {
      return date;
  }
  return null;
};

// Helper function to check if address is empty with proper typing
const isAddressEmpty = (address: FormData['address']) => {
  if (!address) return true;
  return (
    (!address.street || address.street.trim() === '') &&
    (!address.city || address.city.trim() === '') &&
    (!address.state || address.state.trim() === '') &&
    (!address.postalCode || address.postalCode.trim() === '') &&
    (!address.country || address.country.trim() === '')
  );
};

interface AddUserFormProps {
    initialData?: Partial<NewUserData> & { id?: string };
    isInitiallyEditing?: boolean;
    onSuccess?: (data: NewUserData | User) => void;
    onCancelEdit?: () => void;
    onRequestDeleteFromForm?: () => void;
    className?: string;
    submitButtonLabel?: string;
}

export function AddUserForm({
    initialData,
    isInitiallyEditing = !initialData,
    onSuccess,
    onCancelEdit,
    onRequestDeleteFromForm,
    className,
    submitButtonLabel = initialData ? "Save Changes" : "Add User"
}: AddUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    // Ensure full default structure for nested objects
    defaultValues: {
      firstName: initialData?.firstName ?? "",
      lastName: initialData?.lastName ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      profileImage: initialData?.profileImage ?? "",
      gender: initialData?.gender ?? "opt-out",
      pronouns: initialData?.pronouns ?? "",
      birthday: initialData?.birthday ? new Date(initialData.birthday) : null,
      address: {
        street: initialData?.address?.street ?? "",
        city: initialData?.address?.city ?? "",
        state: initialData?.address?.state ?? "",
        postalCode: initialData?.address?.postalCode ?? "",
        country: initialData?.address?.country ?? "",
        location: {
          type: initialData?.address?.location?.type ?? "Point", // Provide default
          coordinates: initialData?.address?.location?.coordinates ?? [0, 0] // Provide default
        }
      },
      role: initialData?.role ?? ["PROFESSIONAL"],
      salonId: initialData?.salonId ?? "salon_1" // Provide default salonId
    }
  });

  // Helper function for copy to clipboard
  const handleCopyToClipboard = async (text: string | undefined, fieldName: string) => {

    if(!text) return null

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
            email: initialData.email ?? undefined,
            profileImage: initialData.profileImage ?? "",
            gender: initialData.gender ?? "opt-out",
            pronouns: initialData.pronouns ?? "",
            birthday: initialData.birthday ? new Date(initialData.birthday) : null,
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
            role: initialData.role ?? ["PROFESSIONAL"],
            salonId: initialData.salonId ?? "salon_1" // Reset salonId
          });
      }
  }, [initialData, form.reset]);

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      // Check if address is empty
      const addressIsEmpty = isAddressEmpty(values.address);

      // Prepare base payload - remove spread of values to have more control
      const dataPayload: NewUserData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        // Only include email if it's not an empty string
        email: values.email && values.email.trim() !== '' ? values.email : undefined,
        gender: values.gender ?? "Male",
        role: values.role ?? ["PROFESSIONAL"],
        profileImage: values.profileImage,
        pronouns: values.pronouns,
        birthday: values.birthday ?? undefined,
        // Add salonId with a default value
        salonId: values.salonId ?? "salon_1", // Use form value with fallback
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

      // Determine if we're updating an existing user
      const isUpdating = initialData && initialData.id && typeof initialData.id === 'string';
      let result: User;

      if (isUpdating && initialData.id) {
        // --- UPDATE LOGIC ---
        result = await updateUser(initialData.id, dataPayload);
        toast.success("User Updated", { description: `${result.firstName} ${result.lastName} details updated.` });
      } else {
        // --- ADD LOGIC ---
        // Clean payload if id accidentally exists (shouldn't with current setup, but good practice)
        let finalPayload: NewUserData;
        if ('id' in dataPayload) {
          const { id, ...cleanDataPayload } = dataPayload as NewUserData & { id: string };
          finalPayload = cleanDataPayload;
        } else {
          finalPayload = dataPayload;
        }
        result = await addUser(finalPayload);
        toast.success("User Added", { description: `${result.firstName} ${result.lastName} has been successfully added.` });
        form.reset(); // Reset form only on successful add
      }

      // Call onSuccess callback with the result from the API
      if (onSuccess) {
        onSuccess(result);
      }

    } catch (error) {
      console.error("Failed operation:", error);
      toast.error(initialData?.id ? "Error Updating User" : "Error Adding User", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !isInitiallyEditing && !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        {/* Main Form Fields Grid */}
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
                <FormLabel>Email</FormLabel>
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

        {/* Address Section (Outside main grid) */}
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

        {/* Submit/Cancel/Delete Buttons */}
        {isInitiallyEditing && (
            <div className="flex justify-end items-center gap-2 pt-4">
                {initialData && onRequestDeleteFromForm && (
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={onRequestDeleteFromForm}
                        disabled={isSubmitting}
                        aria-label="Delete User"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                {initialData && onRequestDeleteFromForm && <div className="flex-grow"></div>}
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

        {/* Hidden Role field */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} type="hidden" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}