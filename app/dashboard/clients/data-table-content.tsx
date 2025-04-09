"use client"
import { DataTable } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Client } from "./components/columns"

interface DataTableContentProps {
  columns: ColumnDef<Client>[]
  data: Client[]
}

export function DataTableContent({ columns, data }: DataTableContentProps) {
  return (

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTable columns={columns} data={data} />
        </div>
  )
}