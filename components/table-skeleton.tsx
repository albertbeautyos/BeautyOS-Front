import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TableSkeleton({ columnCount = 8, rowCount = 10 }) {
  return (
    <div className="space-y-4">
      {/* Removed Search Skeleton */}

      {/* Skeleton for Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Still render header skeletons for structure */}
              {Array.from({ length: columnCount }).map((_, index) => (
                <TableHead key={index}>
                  <Skeleton className="h-5 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-5 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Removed Pagination Skeleton */}
    </div>
  )
}