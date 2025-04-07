"use client"

import * as React from "react"
import { Suspense, useState, useDeferredValue } from "react"

import { Pagination } from "@/components/ui/pagination"
import { SkeletonPagination } from "@/components/ui/skeleton"

interface PaginationExampleProps {
  totalItems?: number
  itemsPerPage?: number
  initialPage?: number
  loading?: boolean
}

export function PaginationExample({
  totalItems = 100,
  itemsPerPage = 10,
  initialPage = 1,
  loading = false
}: PaginationExampleProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const deferredPage = useDeferredValue(currentPage)
  const isStale = currentPage !== deferredPage

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // Get items for current page
  const getCurrentPageItems = () => {
    // Simulate loading delay
    if (loading) return []

    const startIndex = (deferredPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

    // Create dummy items (in a real app, this would be your actual data)
    return Array.from({ length: endIndex - startIndex }, (_, index) => ({
      id: startIndex + index + 1,
      name: `Item ${startIndex + index + 1}`
    }))
  }

  const items = getCurrentPageItems()

  return (
    <div className="space-y-6">
      {/* Content area */}
      <div
        className="space-y-2"
        style={{ opacity: isStale ? 0.5 : 1, transition: isStale ? 'opacity 0.2s linear' : 'opacity 0s linear' }}
      >
        {loading ? (
          // Skeleton loading state for content
          <>
            {Array.from({ length: itemsPerPage }, (_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12">
                  <div className="w-full h-full rounded-md bg-accent animate-pulse" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-3/4 bg-accent animate-pulse rounded-md" />
                  <div className="h-3 w-1/2 bg-accent animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </>
        ) : (
          // Actual content
          <>
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-2 rounded-md border">
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-muted">
                  {item.id}
                </div>
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Item description goes here
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination controls */}
      <div className="pt-4">
        <Suspense fallback={<SkeletonPagination />}>
          {loading ? (
            <SkeletonPagination />
          ) : (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              siblings={1}
            />
          )}
        </Suspense>
      </div>
    </div>
  )
}