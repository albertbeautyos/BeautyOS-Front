"use client"; // Needs to be a client component for DropdownMenu interaction

import { type Row } from "@tanstack/react-table";
import { MoreHorizontal, PencilIcon, Trash2Icon, EyeIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut, // Example shortcut
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onView: (data: TData) => void;
  onEdit: (data: TData) => void;
  onDelete: (data: TData) => void;
}

export function DataTableRowActions<TData>({
  row,
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  // You can access the row's original data using row.original
  const rowData = row.original;

  const handleView = () => {
    onView(rowData);
  };

  const handleEdit = () => {
    onEdit(rowData);
  };

  const handleDelete = () => {
    console.log("Delete requested for:", rowData);
    onDelete(rowData);
    // Actual deletion logic (e.g., showing confirmation modal) should be handled in the parent page
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={handleView}>
          <EyeIcon className="mr-2 h-4 w-4" /> View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <PencilIcon className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50">
          <Trash2Icon className="mr-2 h-4 w-4" /> Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}