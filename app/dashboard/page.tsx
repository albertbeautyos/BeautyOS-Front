import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Image from 'next/image';
import beautyosLogo from '@/public/assets/beautyos.png';

export default function Page() {
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

          </div>
          <ThemeToggle />
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-4 pt-0">
          <Image src={beautyosLogo} alt="BeatyOS Logo" width={150} height={150} className="mb-4" />
          <h1 className="text-4xl font-bold">Welcome to BeautyOS</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
