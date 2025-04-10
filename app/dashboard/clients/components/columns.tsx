"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table-row-actions"
import { NewClientData } from "@/services/clients"

// Define the structure for a client - Updated fields
export type Client = {
  id: string
  first_name: string
  last_name: string
  email: string
  contact: string // Renaming to phone if necessary should happen in data fetching/mapping
  // Removed last_visit
  visits: number
  rating: number // Assuming a scale like 0-5
  points: number
  // Keep optional fields if they might still exist in API response or AddClientForm
  gender?: string
  pronouns?: string
  referredBy?: string
  clientType?: string
  birthday?: Date | string
  last_visit?: Date | string
  address?: {
    street?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
}

// Extend table meta type to include our handlers
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    viewClient?: (client: Client) => void
    editClient?: (client: Client) => void
    deleteClient?: (client: Client) => void
  }
}

// Define the columns based on the Updated Client type
export const columns: ColumnDef<Client>[] = [
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
  },
  {
    id: "name",
    accessorFn: row => `${row.first_name} ${row.last_name}`,
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Name" />
     ),
    cell: ({ row }) => <div>{`${row.original.first_name} ${row.original.last_name}`}</div>,
    filterFn: (row, id, value) => {
        const name = `${row.original.first_name} ${row.original.last_name}`;
        return name.toLowerCase().includes(String(value).toLowerCase());
    },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Email" />
     ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
     filterFn: (row, id, value) => String(row.getValue(id)).toLowerCase().includes(String(value).toLowerCase()),
  },
   {
    // Keep accessorKey as 'contact' if that's the field name in the data
    accessorKey: "contact",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Phone" /> // Changed header title
     ),
    cell: ({ row }) => <div>{row.getValue("contact")}</div>,
  },
  {
    accessorKey: "visits",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visits" />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("visits")}</div>,
  },
  {
    accessorKey: "rating",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Rating" />
    ),
    // Format rating (e.g., show one decimal place)
    cell: ({ row }) => <div className="text-center">{(row.getValue("rating") as number).toFixed(1)}</div>,
  },
  {
    accessorKey: "points",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Points" />
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("points")}</div>,
  },
  {
     id: "actions",
     cell: ({ row, table }) => (
       <DataTableRowActions
         row={row}
         // Access handlers from table meta
         onView={() => table.options.meta?.viewClient?.(row.original)}
         onEdit={() => table.options.meta?.editClient?.(row.original)}
         onDelete={() => table.options.meta?.deleteClient?.(row.original)}
       />
     ),
   },
]