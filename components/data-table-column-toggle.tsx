"use client";

import React, { useEffect } from "react";
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

interface DataTableColumnToggleProps<TData> {
  table: Table<TData>;
  storageKeyPrefix?: string; // Optional prefix for local storage key
}

export function DataTableColumnToggle<TData>({
  table,
  storageKeyPrefix = "column-visibility", // Default prefix
}: DataTableColumnToggleProps<TData>) {

  const pathname = usePathname();
  const localStorageKey = `${storageKeyPrefix}-${pathname}`;
  const storedVisibility = LocalStorageManager.get(localStorageKey );


  // Load initial state using LocalStorageManager
  useEffect(() => {
    try {
      if (storedVisibility) {
        const parsedVisibility = JSON.parse(storedVisibility);
        // Ensure it's an object before setting
        if (typeof parsedVisibility === 'object' && parsedVisibility !== null) {
           table.setColumnVisibility(parsedVisibility);
        }
      }
    } catch (error) {
        console.error("Failed to load or parse column visibility from storage:", error);
        // Optionally remove invalid item using the manager
        // LocalStorageManager.remove(localStorageKey);
    }

  }, [table, localStorageKey]); // Run on mount and when key changes

  // Save state using LocalStorageManager
  useEffect(() => {
    const columnVisibility = table.getState().columnVisibility;
    try {
        // Avoid saving the default state if it's empty or hasn't been loaded/changed yet
        // This check might need refinement depending on initial table state
        if (Object.keys(columnVisibility).length > 0 || LocalStorageManager.get(localStorageKey)) {
             LocalStorageManager.set(localStorageKey, JSON.stringify(columnVisibility));
        }
    } catch (error) {
        console.error("Failed to save column visibility to storage:", error);
    }
  }, [table.getState().columnVisibility, localStorageKey]);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
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
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className="capitalize"
                checked={column.getIsVisible()}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {/* Attempt to get a readable name, fallback to id */}
                {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}