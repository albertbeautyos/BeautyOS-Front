"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { DataTable, Client } from "@/components/data-table"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableContentProps {
  columns: ColumnDef<Client>[]
  data: Client[]
}

export function DataTableContent({ columns, data }: DataTableContentProps) {
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
            <h1 className="text-lg font-semibold">Clients</h1>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataTable columns={columns} data={data} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}