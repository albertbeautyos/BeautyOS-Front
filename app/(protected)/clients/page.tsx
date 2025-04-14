"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet"; // Only need Sheet itself here
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { Client as TableClient, columns } from "./components/columns";
import { NewClientData, Client as ServiceClient } from '@/services/clients';
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";
// Import the extracted components
import { ClientSheetContent } from './components/ClientSheetContent';
import { ClientDeleteDialog } from './components/ClientDeleteDialog';


type SheetMode = 'add' | 'view' | 'edit' | null;

// Simulate fetching data - Replace this with your actual data fetching logic
async function getFakeClients(): Promise<TableClient[]> {
  // Updated Dummy Data matching the new Client type:
  return [
    {
      id: "CLI-001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      contact: "123-456-7890",
      // Added new fields
      visits: 25,
      rating: 4.5,
      points: 1250,
    },
    {
      id: "CLI-002",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@test.co",
      contact: "987-654-3210",
      visits: 12,
      rating: 4.8,
      points: 600,
    },
    {
      id: "CLI-003",
      first_name: "Peter",
      last_name: "Jones",
      email: "peter.jones@sample.net",
      contact: "555-123-4567",
      visits: 5,
      rating: 4.2,
      points: 250,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      visits: 30,
      rating: 5.0,
      points: 1500,
    }
  ];
}


// --- Main Page Component (Refactored) ---
export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<TableClient[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sheet state
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedClient, setSelectedClient] = useState<TableClient | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Delete confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<TableClient | null>(null);


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
      const data = await getFakeClients(); // Use the fake data function
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
  const handleOpenSheet = useCallback((mode: SheetMode, client: TableClient | null = null) => {
    console.log(`Opening sheet: mode=${mode}, client=`, client); // Debug log
    setSheetMode(mode);
    setSelectedClient(client);
    setIsSheetOpen(true);
  }, []);

  const handleChangeSheetMode = useCallback((mode: SheetMode, client: TableClient | null = selectedClient) => {
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
  const handleViewClient = useCallback((client: TableClient) => {
    handleOpenSheet('view', client);
  }, [handleOpenSheet]);

  const handleEditClient = useCallback((client: TableClient) => {
    handleOpenSheet('edit', client);
  }, [handleOpenSheet]);

  // Handler to initiate delete (used by both table row and sheet button)
  const handleDeleteRequest = useCallback((client: TableClient | null) => {
    if (!client) return;
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  }, []); // Dependency: none (uses setters)

  // --- Delete Confirmation Handler ---
  const confirmDelete = useCallback(async () => {
    if (!clientToDelete) return;
    console.log("Confirming delete for:", clientToDelete.id); // Keep log for debugging
    try {
      // --- ACTUAL DELETE API CALL (Placeholder) ---
      // await deleteClientService(clientToDelete.id); // Replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call delay
      toast.success("Client Deleted", { description: `${clientToDelete.first_name} ${clientToDelete.last_name} has been deleted.` });
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
    deleteClient: (client: TableClient) => handleDeleteRequest(client), // Pass client from row
  }), [handleViewClient, handleEditClient, handleDeleteRequest]);

  // --- Component Handlers passed to Children ---
  const handleAddClientSuccess = (newOrUpdatedClient: NewClientData | ServiceClient) => {
    console.log("Add/Update Success:", newOrUpdatedClient);
    // Refetch or update data
    loadData(); // Example: refetch all data
    // Decide whether to close the sheet or switch mode
    if (sheetMode === 'add') {
        handleCloseSheet(); // Close after adding
    } else if (sheetMode === 'edit') {
        handleChangeSheetMode('view', newOrUpdatedClient as TableClient); // Switch to view mode after editing
    }
  };

  const handleRequestDeleteFromSheet = useCallback(() => {
    handleDeleteRequest(selectedClient);
  }, [handleDeleteRequest, selectedClient]);

  return (
    <div className="space-y-4 sm:p-2 p-4"> {/* Added padding */}
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
