"use client";

import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from 'lucide-react';
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
import { toast } from "sonner";
import { useAppSelector } from '@/store/hooks';
import { selectSalonId } from '@/store/slices/authSlice';
import { inviteUser } from '@/services/salons';

// Create the form schema with contact (email/phone) and role fields
const formSchema = z.object({
  contact: z.string()
    .min(1, { message: "Email or phone number is required." })
    .refine(value => {
      // Check if it's a valid email or phone number
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      const isPhone = /^[0-9+\-\s()]{7,20}$/.test(value);
      return isEmail || isPhone;
    }, { message: "Please enter a valid email or phone number." }),
  role: z.enum(["PROFESSIONAL", "ASSISTANT", "RECEPTIONIST", "MANAGER", "OWNER"], {
    required_error: "Please select a role",
  })
});

type FormData = z.infer<typeof formSchema>;

interface InviteUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function InviteUserForm({
  onSuccess,
  onCancel,
  className,
}: InviteUserFormProps) {
  const salonId = useAppSelector(selectSalonId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact: "",
      role: "PROFESSIONAL"
    }
  });

  const onSubmit = async (values: FormData) => {
    if (!salonId) {
      toast.error("No salon selected");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the invite user service with the appropriate parameter
       await inviteUser(salonId, {
        username: values.contact, // Use the contact as username
        role: values.role
      });


      toast.success("Invitation sent", {
        description: `An invitation has been sent to ${values.contact}`
      });

      // Reset form and call success callback
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      // Define a type guard to check if error has the expected structure
      const isApiError = (err: unknown): err is { status: { cod: number } } => {
        return !!err && typeof err === 'object' && 'status' in err &&
               !!err.status && typeof err.status === 'object' &&
               'cod' in err.status && typeof err.status.cod === 'number';
      };

      if (isApiError(error) && error.status.cod === 409) {
        toast.error("Failed to send invitation", {
          description: error instanceof Error ? error.message : "An unexpected error occurred"
        });
      } else {
        toast.error("Failed to send invitation", {
          description: "Salon already exist"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={`space-y-4 ${className}`}>
        <FormField
          control={form.control}
          name="contact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email or Phone Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="name@example.com or +1234567890" />
              </FormControl>
              <FormDescription>
                Enter the email or phone number of the person you want to invite
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                >
                  <option value="PROFESSIONAL">Professional</option>
                  <option value="RECEPTIONIST">Receptionist</option>
                  <option value="OWNER">Owner</option>
                </select>
              </FormControl>
              <FormDescription>
                Select the role for the invited user
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              "Send Invitation"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}