"use client"; // Make it a Client Component

import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

export default function Page() {
  // Removed isLoading state and useEffect

  // Always render Skeleton UI for two charts
  return (
    <div className="flex flex-1 flex-col md:flex-row items-center justify-center gap-8 p-4 pt-0">
      {/* Skeleton for Chart 1 */}
      <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div>
      {/* Skeleton for Chart 2 */}
      <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div> <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div>
      {/* Skeleton for Chart 2 */}
      <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div> <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div>
      {/* Skeleton for Chart 2 */}
      <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div> <div className="w-full md:w-1/2 h-64 flex flex-col items-center justify-center border rounded-lg p-4">
         <Skeleton className="h-8 w-1/2 mb-4" /> {/* Chart Title Skeleton */}
         <Skeleton className="h-full w-full" /> {/* Chart Area Skeleton */}
      </div>
      {/* Skeleton for Chart 2 */}
    </div>
  );
}
