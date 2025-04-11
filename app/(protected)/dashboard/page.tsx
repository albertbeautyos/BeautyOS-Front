"use client"; // Make it a Client Component

import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export default function Page() {
  // Removed isLoading state and useEffect

  // Always render Skeleton UI for two charts
  return (
    <div >
      <TableSkeleton />
    </div>
  );
}
