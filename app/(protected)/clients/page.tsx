"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback, useTransition, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet"; // Only need Sheet itself here
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { columns } from "./components/columns";
import { Client, getClients, NewClientData, Client as ServiceClient, getClientById, updateClient, deleteClient } from '@/services/clients';
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
// Import the extracted components
import { ClientSheetContent } from './components/ClientSheetContent';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'; // Import the generic dialog
import { LoadingOverlay } from '@/components/shared/LoadingOverlay'; // Import the generic overlay

type SheetMode = 'add' | 'view' | 'edit' | null;

// --- Main Page Component (Refactored) ---
export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for internal calculations
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Debounce search with useRef and setTimeout
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  // Add a page loading state for view action
  const [isPageLoading, setIsPageLoading] = useState(false);
  // Add isPending and startTransition for client updates
  const [isPending, startTransition] = useTransition();

  // Sheet state
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Setup debounced search term
  useEffect(() => {
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm === "") {
      // If search is cleared, update immediately without debounce
      setDebouncedSearchTerm("");
      setCurrentPage(0); // Reset to first page
    } else {
      // Otherwise, set a timeout to update after debounce delay
      searchTimeoutRef.current = setTimeout(() => {
        setDebouncedSearchTerm(searchTerm);
        setCurrentPage(0); // Reset to first page when search term changes
      }, 500); // 500ms debounce delay
    }

    // Cleanup on unmount or when searchTerm changes again before timeout
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

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
  const loadData = useCallback(async (search?: string, page: number = 0, size: number = pageSize) => {
    setIsLoading(true);
    setError(null);
    try {
      // Calculate skip value based on page and page size
      const skip = page * size;

      // Use the updated getClients function with pagination
      const response = await getClients(search, skip, size);

      // Set client data and pagination metadata
      setClientData(response.records);
      setTotalRecords(response.metadata.totalRecords);
    } catch (err) {
      console.error("Failed to load client data:", err);
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  // Load data when pagination parameters change or search term changes
  useEffect(() => {
    // Load data with the current pagination parameters and search term
    loadData(debouncedSearchTerm, currentPage, pageSize);
  }, [debouncedSearchTerm, currentPage, pageSize, loadData]);

  // Calculate total pages
  const totalPages = useMemo(() => Math.ceil(totalRecords / pageSize), [totalRecords, pageSize]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0); // Reset to first page when changing page size
  }, []);

  // --- Filtering Removed (Server-side search) ---
  const filteredData = clientData; // Use directly since filtering is done server-side

  // --- Sheet Handlers ---
  const handleOpenSheet = useCallback((mode: SheetMode, client: Client | null = null) => {
    console.log(`Opening sheet: mode=${mode}, client=`, client); // Debug log
    setSheetMode(mode);
    setSelectedClient(client);
    setIsSheetOpen(true);
  }, []);

  const handleChangeSheetMode = useCallback((mode: SheetMode, client: Client | null = selectedClient) => {
    console.log(`Changing sheet mode: mode=${mode}, client=`, client); // Debug log
    // Only change mode and potentially the client, don't affect isSheetOpen
    setSheetMode(mode);
    setSelectedClient(client); // Update client if provided (e.g., needed for cancel->view)
  }, [selectedClient]);

  const handleCloseSheet = useCallback(() => {
    console.log("Closing sheet"); // Debug log
    setIsSheetOpen(false);
    // Optionally reset mode and client after a short delay to allow animation
    // setTimeout(() => {
    //   setSheetMode(null);
    //   setSelectedClient(null);
    // }, 150); // Adjust delay as needed
  }, []);

  // --- Table Action Handlers (passed via meta) ---
  const handleViewClient = useCallback(async (client: Client) => {
    try {
      // Show the page overlay loader instead of table loader
      setIsPageLoading(true);
      console.log(`Fetching client data for ID: ${client.id}`);

      const freshClientData = await getClientById(client.id);
      console.log("Fetched client data:", freshClientData);
      handleOpenSheet('view', freshClientData);
    } catch (error) {
      console.error(`Error fetching client with ID ${client.id}:`, error);
      toast.error("Error Loading Client", {
        description: error instanceof Error ? error.message : "Failed to load client details"
      });
      // Fall back to using the data from the table if fetch fails
      handleOpenSheet('view', client);
    } finally {
      setIsPageLoading(false);
    }
  }, [handleOpenSheet]);

  const handleEditClient = useCallback((client: Client) => {
    handleOpenSheet('edit', client);
  }, [handleOpenSheet]);

  // Handler to initiate delete (used by both table row and sheet button)
  const handleDeleteRequest = useCallback((client: Client | null) => {
    if (!client) return;
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  }, []); // Dependency: none (uses setters)

  // --- Delete Confirmation Handler ---
  const confirmDelete = useCallback(async () => {
    if (!clientToDelete) return;
    console.log("Confirming delete for:", clientToDelete.id); // Keep log for debugging
    try {
      // Use the actual deleteClient service
      await deleteClient(clientToDelete.id);
      toast.success("Client Deleted", { description: `${clientToDelete.firstName} ${clientToDelete.lastName} has been deleted.` });
      loadData(debouncedSearchTerm, currentPage, pageSize); // Refresh list after successful delete with current pagination
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
    currentPage,
    pageSize,
    loadData,
    handleCloseSheet // Add handleCloseSheet to dependencies
  ]); // Dependencies

  const cancelDelete = useCallback(() => {
    setClientToDelete(null); // Clear client to delete
    setIsDeleteDialogOpen(false); // Close the dialog
  }, []);

  // Define table meta (remains the same, uses handleDeleteRequest with row.original)
  const tableMeta = useMemo(() => ({
    viewClient: handleViewClient,
    editClient: handleEditClient,
    deleteClient: (client: Client) => handleDeleteRequest(client), // Use imported Client type
  }), [handleViewClient, handleEditClient, handleDeleteRequest]);

  // --- Component Handlers passed to Children ---
  const handleAddClientSuccess = useCallback((newOrUpdatedClient: NewClientData | Client) => {

    // Check if the returned data has an ID, indicating an update or successful add
    if ('id' in newOrUpdatedClient) {
      // If we were editing, switch back to view mode with the updated client data
      if (sheetMode === 'edit') {
        handleChangeSheetMode('view', newOrUpdatedClient as Client);
        // Reload data after successful update
        loadData(debouncedSearchTerm, currentPage, pageSize);
      } else if (sheetMode === 'add') {
        // If we were adding, refresh the list and close the sheet
        loadData(debouncedSearchTerm, currentPage, pageSize);
        handleCloseSheet();
      }
    } else {
        // Fallback/Error case: Should not happen if form logic is correct
        console.error("handleAddClientSuccess called with unexpected data format:", newOrUpdatedClient);
        toast.error("An unexpected error occurred during the operation.");
        // Optionally refresh data anyway
        loadData(debouncedSearchTerm, currentPage, pageSize);
    }
  }, [
    sheetMode,
    handleChangeSheetMode,
    handleCloseSheet,
    loadData,
    debouncedSearchTerm,
    currentPage,
    pageSize,
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
      <div className="rounded-md border">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <>
            <DataTableContent columns={columns} data={filteredData} meta={tableMeta} />

            {/* Custom Pagination Controls */}
            <div className="flex items-center justify-between p-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage + 1} of {totalPages || 1}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({totalRecords} total)
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  className="h-8 w-20 rounded-md border border-input bg-background text-sm"
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Last
                </Button>
              </div>
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
