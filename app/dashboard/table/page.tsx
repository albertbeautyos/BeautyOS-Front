import { Suspense } from "react"
import { DataTableContent } from "@/components/data-table-content"
import { TableSkeleton } from "@/components/table-skeleton"

export default function DataTablePage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DataTableContent />
    </Suspense>
  )
}