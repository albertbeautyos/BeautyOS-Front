"use client";

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InviteUserForm } from './InviteUserForm';

interface InviteUserSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserSheet({
  isOpen,
  onClose,
  onSuccess
}: InviteUserSheetProps) {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col overflow-hidden">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>Invite User</SheetTitle>
          <SheetDescription>
            Send an invitation to a new user to join your salon
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-6">
          <InviteUserForm
            onSuccess={handleSuccess}
            onCancel={onClose}
            className="mt-2"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}