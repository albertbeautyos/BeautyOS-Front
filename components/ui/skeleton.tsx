import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonPagination({ className }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)} data-slot="skeleton-pagination">
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-8" />
      <Skeleton className="h-8 w-8" />
    </div>
  )
}

export { Skeleton, SkeletonPagination }
