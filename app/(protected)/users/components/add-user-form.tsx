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

// Basic address schema that can be empty
const addressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
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
  role: z.array(z.string()).min(1, { message: "At least one role is required." }).optional()
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
      gender: initialData?.gender ?? "Male",
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
      role: initialData?.role ?? ["PROFESSIONAL"]
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
            gender: initialData.gender ?? "Male",
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
          });
      }
  }, [initialData, form.reset]);

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      // Prepare base payload
      const dataPayload: NewUserData = {
        ...values,
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
        address: values.address
          ? {
              ...values.address,
              location: values.address.location
                ? {
                    type: values.address.location.type,
                    coordinates: values.address.location.coordinates
                  }
                : { type: "Point", coordinates: [0, 0] },
            }
          : undefined,
      };

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
                  <Input {...field} disabled={isDisabled} />
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
                  <Input {...field} disabled={isDisabled} />
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
                  <Input {...field} disabled={isDisabled} />
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
                  <Input {...field} disabled={isDisabled} />
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
                  <Input {...field} disabled={isDisabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        {/* Hidden Role field remains the same */}
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