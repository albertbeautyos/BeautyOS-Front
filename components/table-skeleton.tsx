import { SkeletonPagination } from "@/components/ui/skeleton"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function TableSkeleton() {
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
          <div className="ml-auto mr-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="space-y-4">
            <div className="w-full h-8 bg-accent animate-pulse rounded-md" />

            <div className="space-y-2">
              {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="w-full h-12 bg-accent animate-pulse rounded-md" />
              ))}
            </div>

            <div className="pt-4 flex justify-center">
              <SkeletonPagination />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}