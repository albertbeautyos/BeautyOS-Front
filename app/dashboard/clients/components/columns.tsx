"use client"

import { ColumnDef, RowData } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table-row-actions"
import { NewClientData } from "@/services/clients"

// Define the structure for a client - map API fields if needed
export type Client = {
  id: string // Assuming ID comes from API
  first_name: string
  last_name: string
  email: string
  contact: string
  last_visit: string | Date // Assuming date can be string or Date object
  // Add other fields matching your actual API response
  // Potentially add fields from NewClientData if they are returned by GET /clients
  gender?: string
  pronouns?: string
  referredBy?: string
  clientType?: string
  birthday?: Date | string
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

// Define the columns based on the Client type
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
    accessorKey: "id",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="First Name" />
     ),
    cell: ({ row }) => <div>{row.getValue("first_name")}</div>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
   {
    accessorKey: "last_name",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Last Name" />
     ),
    cell: ({ row }) => <div>{row.getValue("last_name")}</div>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Email" />
     ),
    cell: ({ row }) => <div>{row.getValue("email")}</div>,
     filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
   {
    accessorKey: "contact",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Contact" />
     ),
    cell: ({ row }) => <div>{row.getValue("contact")}</div>,
  },
  {
    accessorKey: "last_visit",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Last Visit" />
     ),
    cell: ({ row }) => {
       const value = row.getValue("last_visit")
       // Basic date formatting - consider using a library like date-fns for robustness
       const formattedDate = value instanceof Date ? value.toLocaleDateString() : String(value)
      return <div>{formattedDate}</div>
    },
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