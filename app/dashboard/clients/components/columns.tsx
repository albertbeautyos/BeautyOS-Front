"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table-row-actions"

// Define the structure for a client
export type Client = {
  id: number | string // Assuming ID can be number or string
  first_name: string
  last_name: string
  email: string
  contact: string
  last_visit: string | Date // Assuming date can be string or Date object
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
    cell: ({ row }) => <div className="w-[80px]">{String(row.getValue("id"))}</div>,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="First Name" />
     ),
    cell: ({ row }) => <div>{String(row.getValue("first_name"))}</div>,
    filterFn: (row, id, value) => {
      const rowValue = String(row.getValue(id));
      return String(value).split(',').some(val => rowValue.includes(val)); // Basic multi-value filter example
    },
  },
   {
    accessorKey: "last_name",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Last Name" />
     ),
    cell: ({ row }) => <div>{String(row.getValue("last_name"))}</div>,
    filterFn: (row, id, value) => {
      const rowValue = String(row.getValue(id));
      return String(value).split(',').some(val => rowValue.includes(val));
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Email" />
     ),
    cell: ({ row }) => <div>{String(row.getValue("email"))}</div>,
     filterFn: (row, id, value) => {
       const rowValue = String(row.getValue(id));
       return String(value).split(',').some(val => rowValue.includes(val));
    },
  },
   {
    accessorKey: "contact",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Contact" />
     ),
    cell: ({ row }) => <div>{String(row.getValue("contact"))}</div>,
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
     cell: ({ row }) => <DataTableRowActions row={row} />,
   },
]