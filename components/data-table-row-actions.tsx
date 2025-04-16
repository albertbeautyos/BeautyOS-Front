"use client"; // Needs to be a client component for DropdownMenu interaction

import { type Row } from "@tanstack/react-table";
import { MoreHorizontal, PencilIcon, Trash2Icon, EyeIcon, XIcon, Eye, Trash2 } from "lucide-react";

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
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DataTableRowActions<TData>({
  row,
  onView,
  onEdit,
  onDelete,
}: DataTableRowActionsProps<TData>) {
  // Direct calls to handlers
  const handleView = () => {
    // Simply call the onView handler (which will now show the page loader)
    onView?.();
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleDelete = () => {
    console.log("Delete requested for row:", row.original);
    onDelete?.();
  };

  return (
    <div className="flex items-center space-x-1">
      {/* View Button */}
      {onView && (
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0"
          onClick={handleView}
        >
          <Eye className="h-4 w-4" />
          <span className="sr-only">View</span>
        </Button>
      )}
    </div>
  );
}