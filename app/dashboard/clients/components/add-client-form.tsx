"use client";

import React, { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns"; // For date picker
import { CalendarIcon, Loader2, PencilIcon, XIcon } from 'lucide-react'; // Icons

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
  clientType: z.string().min(1, { message: "Client type is required." }), // Required
  birthday: z.date().optional(), // Use z.date() for DatePicker
  address: addressSchema,
});
// ---

interface AddClientFormProps {
    initialData?: Partial<NewClientData>; // Accept initial data
    isInitiallyEditing?: boolean; // Control initial mode
    onSuccess?: (data: NewClientData | Client) => void; // Updated type
    onCancelEdit?: () => void; // Optional callback for cancelling edit
    className?: string;
}

export function AddClientForm({
    initialData,
    isInitiallyEditing = !initialData, // Default to edit if no initial data, view otherwise
    onSuccess,
    onCancelEdit,
    className
}: AddClientFormProps) {
  const [isEditing, setIsEditing] = useState(isInitiallyEditing);
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
          setIsEditing(isInitiallyEditing); // Reset edit mode based on prop
      }
  }, [initialData, form.reset, isInitiallyEditing]); // form.reset is stable

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
            setIsEditing(false);
            onSuccess?.(updatedClient);
        } else {
            // ADD LOGIC
            console.log("Adding client:", dataPayload);
            const addedClient = await addClient(dataPayload);
            toast.success("Client Added", { description: `${addedClient.first_name} ${addedClient.last_name} has been successfully added.` });
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
    setIsEditing(false);
    onCancelEdit?.();
  }

  // Determine if fields should be disabled (view mode)
  const isDisabled = !isEditing && !!initialData;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-3 ${className}`}>

         {/* Edit/Cancel Buttons for View Mode */}
         {initialData && (
            <div className="flex justify-end gap-2 mb-3">
                {!isEditing ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <PencilIcon className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                ) : (
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                         <XIcon className="mr-1.5 h-3.5 w-3.5" /> Cancel
                    </Button>
                )}
            </div>
         )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* --- Fields --- */}
          {/* Use isDisabled prop on Input/Button/Calendar etc. */}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">First Name {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Last Name {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Phone {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Email {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Gender</FormLabel>
                <FormControl>
                  <Input placeholder="Select gender" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="pronouns"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Pronouns</FormLabel>
                <FormControl>
                  <Input placeholder="Select pronouns" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="referredBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Referred By</FormLabel>
                <FormControl>
                  <Input placeholder="Select referral source" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="clientType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Client Type {initialData ? null : <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input placeholder="Select client type" {...field} disabled={isDisabled} className="h-8 text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs">Date of birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-8 text-sm", // Apply height/size
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
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        {/* Address Fields */}
        <h3 className="text-base font-medium pt-3 border-t">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">Street</FormLabel>
                    <FormControl>
                        <Input placeholder="123 Main St" {...field} value={field.value ?? ''} disabled={isDisabled} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">City</FormLabel>
                    <FormControl>
                        <Input placeholder="Anytown" {...field} value={field.value ?? ''} disabled={isDisabled} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">State</FormLabel>
                    <FormControl>
                        <Input placeholder="Select state" {...field} value={field.value ?? ''} disabled={isDisabled} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">Postal Code</FormLabel>
                    <FormControl>
                        <Input placeholder="Enter postal code" {...field} value={field.value ?? ''} disabled={isDisabled} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-xs">Country</FormLabel>
                    <FormControl>
                        <Input placeholder="Select country" {...field} value={field.value ?? ''} disabled={isDisabled} className="h-8 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                    </FormItem>
                )}
            />
        </div>

        {/* Submit Button (conditional) */}
        {(isEditing || !initialData) && (
            <Button type="submit" disabled={isSubmitting} size="sm" className="w-full !mt-4">
            {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : initialData ? (
                "Save Changes"
            ) : (
                "Add Client"
            )}
            </Button>
        )}
      </form>
    </Form>
  );
}