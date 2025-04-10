"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet"; // Only need Sheet itself here
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { Client, columns } from "./components/columns";
import { NewClientData } from '@/services/clients';
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle } from 'lucide-react';
import { toast } from "sonner";
// Import the extracted components
import { ClientSheetContent } from './components/ClientSheetContent';
import { ClientDeleteDialog } from './components/ClientDeleteDialog';


type SheetMode = 'add' | 'view' | 'edit' | null;

// Simulate fetching data - Replace this with your actual data fetching logic
async function getFakeClients(): Promise<Client[]> {
  // Reduced Dummy Data matching the Client type:
  return [
    {
      id: "CLI-001",
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      contact: "123-456-7890",
      last_visit: "2024-07-15",
    },
    {
      id: "CLI-002",
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@test.co",
      contact: "987-654-3210",
      last_visit: "2024-07-10",
    },
    {
      id: "CLI-003",
      first_name: "Peter",
      last_name: "Jones",
      email: "peter.jones@sample.net",
      contact: "555-123-4567",
      last_visit: "2024-06-20",
    },
    {
      id: "CLI-004",
      first_name: "Alice",
      last_name: "Brown",
      email: "alice.b@mail.org",
      contact: "111-222-3333",
      last_visit: "2024-07-18",
    }
  ];
}


// --- Main Page Component (Refactored) ---
export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  const openSheet = useCallback((mode: SheetMode, client: Client | null = null) => {
    setSheetMode(mode);
    setSelectedClient(client);
    setIsSheetOpen(true);
  }, []); // Dependencies are stable setters

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      // Delay resetting state slightly for smoother closing animation/cleanup
      setTimeout(() => {
        setSheetMode(null);
        setSelectedClient(null);
      }, 50);
    }
  }, []);

  const handleFormSuccess = useCallback((formData: NewClientData | Client) => {
    handleSheetOpenChange(false); // Close sheet on success
    loadData(); // Refresh the client list
    toast.success(sheetMode === 'add' ? "Client Added" : "Client Updated");
  }, [handleSheetOpenChange, loadData, sheetMode]); // Include sheetMode dependency

  // --- Table Action Handlers (passed via meta) ---
  const handleViewClient = useCallback((client: Client) => {
    openSheet('view', client);
  }, [openSheet]);

  const handleEditClient = useCallback((client: Client) => {
    openSheet('edit', client);
  }, [openSheet]);

  const handleDeleteRequest = useCallback((client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  }, []);

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

  // Define meta object containing handlers for the table rows
  const tableMeta = useMemo(() => ({
    viewClient: handleViewClient,
    editClient: handleEditClient,
    deleteClient: handleDeleteRequest, // Use the request handler
  }), [handleViewClient, handleEditClient, handleDeleteRequest]); // Stable handlers as dependencies

  return (
    <div className="space-y-4 p-4 md:p-6"> {/* Added padding */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-4">
        <div className="flex-1"></div> {/* Spacer */}
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full sm:max-w-sm" // Full width on small screens
        />
        <Button onClick={() => openSheet('add')} className="w-full sm:w-auto"> {/* Full width on small screens */}
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 p-4 border border-red-600 bg-red-100 rounded-md">Error: {error}</div>}

      {/* Table Area */}
      <div className="rounded-md border"> {/* Added border around table */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <DataTableContent columns={columns} data={filteredData} meta={tableMeta} />
        )}
      </div>

      {/* Client Sheet - Uses the extracted component */}
      <Sheet
        // Key ensures component re-mounts when mode/client changes, resetting internal state
        key={`${sheetMode}-${selectedClient?.id ?? 'add'}-sheet`}
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
      >
        <ClientSheetContent
            sheetMode={sheetMode}
            selectedClient={selectedClient}
            onSuccess={handleFormSuccess}
            onOpenSheet={openSheet} // Pass openSheet for navigation within the sheet
            onCloseSheet={() => handleSheetOpenChange(false)} // Pass simple close handler
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
