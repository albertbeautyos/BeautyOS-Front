"use client"; // Make this a Client Component

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter, // Added for potential close button
  SheetClose, // Added for close button
} from "@/components/ui/sheet";
import { TableSkeleton } from "@/components/table-skeleton";
import { DataTableContent } from './data-table-content';
import { Client, columns } from "./components/columns";
import { getClients, NewClientData /*, deleteClient as deleteClientService */ } from '@/services/clients'; // Prepare for delete
import { AddClientForm } from './components/add-client-form';
import { Toaster } from "@/components/ui/sonner";
import { PlusCircle, Copy, Mail, Phone, Bell, MapPin, CheckCircle, DollarSign, Calendar as CalendarIconLucide, Instagram, Twitter, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Restore import
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label"; // Import Label

type SheetMode = 'add' | 'view' | 'edit' | null;

// Simulate fetching data - Replace this with your actual data fetching logic
async function getFakeClients(): Promise<Client[]> {
  console.log("Fetching client data...");
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

export default function DashboardClientsPage() {
  const [clientData, setClientData] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sheet state
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Delete confirmation state (keep state variables, but comment out usage)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // --- WORKAROUND for lingering pointer-events: none on body ---
  useEffect(() => {
    if (!isSheetOpen) {
      // Small delay to allow Radix UI cleanup to potentially finish first
      const timer = setTimeout(() => {
          if (document.body.style.pointerEvents === 'none') {
              console.log("Manually removing pointer-events: none from body");
              document.body.style.pointerEvents = 'auto'; // Or ''
          }
      }, 100); // Adjust delay if needed, 100ms is usually safe

      return () => clearTimeout(timer);
    }
  }, [isSheetOpen]);
  // --- END WORKAROUND ---

  // --- Data Loading ---
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFakeClients();
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
  const openSheet = (mode: SheetMode, client: Client | null = null) => {
    setSheetMode(mode);
    setSelectedClient(client);
    setIsSheetOpen(true);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      // Add a small delay before resetting state
      // This can sometimes help with focus/overlay cleanup timing issues
      setTimeout(() => {
        setSheetMode(null);
        setSelectedClient(null);
      }, 50); // 50ms delay
    }
  };

  const handleFormSuccess = (formData: NewClientData | Client) => {
    handleSheetOpenChange(false); // Close sheet on success
    loadData(); // Refresh the client list
    // `formData` contains the added or updated client data
  };

  // --- Table Action Handlers (passed via meta) ---
  const handleViewClient = useCallback((client: Client) => {
    openSheet('view', client);

  }, []); // Deps are stable state setters implicitly

  const handleEditClient = useCallback((client: Client) => {
    openSheet('edit', client);

  }, []); // Deps are stable state setters implicitly

  const handleDeleteClient = useCallback((client: Client) => {
    setClientToDelete(client);
    setIsDeleteDialogOpen(true); // <-- Uncomment this
    // console.warn("Delete requested for", client, "(Dialog disabled)");

  }, []);

  // --- Delete Confirmation Handler ---
  const confirmDelete = async () => {
    // console.log("Confirm delete called (Dialog disabled)");
    if (!clientToDelete) return;
    console.log("Confirming delete for:", clientToDelete.id);
    try {
      // --- ACTUAL DELETE API CALL --- (Placeholder)
      // await deleteClientService(clientToDelete.id);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
      toast.success("Client Deleted", { description: `${clientToDelete.first_name} ${clientToDelete.last_name} has been deleted.` });
      loadData(); // Refresh list after delete
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Error Deleting Client", { description: error instanceof Error ? error.message : "An unexpected error occurred." });
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  // Define meta object containing handlers
  const tableMeta = useMemo(() => ({
    viewClient: handleViewClient,
    editClient: handleEditClient,
    deleteClient: handleDeleteClient,
  }), [handleViewClient, handleEditClient, handleDeleteClient]); // Add stable handlers as deps

  // Determine sheet title based on mode
  const getSheetTitle = () => {
    switch (sheetMode) {
      case 'add': return "Add New Client";
      case 'view': return "View Client Details";
      case 'edit': return "Edit Client Details";
      default: return "";
    }
  }

  // Convert Client to Partial<NewClientData> for the form
  // This is needed because the form uses NewClientData structure,
  // and the Client type from GET might have different field names (e.g., first_name vs firstName)
  // or additional fields (like id, last_visit)
  const mapClientToFormData = (client: Client | null): Partial<NewClientData> | undefined => {
    if (!client) return undefined;
    return {
        firstName: client.first_name,
        lastName: client.last_name,
        // Ensure the contact field from Client maps to phone in NewClientData
        phone: client.contact,
        email: client.email,
        gender: client.gender,
        pronouns: client.pronouns,
        referredBy: client.referredBy,
        clientType: client.clientType,
        birthday: client.birthday, // Assuming birthday format is compatible or handled in form
        address: client.address ? { // Map address fields if they exist
            street: client.address.street,
            city: client.address.city,
            state: client.address.state,
            postalCode: client.address.postalCode,
            country: client.address.country,
        } : undefined,
        // Omit fields not in NewClientData like id, last_visit
    };
};

  // --- Static Data Helper for Image Lookalike ---
  const StaticClientViewData = {
      points: 12,
      visits: 126,
      rating: 4.9,
      ratingCount: 84,
      showRate: 100,
      avgVisitWeeks: 4.5,
      avgVisitValue: 284,
      lastVisited: "05/01/2024 3:02 PM",
      tagsHair: ["Hair color", "Haircuts", "Haircuts"], // Example data
      tagsSalon: ["Salon 1", "Salon 2"],
      social: [
          { platform: 'instagram', handle: 'albertmanukyan', value: '4,400', Icon: Instagram },
          { platform: 'tiktok', handle: 'albert_cit', value: '10,546', Icon: () => <svg>...</svg> }, // Placeholder for TikTok
          { platform: 'twitter', handle: 'albertoo', value: '437', Icon: Twitter },
      ],
      addressDisplay: "633 N Central, Glendale California", // Formatted address
  };
  // ---

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1"></div> {/* Spacer */}
        <Input
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="max-w-sm mr-4"
        />
        {/* Add Client Button - Now just opens the sheet in 'add' mode */}
        <Button onClick={() => openSheet('add')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 p-4 border border-red-600 bg-red-100 rounded-md">Error: {error}</div>}

      {/* Table Area */}
      {isLoading ? (
        <TableSkeleton />
      ) : (
        // Pass meta to DataTableContent
        <DataTableContent columns={columns} data={filteredData} meta={tableMeta} />
      )}

      {/* Combined Sheet for Add/View/Edit */}
      <Sheet
        key={`${sheetMode}-${selectedClient?.id || 'add'}`}
        open={isSheetOpen}
        onOpenChange={handleSheetOpenChange}
      >
        <SheetContent className="sm:max-w-md w-full p-0 overflow-y-auto flex flex-col">
          {/* --- STATIC HEADER FOR VIEW/EDIT (like image) --- */}
          {(sheetMode === 'view' || sheetMode === 'edit') && selectedClient && (
              <SheetHeader className="p-2.5 border-b bg-muted/30 space-y-2">
                  <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10 border">
                          <AvatarImage src={undefined} alt={`${selectedClient.first_name} ${selectedClient.last_name}`} />
                          <AvatarFallback className="text-base">{selectedClient.first_name?.[0]}{selectedClient.last_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                          <SheetTitle className="text-base font-semibold leading-tight">{selectedClient.first_name} {selectedClient.last_name}</SheetTitle>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                              <span>{StaticClientViewData.points} PTS</span>
                              <span className="mx-0.5">&bull;</span>
                              <span>{StaticClientViewData.visits} VST</span>
                              <span className="mx-0.5">&bull;</span>
                              <span className="flex items-center gap-0.5">
                                  <StarIcon className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                  {StaticClientViewData.rating}({StaticClientViewData.ratingCount})
                              </span>
                          </div>
                      </div>
                      <div className="flex justify-end gap-1 pr-8" >
                          {sheetMode === 'view' && (
                             <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => openSheet('edit', selectedClient)}>
                                 <Edit className="h-3.5 w-3.5" />
                                 <span className="sr-only">Edit</span>
                             </Button>
                          )}
                         <Button size="icon" variant="outline" className="h-6 w-6"><Mail className="h-3.5 w-3.5" /><span className="sr-only">Email</span></Button>
                         <Button size="icon" variant="outline" className="h-6 w-6"><Phone className="h-3.5 w-3.5" /><span className="sr-only">Call</span></Button>
                         <Button size="icon" variant="outline" className="h-6 w-6"><Bell className="h-3.5 w-3.5" /><span className="sr-only">Notifications</span></Button>
                     </div>
                  </div>

                   <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                       <div className="bg-background p-1 rounded border">
                           <p className="font-semibold text-[11px]">{StaticClientViewData.showRate}%</p>
                           <p className="text-muted-foreground leading-tight">Show Rate</p>
                       </div>
                       <div className="bg-background p-1 rounded border">
                           <p className="font-semibold text-[11px]">{StaticClientViewData.avgVisitWeeks} <span className="font-normal">Wks</span></p>
                           <p className="text-muted-foreground leading-tight">AVG Visit</p>
                       </div>
                       <div className="bg-background p-1 rounded border">
                            <p className="font-semibold text-[11px]">${StaticClientViewData.avgVisitValue}</p>
                           <p className="text-muted-foreground leading-tight">AVG Value</p>
                       </div>
                   </div>
              </SheetHeader>
          )}
          {/* --- END STATIC HEADER --- */}

          {/* Original Sheet Header (only for Add mode now) */}
          {sheetMode === 'add' && (
            <SheetHeader className="p-6 border-b">
                <SheetTitle>{getSheetTitle()}</SheetTitle>
                <SheetDescription>
                    Fill in the details below to add a new client.
                </SheetDescription>
            </SheetHeader>
          )}

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-3">
              {/* --- STATIC VIEW ELEMENTS (like image, shown in view/edit) --- */}
              {(sheetMode === 'view' || sheetMode === 'edit') && selectedClient && (
                  <div className="space-y-3 mb-3">
                       {/* Contact Info - smaller gap */}
                      <div className="grid grid-cols-2 gap-2">
                          <div>
                              <Label className="text-[10px] text-muted-foreground">Contact</Label>
                              <div className="flex items-center gap-1 mt-0">
                                  <p className="text-[11px] truncate">{selectedClient.email}</p>
                                  <Button variant="ghost" size="icon" className="h-4 w-4">
                                      <Copy className="h-2 w-2" />
                                  </Button>
                              </div>
                              <div className="flex items-center gap-1 mt-0">
                                  <p className="text-[11px]">{selectedClient.contact}</p>
                                  <Button variant="ghost" size="icon" className="h-4 w-4">
                                      <Copy className="h-2 w-2" />
                                  </Button>
                              </div>
                          </div>
                          <div>
                              <Label className="text-[10px] text-muted-foreground">Last Visited</Label>
                              <p className="text-[11px] mt-0">{StaticClientViewData.lastVisited}</p>
                          </div>
                      </div>

                      {/* Tags - Hair - tighter */}
                      <div>
                          <div className="flex flex-wrap gap-1 mt-1">
                              {StaticClientViewData.tagsHair.map((tag, index) => (
                                  <Badge key={`hair-${index}`} variant="secondary" className="font-normal text-[10px] px-1 py-0 leading-tight">
                                      {tag}
                                  </Badge>
                              ))}
                          </div>
                      </div>

                      {/* Tags - Salon - tighter */}
                      <div>
                          <div className="flex flex-wrap gap-1 mt-1">
                              {StaticClientViewData.tagsSalon.map((tag, index) => (
                                  <Badge key={`salon-${index}`} variant="secondary" className="font-normal text-[10px] px-1 py-0 leading-tight">
                                      {tag}
                                  </Badge>
                              ))}
                          </div>
                      </div>

                      <Separator className="my-2"/>


                  </div>
              )}
              {/* --- END STATIC VIEW ELEMENTS --- */}

            {/* --- RENDER THE FORM --- */}
            <AddClientForm
              key={selectedClient?.id || 'add'}
              initialData={mapClientToFormData(selectedClient)}
              isInitiallyEditing={sheetMode === 'edit' || sheetMode === 'add'}
              onSuccess={handleFormSuccess}
              onCancelEdit={() => openSheet('view', selectedClient)}
              className="mt-4"
            />
          </div>

        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the client
              <span className="font-semibold"> {clientToDelete?.first_name} {clientToDelete?.last_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setClientToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toaster */}
      <Toaster richColors />
    </div>
  );
}

// Helper Star Icon (replace with lucide if available and preferred)
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354l-4.597 2.927c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.007z" clipRule="evenodd" />
  </svg>
);
