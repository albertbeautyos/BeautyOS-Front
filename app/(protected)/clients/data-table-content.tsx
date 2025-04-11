"use client"
import { DataTable } from "@/components/data-table"
import type { ColumnDef, TableMeta } from "@tanstack/react-table"
import { Client } from "./components/columns"

// Define the expected meta structure based on columns.tsx
interface ClientTableMeta {
  viewClient?: (client: Client) => void
  editClient?: (client: Client) => void
  deleteClient?: (client: Client) => void
}

interface DataTableContentProps {
  columns: ColumnDef<Client>[]
  data: Client[]
  meta?: ClientTableMeta
}

export function DataTableContent({ columns, data, meta }: DataTableContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <DataTable columns={columns} data={data} meta={meta} />
    </div>
  )
}