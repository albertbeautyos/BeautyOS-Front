"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Import Client type from the columns definition in the same directory
import { Client } from "./columns";

// Delete Confirmation Dialog Component
interface ClientDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  clientToDelete: Client | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ClientDeleteDialog: React.FC<ClientDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  clientToDelete,
  onConfirm,
  onCancel
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the client
            <span className="font-semibold"> {clientToDelete?.first_name} {clientToDelete?.last_name}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};