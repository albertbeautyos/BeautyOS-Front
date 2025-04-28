"use client"

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
    fetchCurrentUserThunk,
    selectIsAuthenticated,
    selectInitialCheckComplete,
    selectAuthLoading,
} from '@/store/slices/authSlice';
import { Loader2 } from 'lucide-react'; // Example loading icon
import { PUBLIC_ROUTES } from '@/constants';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Get auth state from Redux
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initialCheckComplete = useSelector(selectInitialCheckComplete);
  const loading = useSelector(selectAuthLoading);

  const pageTitle = useMemo(() => {
    const parts = pathname.split('/').filter(part => part !== '');
    if (parts.length > 0 && parts[0]) {
       const firstSegment = parts[0];
       return firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1);
    }
    return 'Dashboard'; // Default title if no segment found
  }, [pathname]);

  // Effect to check authentication status on initial load
  useEffect(() => {
    if (!initialCheckComplete) {
        console.log("ProtectedLayout: Initial check not complete, dispatching fetchCurrentUserThunk...");
        dispatch(fetchCurrentUserThunk());
    }
  }, [dispatch, initialCheckComplete]);

  // Effect to handle redirection if not authenticated after check
  useEffect(() => {
    console.log(`ProtectedLayout: Auth state change check - initialCheckComplete: ${initialCheckComplete}, loading: ${loading}, isAuthenticated: ${isAuthenticated}`);
    // Only redirect if the check is complete, loading is idle, and user is not authenticated.
    if (initialCheckComplete && loading === 'idle' && !isAuthenticated) {
        console.log("ProtectedLayout: Redirecting to /login...");
        router.replace(PUBLIC_ROUTES.LOGIN);
    }
  }, [isAuthenticated, initialCheckComplete, loading, router]);

  // Show loading state while the initial check is running
  if (!initialCheckComplete || loading === 'pending') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  // If check is complete but user is not authenticated, render null
  // while the redirect effect takes place to avoid flashing protected content.
  if (!isAuthenticated) {
      return null;
  }

  // Render the protected layout if authenticated
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
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <div className="ml-auto mr-4 flex items-center gap-2">
            <ThemeToggle />
            {/* Add User Profile/Logout Button Here */}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 sm:p-4 p-2 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}