"use client"

import { useState, useDeferredValue } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"
import { SkeletonPagination } from "@/components/ui/skeleton"

// Fake data type
interface TableData {
  id: string
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
  joinDate: string
}

// Deterministic fake data
const fakeData: TableData[] = [
  { id: "user-001", name: "User 1", email: "user1@example.com", role: "Admin", status: "active", joinDate: "2023-01-15" },
  { id: "user-002", name: "User 2", email: "user2@example.com", role: "User", status: "inactive", joinDate: "2023-02-20" },
  { id: "user-003", name: "User 3", email: "user3@example.com", role: "Editor", status: "pending", joinDate: "2023-03-10" },
  { id: "user-004", name: "User 4", email: "user4@example.com", role: "Viewer", status: "active", joinDate: "2023-01-05" },
  { id: "user-005", name: "User 5", email: "user5@example.com", role: "Manager", status: "active", joinDate: "2023-04-22" },
  { id: "user-006", name: "User 6", email: "user6@example.com", role: "User", status: "inactive", joinDate: "2023-05-18" },
  { id: "user-007", name: "User 7", email: "user7@example.com", role: "Admin", status: "active", joinDate: "2023-02-11" },
  { id: "user-008", name: "User 8", email: "user8@example.com", role: "Editor", status: "pending", joinDate: "2023-06-30" },
  { id: "user-009", name: "User 9", email: "user9@example.com", role: "Viewer", status: "active", joinDate: "2023-07-25" },
  { id: "user-010", name: "User 10", email: "user10@example.com", role: "Manager", status: "inactive", joinDate: "2023-03-19" },
  { id: "user-011", name: "User 11", email: "user11@example.com", role: "User", status: "active", joinDate: "2023-08-14" },
  { id: "user-012", name: "User 12", email: "user12@example.com", role: "Admin", status: "pending", joinDate: "2023-09-02" },
  { id: "user-013", name: "User 13", email: "user13@example.com", role: "Editor", status: "active", joinDate: "2023-10-17" },
  { id: "user-014", name: "User 14", email: "user14@example.com", role: "Viewer", status: "inactive", joinDate: "2023-11-22" },
  { id: "user-015", name: "User 15", email: "user15@example.com", role: "Manager", status: "active", joinDate: "2023-12-05" },
  { id: "user-016", name: "User 16", email: "user16@example.com", role: "User", status: "pending", joinDate: "2023-01-30" },
  { id: "user-017", name: "User 17", email: "user17@example.com", role: "Admin", status: "active", joinDate: "2023-02-28" },
  { id: "user-018", name: "User 18", email: "user18@example.com", role: "Editor", status: "inactive", joinDate: "2023-03-15" },
  { id: "user-019", name: "User 19", email: "user19@example.com", role: "Viewer", status: "active", joinDate: "2023-04-10" },
  { id: "user-020", name: "User 20", email: "user20@example.com", role: "Manager", status: "pending", joinDate: "2023-05-26" },
  { id: "user-021", name: "User 21", email: "user21@example.com", role: "User", status: "active", joinDate: "2023-06-12" },
  { id: "user-022", name: "User 22", email: "user22@example.com", role: "Admin", status: "inactive", joinDate: "2023-07-05" },
  { id: "user-023", name: "User 23", email: "user23@example.com", role: "Editor", status: "active", joinDate: "2023-08-21" },
  { id: "user-024", name: "User 24", email: "user24@example.com", role: "Viewer", status: "pending", joinDate: "2023-09-14" },
  { id: "user-025", name: "User 25", email: "user25@example.com", role: "Manager", status: "active", joinDate: "2023-10-03" },
  { id: "user-026", name: "User 26", email: "user26@example.com", role: "User", status: "inactive", joinDate: "2023-11-19" },
  { id: "user-027", name: "User 27", email: "user27@example.com", role: "Admin", status: "active", joinDate: "2023-12-28" },
  { id: "user-028", name: "User 28", email: "user28@example.com", role: "Editor", status: "pending", joinDate: "2023-01-11" },
  { id: "user-029", name: "User 29", email: "user29@example.com", role: "Viewer", status: "active", joinDate: "2023-02-05" },
  { id: "user-030", name: "User 30", email: "user30@example.com", role: "Manager", status: "inactive", joinDate: "2023-03-22" },
  { id: "user-031", name: "User 31", email: "user31@example.com", role: "User", status: "active", joinDate: "2023-04-17" },
  { id: "user-032", name: "User 32", email: "user32@example.com", role: "Admin", status: "pending", joinDate: "2023-05-09" },
  { id: "user-033", name: "User 33", email: "user33@example.com", role: "Editor", status: "active", joinDate: "2023-06-24" },
  { id: "user-034", name: "User 34", email: "user34@example.com", role: "Viewer", status: "inactive", joinDate: "2023-07-13" },
  { id: "user-035", name: "User 35", email: "user35@example.com", role: "Manager", status: "active", joinDate: "2023-08-08" },
  { id: "user-036", name: "User 36", email: "user36@example.com", role: "User", status: "pending", joinDate: "2023-09-30" },
  { id: "user-037", name: "User 37", email: "user37@example.com", role: "Admin", status: "active", joinDate: "2023-10-27" },
  { id: "user-038", name: "User 38", email: "user38@example.com", role: "Editor", status: "inactive", joinDate: "2023-11-06" },
  { id: "user-039", name: "User 39", email: "user39@example.com", role: "Viewer", status: "active", joinDate: "2023-12-21" },
  { id: "user-040", name: "User 40", email: "user40@example.com", role: "Manager", status: "pending", joinDate: "2023-01-18" },
  { id: "user-041", name: "User 41", email: "user41@example.com", role: "User", status: "active", joinDate: "2023-02-14" },
  { id: "user-042", name: "User 42", email: "user42@example.com", role: "Admin", status: "inactive", joinDate: "2023-03-09" },
  { id: "user-043", name: "User 43", email: "user43@example.com", role: "Editor", status: "active", joinDate: "2023-04-03" },
  { id: "user-044", name: "User 44", email: "user44@example.com", role: "Viewer", status: "pending", joinDate: "2023-05-29" },
  { id: "user-045", name: "User 45", email: "user45@example.com", role: "Manager", status: "active", joinDate: "2023-06-15" },
  { id: "user-046", name: "User 46", email: "user46@example.com", role: "User", status: "inactive", joinDate: "2023-07-01" },
  { id: "user-047", name: "User 47", email: "user47@example.com", role: "Admin", status: "active", joinDate: "2023-08-27" },
  { id: "user-048", name: "User 48", email: "user48@example.com", role: "Editor", status: "pending", joinDate: "2023-09-19" },
  { id: "user-049", name: "User 49", email: "user49@example.com", role: "Viewer", status: "active", joinDate: "2023-10-08" },
  { id: "user-050", name: "User 50", email: "user50@example.com", role: "Manager", status: "inactive", joinDate: "2023-11-01" }
];

interface DataTableProps {
  loading?: boolean
}

export function DataTable({ loading = false }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const deferredPage = useDeferredValue(currentPage)
  const isStale = currentPage !== deferredPage

  const itemsPerPage = 10
  const totalItems = fakeData.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (deferredPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
    return fakeData.slice(startIndex, endIndex)
  }

  const displayData = getCurrentPageItems()

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Convert to fixed format to avoid server/client mismatch
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }

  // Status badge style
  const getStatusBadgeClass = (status: TableData["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="w-full h-8 bg-accent animate-pulse rounded-md" />

        <div className="space-y-2">
          {Array.from({ length: itemsPerPage }, (_, index) => (
            <div key={index} className="w-full h-12 bg-accent animate-pulse rounded-md" />
          ))}
        </div>

        <div className="pt-4 flex justify-center">
          <SkeletonPagination />
        </div>
      </div>
    )
  }

  return (
    <div
      className="space-y-4"
      style={{
        opacity: isStale ? 0.7 : 1,
        transition: isStale ? 'opacity 0.2s linear' : 'opacity 0s linear'
      }}
    >
      <div className="bg-background/60 backdrop-blur-sm rounded-lg border">
        <Table>
          <TableCaption>A list of users and their information.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>{item.role}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </TableCell>
                <TableCell>{formatDate(item.joinDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center pt-4">
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          siblings={1}
        />
      </div>
    </div>
  )
}