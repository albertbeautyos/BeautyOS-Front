"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // If needed for styling variations later

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string; // Allow passing custom classes for the outer div
}

export function LoadingOverlay({
  isLoading,
  message = "Loading...", // Default message
  className
}: LoadingOverlayProps) {
  if (!isLoading) {
    return null; // Don't render anything if not loading
  }

  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300",
        isLoading ? "opacity-100" : "opacity-0 pointer-events-none", // Fade effect
        className // Allow overriding/extending classes
      )}
    >
      <div className="bg-background rounded-lg p-6 flex flex-col items-center gap-3 shadow-lg border">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        {message && (
          <p className="text-sm font-medium text-foreground">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}