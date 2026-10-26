"use client"

import * as React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChevronDown } from "lucide-react"

interface ServicesPaginationProps {
  currentPage: number
  setCurrentPage: (updater: number | ((p: number) => number)) => void
  pageSize: number
  setPageSize: (size: number) => void
  totalItems: number
  totalPages: number
}

function getPageNumbers(current: number, total: number) {
  if (total <= 6) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  if (current <= 3) {
    return [1, 2, 3, 4, "...", total]
  }
  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total]
  }
  return [1, "...", current - 1, current, current + 1, "...", total]
}

export function ServicesPagination({
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalItems,
  totalPages,
}: ServicesPaginationProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-b-xl border-t border-border/80 bg-card/40 px-1 py-3 sm:flex-row">
      {/* Left: Summary */}
      <div className="text-xs text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">
          {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-foreground">
          {Math.min(currentPage * pageSize, totalItems)}
        </span>{" "}
        of <span className="font-semibold text-foreground">{totalItems}</span> services
      </div>

      {/* Middle: Select dropdowns for Page Jump and Rows Per Page */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Rows per page select */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Rows:</span>
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="h-8 cursor-pointer rounded-lg border border-border bg-background py-1 pr-7 pl-2.5 text-xs font-medium text-foreground shadow-2xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <option value={10} className="bg-background text-foreground">
                10
              </option>
              <option value={15} className="bg-background text-foreground">
                15
              </option>
              <option value={25} className="bg-background text-foreground">
                25
              </option>
              <option value={50} className="bg-background text-foreground">
                50
              </option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-2.5 right-2 size-3 text-muted-foreground opacity-70" />
          </div>
        </div>

        {/* Direct Page Select Dropdown */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Page:</span>
            <div className="relative">
              <select
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="h-8 cursor-pointer rounded-lg border border-border bg-background py-1 pr-7 pl-2.5 text-xs font-semibold text-primary shadow-2xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p} className="bg-background text-foreground">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute top-2.5 right-2 size-3 text-muted-foreground opacity-70" />
            </div>
            <span>
              of <span className="font-semibold text-foreground">{totalPages}</span>
            </span>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Buttons */}
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>

            {getPageNumbers(currentPage, totalPages).map((p, idx) => (
              <PaginationItem key={idx}>
                {p === "..." ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    isActive={currentPage === p}
                    onClick={() => setCurrentPage(p as number)}
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-40" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
