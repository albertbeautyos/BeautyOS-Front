"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// --- Generic Confirmation Dialog ---
interface ConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string; // e.g., "Delete Client", "Confirm Action"
  description: string; // e.g., "Are you sure you want to delete..."
  itemName?: string; // Optional: Name of the item being acted upon for display
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonText?: string; // Optional: Default "Confirm"
  cancelButtonText?: string; // Optional: Default "Cancel"
  confirmButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"; // Optional: Default "destructive" for delete
}

export function ConfirmationDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  itemName,
  onConfirm,
  onCancel,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  confirmButtonVariant = "destructive", // Sensible default for deletion
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
            {itemName && (
                <>
                    <br />
                    <span className="font-semibold mt-2 block">{itemName}</span>
                </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>{cancelButtonText}</AlertDialogCancel>
          <Button onClick={onConfirm} variant={confirmButtonVariant}>
            {confirmButtonText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}