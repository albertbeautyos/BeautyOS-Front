"use client"
import { DataTable } from "@/components/data-table"
import type { ColumnDef, TableMeta, Table } from "@tanstack/react-table"
import { Client } from "@/services/clients"

// Define the expected meta structure based on columns.tsx
interface ClientTableMeta {
  viewClient?: (client: Client) => void
  editClient?: (client: Client) => void
  deleteClient?: (client: Client) => void
}

interface DataTableContentProps {
  columns: ColumnDef<Client>[]
  meta?: ClientTableMeta
  table: Table<Client>
}

export function DataTableContent({
  columns,
  meta,
  table
}: DataTableContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4  pt-0">
      <DataTable
        columns={columns}
        table={table}
      />
    </div>
  )
}