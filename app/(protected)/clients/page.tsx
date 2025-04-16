"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback, useTransition } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet"; // Only need Sheet itself here
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import {  columns } from "./components/columns";
import { Client, getClients, NewClientData, Client as ServiceClient, getClientById, updateClient, deleteClient } from '@/services/clients';
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";
// Import the extracted components
import { ClientSheetContent } from './components/ClientSheetContent';
import { ClientDeleteDialog } from './components/ClientDeleteDialog';


type SheetMode = 'add' | 'view' | 'edit' | null;





// --- Main Page Component (Refactored) ---
export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getClients(); // Use the fake data function
      setClientData(data);
    } catch (err) {
      console.error("Failed to load client data:", err);
      setError(err instanceof Error ? err.message : "Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Filtering ---
  const filteredData = useMemo(() => {
    if (!searchTerm) return clientData;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return clientData.filter(client =>
      Object.values(client).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [clientData, searchTerm]);

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
      loadData(); // Refresh list after successful delete
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Error Deleting Client", { description: error instanceof Error ? error.message : "An unexpected error occurred." });
    } finally {
      setIsDeleteDialogOpen(false); // Close dialog
      setClientToDelete(null); // Clear the client marked for deletion
    }
  }, [clientToDelete, loadData]); // Dependencies

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
  const handleAddClientSuccess = useCallback((newOrUpdatedClient: NewClientData | ServiceClient) => {
    console.log("Add/Update Success:", newOrUpdatedClient);

    // If we're updating a client (not adding a new one)
    if (sheetMode === 'edit' && selectedClient) {
      setIsPageLoading(true);

      // Use startTransition to handle the client update
      startTransition(async () => {
        try {
          // Only attempt update if we have client ID
          if ('id' in newOrUpdatedClient) {
            // This is a full Client object, no need to update
            handleChangeSheetMode('view', newOrUpdatedClient as Client);
          } else if (selectedClient.id) {
            // This is NewClientData, we need to update and get the updated client
            const updatedClient = await updateClient(selectedClient.id, newOrUpdatedClient as NewClientData);
            handleChangeSheetMode('view', updatedClient);
          }
          toast.success("Client updated successfully");
        } catch (error) {
          console.error("Error updating client:", error);
          toast.error("Failed to update client", {
            description: error instanceof Error ? error.message : "An unexpected error occurred"
          });
          // Stay in edit mode if update failed
        } finally {
          setIsPageLoading(false);
        }
      });
    } else {
      // For adding new clients, just refresh the data
      loadData();
      // Close the sheet if we're adding a new client
      if (sheetMode === 'add') {
        handleCloseSheet();
      }
    }
  }, [sheetMode, selectedClient, handleChangeSheetMode, handleCloseSheet, loadData]);

  const handleRequestDeleteFromSheet = useCallback(() => {
    handleDeleteRequest(selectedClient);
  }, [handleDeleteRequest, selectedClient]);

  return (
    <div className="space-y-4 sm:p-2 p-4 relative"> {/* Added relative for absolute overlay positioning */}
      {/* Loading Overlay - displayed when viewing a client or updating */}
      {(isPageLoading || isPending) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
          <div className="bg-background rounded-lg p-6 flex flex-col items-center gap-3 shadow-lg border">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">
              {isPending ? "Updating client information..." : "Loading client information..."}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="flex-1"></div> {/* Spacer */}
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full sm:max-w-sm" // Full width on small screens
        />
        <Button onClick={() => handleOpenSheet('add')} className="w-full sm:w-auto"> {/* Full width on small screens */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 p-4 border border-red-600 bg-red-100 rounded-md">Error: {error}</div>}

      {/* Table Area - Remove border here */}
      <div> {/* Removed rounded-md border */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTableContent columns={columns} data={filteredData} meta={tableMeta} />
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

      {/* Delete Confirmation Dialog - Uses the extracted component */}
      <ClientDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        clientToDelete={clientToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Toaster */}
      <Toaster richColors position="top-right" />
    </div>
  );
}
