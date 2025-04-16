"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  Table,
  TableMeta,
  Header,
  Cell,
} from "@tanstack/react-table"

import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// Commenting out imports for components that might not exist yet
// import { DataTablePagination } from "@/components/data-table-pagination"
// import { DataTableToolbar } from "@/components/data-table-toolbar"

import { DataTableColumnToggle } from "./data-table-column-toggle"
import { cn } from "@/lib/utils"

// Update Props Interface to accept a table instance
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  table: Table<TData>
}

// Helper function to check mobile hidden meta
const isMobileHidden = <TData, TValue>(item: Header<TData, TValue> | Cell<TData, TValue>): boolean => {
    // Access meta from the column definition
    return !!item.column.columnDef.meta?.mobileHidden;
};

// Update DataTable component to use the passed-in table instance
export function DataTable<TData, TValue>({
  columns,
  table,
}: DataTableProps<TData, TValue>) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          {/* Add filtering components here later if needed, driven by the passed table instance */}
        </div>
        {/* Conditionally render column toggle - hide on mobile */}
        <div className="hidden md:block">
            <DataTableColumnToggle table={table} />
        </div>
      </div>

       <div className="rounded-md border">
        <UITable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn({
                        "hidden md:table-cell": isMobileHidden(header),
                      })}
                    >
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
                    <TableCell
                      key={cell.id}
                      className={cn({
                        "hidden md:table-cell": isMobileHidden(cell),
                      })}
                    >
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
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>

      {/* Pagination is handled by the parent */}
    </div>
  )
}