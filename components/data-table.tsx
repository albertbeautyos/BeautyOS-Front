"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Commenting out imports for components that might not exist yet
// import { DataTablePagination } from "@/components/data-table-pagination"
// import { DataTableToolbar } from "@/components/data-table-toolbar"

import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { DataTableRowActions } from "@/components/data-table-row-actions"


// Define the structure for a client
export type Client = {
  id: number | string
  first_name: string
  last_name: string
  email: string
  contact: string
  last_visit: string | Date
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
      return value.includes(row.getValue(id))
    },
  },
   {
    accessorKey: "last_name",
     header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Last Name" />
     ),
    cell: ({ row }) => <div>{String(row.getValue("last_name"))}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
       <DataTableColumnHeader column={column} title="Email" />
     ),
    cell: ({ row }) => <div>{String(row.getValue("email"))}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
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


// Update Props Interface to be generic and accept columns/data
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  // Add other props if needed (e.g., for toolbar/pagination options)
}

// Update DataTable component to use TanStack Table
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      {/*
        Placeholder for Toolbar - uncomment and implement if needed
        Requires DataTableToolbar component
      */}
      {/* <DataTableToolbar table={table} /> */}

       <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/*
        Placeholder for Pagination - uncomment and implement if needed
        Requires DataTablePagination component
      */}
      {/* <DataTablePagination table={table} /> */}
    </div>
  )
}