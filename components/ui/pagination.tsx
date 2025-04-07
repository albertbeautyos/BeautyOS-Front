"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  siblings?: number
  showFirstAndLast?: boolean
}

function Pagination({
  totalPages,
  currentPage,
  onPageChange,
  siblings = 1,
  showFirstAndLast = true,
  className,
  ...props
}: PaginationProps) {
  // Calculate the range of pages to show
  const getPageNumbers = React.useCallback(() => {
    // Always show current page, siblings around it, and first/last pages
    const pages: (number | 'ellipsis')[] = []

    // Add first page
    if (showFirstAndLast || currentPage > 1 + siblings + 1) {
      pages.push(1)
    }

    // Add ellipsis if there's a gap after first page
    if (currentPage > siblings + 2) {
      pages.push('ellipsis')
    }

    // Add sibling pages and current page
    const start = Math.max(2, currentPage - siblings)
    const end = Math.min(totalPages - 1, currentPage + siblings)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) pages.push(i)
    }

    // Add ellipsis if there's a gap before last page
    if (currentPage < totalPages - siblings - 1) {
      pages.push('ellipsis')
    }

    // Add last page
    if (showFirstAndLast || currentPage < totalPages - siblings) {
      pages.push(totalPages)
    }

    return pages
  }, [currentPage, siblings, totalPages, showFirstAndLast])

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  return (
    <div
      data-slot="pagination"
      className={cn("flex items-center justify-center gap-1", className)}
      {...props}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getPageNumbers().map((page, index) => {
        if (page === 'ellipsis') {
          return (
            <div
              key={`ellipsis-${index}`}
              className="flex h-9 w-9 items-center justify-center"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </div>
          )
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(Number(page))}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export { Pagination }