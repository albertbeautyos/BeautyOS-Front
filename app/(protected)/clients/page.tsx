"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback, useTransition, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet"; // Only need Sheet itself here
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { columns } from "./components/columns";
import { Client, getClients, NewClientData, getClientById, updateClient, deleteClient } from '@/services/clients';
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
// Import the extracted components
import { ClientSheetContent } from './components/ClientSheetContent';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'; // Import the generic dialog
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'; // Import the generic overlay
import { DataTablePagination } from '@/components/data-table-pagination'; // Import DataTablePagination
// Import TanStack Table hooks and types
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  type PaginationState, // Import PaginationState type
  // Add other necessary imports if needed later (e.g., sorting, filtering)
} from '@tanstack/react-table';

type SheetMode = 'add' | 'view' | 'edit' | null;

// --- Main Page Component (Refactored) ---
export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Removed old Pagination state ---
  // const [currentPage, setCurrentPage] = useState(0);
  // const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0); // Keep totalRecords for pageCount calculation

  // Debounce search with useRef and setTimeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Page/Sheet specific loading states
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Sheet state
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // --- TanStack Table State ---
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  // Add other state if needed (sorting, filters etc.)

  // --- Action Handlers (Define BEFORE useReactTable) ---
  // Moved handleViewClient, handleEditClient, handleDeleteRequest here
  const handleOpenSheet = useCallback((mode: SheetMode, client: Client | null = null) => {
    setSheetMode(mode);
    setSelectedClient(client);
    setIsSheetOpen(true);
  }, []); // Depends only on setters

  const handleViewClient = useCallback(async (client: Client) => {
    try {
      setIsPageLoading(true);
      const freshClientData = await getClientById(client.id);
      handleOpenSheet('view', freshClientData);
    } catch (error) {
      console.error(`Error fetching client with ID ${client.id}:`, error);
      toast.error("Error Loading Client", {
        description: error instanceof Error ? error.message : "Failed to load client details"
      });
      handleOpenSheet('view', client); // Fallback
    } finally {
      setIsPageLoading(false);
    }
  }, [handleOpenSheet]); // Depends on handleOpenSheet

  const handleEditClient = useCallback((client: Client) => {
    handleOpenSheet('edit', client);
  }, [handleOpenSheet]); // Depends on handleOpenSheet

  const handleDeleteRequest = useCallback((client: Client | null) => {
    if (!client) return;
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  }, []); // Depends only on setters

  // --- TanStack Table Instance ---
  const table = useReactTable<Client>({
    data: clientData ?? [], // Use fetched data
    columns,
    pageCount: Math.ceil(totalRecords / pageSize), // Calculate page count based on total records
    state: {
      pagination: { pageIndex, pageSize },
      // Add other states like sorting, columnFilters, visibility
    },
    onPaginationChange: setPagination, // Connect state setter
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Use pagination row model
    manualPagination: true, // Enable manual pagination as data is fetched server-side
    // Add manualSorting, manualFiltering if implementing server-side for those
    // Provide meta for actions
    meta: useMemo(() => ({
        viewClient: handleViewClient,
        editClient: handleEditClient,
        deleteClient: (client: Client) => handleDeleteRequest(client),
    }), [handleViewClient, handleEditClient, handleDeleteRequest]), // Keep meta dependencies
    debugTable: process.env.NODE_ENV === 'development', // Optional: Enable debug logs in dev
  });

  // --- Debounced Search Effect ---
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (searchTerm === "") {
      setDebouncedSearchTerm("");
      table.setPageIndex(0); // Reset page index via table instance
    } else {
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        table.setPageIndex(0); // Reset page index via table instance
      }, 500);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, table]); // Add table to dependencies

  // --- WORKAROUND for lingering pointer-events: none on body ---
  useEffect(() => {
    // Check both sheet and dialog state
    if (!isSheetOpen && !isDeleteDialogOpen) {
      const timer = setTimeout(() => {
          if (document.body.style.pointerEvents === 'none') {
              document.body.style.pointerEvents = 'auto'; // Reset pointer events
          }
      }, 100); // Delay might need adjustment
      return () => clearTimeout(timer);
    }
  }, [isSheetOpen, isDeleteDialogOpen]);
  // --- END WORKAROUND ---

  // --- Data Loading ---
  const loadData = useCallback(async (search?: string, page: number = pageIndex, size: number = pageSize) => {
    setIsLoading(true);
    setError(null);
    try {
      const skip = page * size;
      const response = await getClients(search, skip, size);
      setClientData(response.records);
      setTotalRecords(response.metadata.totalRecords);
    } catch (err) {
      console.error("Failed to load client data:", err);
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize]);

  // Load data when pagination or search term changes
  useEffect(() => {
    loadData(debouncedSearchTerm, pageIndex, pageSize);
  }, [loadData, debouncedSearchTerm, pageIndex, pageSize]);

  // --- Sheet Handlers (Only definitions not needed before table) ---
  const handleChangeSheetMode = useCallback((mode: SheetMode, client: Client | null = selectedClient) => {
    setSheetMode(mode);
    setSelectedClient(client);
  }, [selectedClient]);

  const handleCloseSheet = useCallback(() => {
    setIsSheetOpen(false);
  }, []);

  // --- Delete Confirmation Handler ---
  const confirmDelete = useCallback(async () => {
    if (!clientToDelete) return;
    console.log("Confirming delete for:", clientToDelete.id); // Keep log for debugging
    try {
      // Use the actual deleteClient service
      await deleteClient(clientToDelete.id);
      toast.success("Client Deleted", { description: `${clientToDelete.firstName} ${clientToDelete.lastName} has been deleted.` });
      // Reload data using current table state
      loadData(debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
      handleCloseSheet(); // Close the sheet after successful deletion
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Error Deleting Client", { description: error instanceof Error ? error.message : "An unexpected error occurred." });
    } finally {
      setIsDeleteDialogOpen(false); // Close dialog
      setClientToDelete(null); // Clear the client marked for deletion
    }
  }, [
    clientToDelete,
    debouncedSearchTerm,
    table,
    loadData,
    handleCloseSheet // Add handleCloseSheet to dependencies
  ]); // Dependencies

  const cancelDelete = useCallback(() => {
    setClientToDelete(null); // Clear client to delete
    setIsDeleteDialogOpen(false); // Close the dialog
  }, []);

  // --- Component Handlers passed to Children ---
  const handleAddClientSuccess = useCallback((newOrUpdatedClient: NewClientData | Client) => {

    // Check if the returned data has an ID, indicating an update or successful add
    if ('id' in newOrUpdatedClient) {
      // If we were editing, switch back to view mode with the updated client data
      if (sheetMode === 'edit') {
        handleChangeSheetMode('view', newOrUpdatedClient as Client);
        // Reload data using current table state
        loadData(debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
      } else if (sheetMode === 'add') {
        // If we were adding, refresh the list and close the sheet
        loadData(debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
        handleCloseSheet();
      }
    } else {
        // Fallback/Error case: Should not happen if form logic is correct
        console.error("handleAddClientSuccess called with unexpected data format:", newOrUpdatedClient);
        toast.error("An unexpected error occurred during the operation.");
        // Optionally refresh data anyway
        loadData(debouncedSearchTerm, table.getState().pagination.pageIndex, table.getState().pagination.pageSize);
    }
  }, [
    sheetMode,
    handleChangeSheetMode,
    handleCloseSheet,
    loadData,
    debouncedSearchTerm,
    table,
  ]);

  const handleRequestDeleteFromSheet = useCallback(() => {
    handleDeleteRequest(selectedClient);
  }, [handleDeleteRequest, selectedClient]);

  return (
    <div className="space-y-4 sm:p-2 p-4 relative"> {/* Added relative for absolute overlay positioning */}
      {/* Use the generic LoadingOverlay */}
      <LoadingOverlay
        isLoading={isPageLoading || isPending}
        message={isPending ? "Updating client information..." : "Loading client information..."}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="flex-1"></div> {/* Spacer */}
        <div className="relative w-full sm:max-w-sm">
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full" // Full width on small screens
          />
          {/* Search indicator */}
          {debouncedSearchTerm !== searchTerm && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Button onClick={() => handleOpenSheet('add')} className="w-full sm:w-auto"> {/* Full width on small screens */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 p-4 border border-red-600 bg-red-100 rounded-md">Error: {error}</div>}

      {/* Table Area */}
      <div className="rounded-md ">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTableContent columns={columns} table={table} />

            {/* Use DataTablePagination Component with the real table instance and totalRecords */}
            <div className="p-4">
              <DataTablePagination
                table={table}
                pageSizeOptions={[5, 10, 20, 50]}
                totalRecords={totalRecords}
              />
            </div>
          </>
        )}
      </div>

      {/* Client Sheet - Uses the extracted component */}
      <Sheet
        // Key only depends on the client ID or 'add' mode,
        // preventing remount when toggling view/edit for the same client.
        key={selectedClient?.id ?? 'add'}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
      >
        <ClientSheetContent
            sheetMode={sheetMode}
            selectedClient={selectedClient}
            onSuccess={handleAddClientSuccess}
            onChangeMode={handleChangeSheetMode}
            onCloseSheet={handleCloseSheet}
            onRequestDelete={handleRequestDeleteFromSheet}
            isLoading={false} // No longer needed since we use the page overlay
        />
      </Sheet>

      {/* Use the generic ConfirmationDialog */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Client"
        description="Are you sure you want to permanently delete this client? This action cannot be undone."
        itemName={clientToDelete ? `${clientToDelete.firstName} ${clientToDelete.lastName}` : undefined}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmButtonText="Delete"
        confirmButtonVariant="destructive" // Explicitly set variant
      />

      {/* Toaster */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
