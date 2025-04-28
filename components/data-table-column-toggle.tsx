"use client";

import React, { useState, useEffect } from "react";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { usePathname } from 'next/navigation';

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LocalStorageManager } from "@/helpers/localStorageManager";
import { MOBILE_BREAKPOINT, DEFAULT_MOBILE_VISIBILITY } from "@/constants/table";

// Define mobile breakpoint
// const MOBILE_BREAKPOINT = "(max-width: 768px)";

// Define default mobile columns (name, number, actions)
// const DEFAULT_MOBILE_VISIBILITY = { name: true, number: true, actions: true };

interface DataTableColumnToggleProps<TData> {
  table: Table<TData>;
  storageKeyPrefix?: string; // Optional prefix for local storage key
}

export function DataTableColumnToggle<TData>({
  table,
  storageKeyPrefix = "column-visibility", // Default prefix
}: DataTableColumnToggleProps<TData>) {
  const [isMobile, setIsMobile] = useState(false); // State for mobile detection
  const pathname = usePathname();

  // Effect for mobile detection
  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);
    const handleResize = () => setIsMobile(mediaQuery.matches);

    handleResize(); // Initial check
    mediaQuery.addEventListener('change', handleResize);

    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []); // Runs only on mount and unmount

  // Determine storage key based on view type
  const localStorageKey = isMobile
    ? `${storageKeyPrefix}-mobile-${pathname}`
    : `${storageKeyPrefix}-${pathname}`;

  // Load initial state using LocalStorageManager
  useEffect(() => {
    try {
      const storedVisibilityString = LocalStorageManager.get(localStorageKey);

      if (storedVisibilityString) {
        const parsedVisibility = JSON.parse(storedVisibilityString);
        if (typeof parsedVisibility === 'object' && parsedVisibility !== null) {
           table.setColumnVisibility(parsedVisibility);
        }
      } else if (isMobile) {
         // Apply default mobile visibility if no stored state for mobile
         const initialMobileVisibility: Record<string, boolean> = {};
         table.getAllLeafColumns().forEach(column => {
            // Default to visible if in DEFAULT_MOBILE_VISIBILITY, otherwise hidden
            initialMobileVisibility[column.id] = DEFAULT_MOBILE_VISIBILITY[column.id as keyof typeof DEFAULT_MOBILE_VISIBILITY] ?? false;
         });
         table.setColumnVisibility(initialMobileVisibility);
      }
      // Desktop: If no stored state, tanstack-table default (all visible) is used.
    } catch (error) {
        console.error("Failed to load or parse column visibility from storage:", error);
    }
  // Depend on table instance, key (changes on mobile/desktop switch), and mobile status
  }, [table, localStorageKey, isMobile]);

  // Save state using LocalStorageManager
  useEffect(() => {
    // Check if columnVisibility is initialized before saving
    if (table.getState().columnVisibility) {
        const columnVisibility = table.getState().columnVisibility;
        try {
            LocalStorageManager.set(localStorageKey, JSON.stringify(columnVisibility));
        } catch (error) {
            console.error("Failed to save column visibility to storage:", error);
        }
    }
  // Depend on the actual visibility state and the key (mobile/desktop switch)
  }, [table.getState().columnVisibility, localStorageKey, isMobile]);

  // The rest of the component renders the dropdown based on the current table state
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          // Keep the button hidden on small screens, visible on large (`lg`)
          className="ml-auto  h-8 lg:flex"
        >
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px]">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllLeafColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
              // NOTE: If you want to *always* hide a specific column (like 'actions')
              // from this toggle list, add `&& column.id !== 'actions'` here.
          )
          .map((column) => {
            // Get readable name: use header if string, else fallback to id
            const headerContent = column.columnDef.header;
            const columnName = typeof headerContent === 'string' ? headerContent : column.id;

            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columnName}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}