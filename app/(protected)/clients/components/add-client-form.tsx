"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns"; // For date picker
import { CalendarIcon, Loader2, PencilIcon, XIcon, Trash2, Copy } from 'lucide-react'; // Icons

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
import { Calendar } from "@/components/ui/calendar"; // Added
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added
import { addClient, NewClientData, Client } from '@/services/clients';
import { toast } from "sonner";
import { cn } from "@/lib/utils"; // For conditional classnames

// --- Updated Zod Schema ---
const addressSchema = z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    // Location is omitted for simplicity in the form for now
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
  birthday: z.date().optional(), // Use z.date() for DatePicker
  address: addressSchema,
});
// ---

interface AddClientFormProps {
    initialData?: Partial<NewClientData>; // Accept initial data
    isInitiallyEditing?: boolean; // Control initial mode - THIS WILL NOW BE THE ONLY SOURCE OF TRUTH FOR EDIT STATE
    onSuccess?: (data: NewClientData | Client) => void; // Updated type
    onCancelEdit?: () => void; // Optional callback for cancelling edit
    onRequestDeleteFromForm?: () => void; // New prop for delete action
    className?: string;
}

export function AddClientForm({
    initialData,
    isInitiallyEditing = !initialData, // Default to edit if no initial data, view otherwise
    onSuccess,
    onCancelEdit,
    onRequestDeleteFromForm, // Destructure new prop
    className
}: AddClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? { // Populate with initialData or defaults
        firstName: initialData.firstName ?? "",
        lastName: initialData.lastName ?? "",
        phone: initialData.phone ?? "",
        email: initialData.email ?? "",
        gender: initialData.gender ?? "",
        pronouns: initialData.pronouns ?? "",
        referredBy: initialData.referredBy ?? "",
        clientType: initialData.clientType ?? "",
        // Handle date conversion carefully
        birthday: initialData.birthday ? new Date(initialData.birthday) : undefined,
        address: {
            street: initialData.address?.street ?? "",
            city: initialData.address?.city ?? "",
            state: initialData.address?.state ?? "",
            postalCode: initialData.address?.postalCode ?? "",
            country: initialData.address?.country ?? "",
        },
    } : {
        // Default empty values if no initialData
        firstName: "", lastName: "", phone: "", email: "", gender: "",
        pronouns: "", referredBy: "", clientType: "", birthday: undefined,
        address: { street: "", city: "", state: "", postalCode: "", country: "" },
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

  // Reset form if initialData changes (e.g., navigating between clients)
  useEffect(() => {
      if (initialData) {
          form.reset({
            firstName: initialData.firstName ?? "",
            lastName: initialData.lastName ?? "",
            phone: initialData.phone ?? "",
            email: initialData.email ?? "",
            gender: initialData.gender ?? "",
            pronouns: initialData.pronouns ?? "",
            referredBy: initialData.referredBy ?? "",
            clientType: initialData.clientType ?? "",
            birthday: initialData.birthday ? new Date(initialData.birthday) : undefined,
            address: {
                street: initialData.address?.street ?? "",
                city: initialData.address?.city ?? "",
                state: initialData.address?.state ?? "",
                postalCode: initialData.address?.postalCode ?? "",
                country: initialData.address?.country ?? "",
            },
          });
      }
  }, [initialData, form.reset]); // form.reset is stable

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // console.log("onSubmit called. Mode:", initialData ? 'update' : 'add', "Values:", values);
    setIsSubmitting(true);

    // --- ORIGINAL LOGIC (Restored) ---
    try {
        const dataPayload: NewClientData = {
            ...values,
            address: (values.address && Object.values(values.address).some(v => v))
                ? values.address
                : undefined,
            // birthday: values.birthday ? values.birthday.toISOString() : undefined, // Keep birthday conversion commented if form handles Date object
        };

        if (initialData && 'id' in initialData && initialData.id) { // Check if initialData has an id for update
            // UPDATE LOGIC
            console.log("Updating client (placeholder):", dataPayload);
            // --- TODO: Implement actual updateClient service call ---
            // const updatedClient = await updateClient(initialData.id, dataPayload);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            // Simulate response, ensure ID is kept - Cast via unknown
            const updatedClient = { ...initialData, ...dataPayload, id: initialData.id } as unknown as (NewClientData | Client);
            // -----
            toast.success("Client Updated", { description: `${dataPayload.firstName} ${dataPayload.lastName} details updated.` });
            onSuccess?.(updatedClient);
        } else {
            // ADD LOGIC
            console.log("Adding client:", dataPayload);
            const addedClient = await addClient(dataPayload);
            toast.success("Client Added", { description: `${addedClient.firstName} ${addedClient.lastName} has been successfully added.` });
            form.reset();
            onSuccess?.(addedClient);
        }
    } catch (error) {
      console.error("Failed operation:", error);
      toast.error(initialData ? "Error Updating Client" : "Error Adding Client", {
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
    // --- END ORIGINAL LOGIC ---

    /* --- TEMPORARY SIMPLIFICATION (Removed) ---
    console.log("Simulating submission delay...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Simulation complete. Resetting submitting state.");
    setIsSubmitting(false);
    if (initialData) {
        toast.success("Simulated Update Successful");
        setIsEditing(false);
        onSuccess?.({ ...initialData, ...values });
    } else {
        toast.success("Simulated Add Successful");
        form.reset();
        onSuccess?.({ id: `temp-${Date.now()}`, ...values } as unknown as NewClientData);
    }
    */
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
           <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal", // Ensure button takes full width
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isDisabled} // Disable trigger too
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01") || isDisabled // Disable calendar too
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Address Fields */}
        <h3 className="text-lg font-medium pt-4 border-t">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Street</FormLabel>
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
                    <FormLabel>City</FormLabel>
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
                    <FormLabel>State</FormLabel>
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
                    <FormLabel>Postal Code</FormLabel>
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
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                        <Input {...field} disabled={isDisabled} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

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
                    {initialData ? "Save Changes" : "Add Client"}
                </Button>
            </div>
        )}
      </form>
    </Form>
  );
}