"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { DataTable } from "@/components/data-table"
import { Button } from "@/components/ui/button"
import { Loader } from "lucide-react"

export function DataTableContent() {
  const [loading, setLoading] = useState(false)

  const toggleLoading = () => {
    setLoading(true)
    // Simulate loading for 1.5 seconds
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-lg font-semibold">Data Table</h1>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={toggleLoading}
              disabled={loading}
            >
              <Loader className="h-4 w-4" />
              Simulate Loading
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTable loading={loading} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}