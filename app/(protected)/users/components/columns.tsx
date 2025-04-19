"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table-row-actions"
import { User } from "@/services/users"
import '@tanstack/react-table' // Re-import for type augmentation

// Extend table and column meta types
declare module '@tanstack/react-table' {
  // Augment the existing ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    mobileHidden?: boolean
  }

  // Keep the TableMeta augmentation
  interface TableMeta<TData extends RowData> {
    viewUser?: (user: User) => void
    editUser?: (user: User) => void
    deleteUser?: (user: User) => void
  }
}

// Define the columns based on the User type
export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      mobileHidden: false, // Hide on mobile
    },
  },
  {
    id: "name",
    accessorFn: row => `${row.firstName} ${row.lastName}`,
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Name" />
     ),
    cell: ({ row }) => <div>{`${row.original.firstName} ${row.original.lastName}`}</div>,
    filterFn: (row, id, value) => {
        const name = `${row.original.firstName} ${row.original.lastName}`;
        return name.toLowerCase().includes(String(value).toLowerCase());
    },
    enableSorting: true,
    // No meta needed, visible by default
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Email" />
     ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
     filterFn: (row, id, value) => String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase()),
     meta: {
      mobileHidden: false, // Hide on mobile
    },
  },
   {
    accessorKey: "phone",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Phone" />
     ),
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
    // No meta needed, visible by default
  },
  {
    accessorKey: "level",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Level" />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("level") || 'N/A'}</div>,
    meta: {
      mobileHidden: false, // Hide on mobile
    },
  },
  {
    accessorKey: "services",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Services" />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("services") || 'N/A'}</div>,
    meta: {
      mobileHidden: false, // Hide on mobile
    },
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("rating");
      return <div className="text-center">{typeof value === 'number' ? value.toFixed(1) : 'N/A'}</div>;
    },
    meta: {
      mobileHidden: false, // Hide on mobile
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const roles = row.getValue("role") as string[] | undefined;
      return <div>{roles ? roles.join(', ') : 'N/A'}</div>;
    },
    meta: {
      mobileHidden: false, // Hide on mobile
    },
  },
   {
     id: "actions",
     cell: ({ row, table }) => (
       <DataTableRowActions
         row={row}
         // Access handlers from table meta
         onView={() => table.options.meta?.viewUser?.(row.original)}
         onEdit={() => table.options.meta?.editUser?.(row.original)}
         onDelete={() => table.options.meta?.deleteUser?.(row.original)}
       />
     ),
     meta: {
      mobileHidden: false
    },
   },
]