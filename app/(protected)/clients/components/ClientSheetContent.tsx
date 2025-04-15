"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddClientForm } from './add-client-form';
// Import Client directly from the service
import { Client, NewClientData } from '@/services/clients'; // Removed ServiceClient alias
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ClientSheetHeaderContent, type SheetMode } from './ClientSheetHeaderContent'; // Import the new component and SheetMode type
import { Loader2 } from "lucide-react";

// Interface for the main component props
interface ClientSheetContentProps {
    sheetMode: SheetMode;
    selectedClient: Client | null; // Use imported Client type
    onSuccess: (formData: NewClientData | Client) => void; // Use imported Client type
    onChangeMode: (mode: SheetMode, client?: Client | null) => void; // Use imported Client type
    onCloseSheet: () => void;
    onRequestDelete?: () => void; // Added prop for delete request from sheet
    isLoading?: boolean; // Add loading state
}

// Utility function to map Client data to form data structure
// Input should be the imported Client type
const mapClientToFormData = (client: Client | null): Partial<NewClientData> | undefined => {
    if (!client) return undefined;

    console.log("Mapping client data to form:", client);

    try {
        return {
            // Map basic client information
            firstName: client.firstName,
            lastName: client.lastName,
            phone: client.phone,
            email: client.email,
            // Include all optional fields
            gender: client.gender,
            pronouns: client.pronouns,
            referredBy: client.referredBy,
            clientType: client.clientType,
            // Handle date conversion
            birthday: client.birthday ? new Date(client.birthday) : undefined,
            // Map address information if available
            address: client.address ? {
                street: client.address.street,
                city: client.address.city,
                state: client.address.state,
                postalCode: client.address.postalCode,
                country: client.address.country,
                location: client.address.location
            } : undefined,
        };
    } catch (error) {
        console.error("Error mapping client data:", error);
        // Return basic data if mapping fails
        return {
            firstName: client.firstName || "",
            lastName: client.lastName || "",
            phone: client.phone || "",
            email: client.email || "",
        };
    }
};

// The Sheet Content Component
export const ClientSheetContent: React.FC<ClientSheetContentProps> = ({
    sheetMode,
    selectedClient,
    onSuccess,
    onChangeMode,
    onCloseSheet,
    onRequestDelete,
    isLoading
}) => {
    const [selectedSidebarTab, setSelectedSidebarTab] = useState<string>('DASH'); // Default sidebar tab
    const [selectedMobileTab, setSelectedMobileTab] = useState<string>('INFO'); // Default mobile tab for view/edit

    // Static Data Helper - Updated to match ClientSheetHeaderContent props
    const StaticClientViewData = useMemo(() => ({
        // Use properties available in selectedClient or static examples
        showRate: selectedClient?.showRate ?? 0,
        // avgVisit: selectedClient?.avgVisit ?? 0, // avgVisitWeeks is used in header, keep static example
        avgVisitValue: selectedClient?.avgVisitValue ?? 0,
        // Static/Example Data expected by header
        ratingCount: 84, // Example
        avgVisitWeeks: 4.5, // Example
        // Other static data used within this component
        tagsHair: ["Hair color", "Haircuts", "Haircuts"], // Example data
        tagsSalon: ["Salon 1", "Salon 2"], // Example data
        addressDisplay: "Address info TBD", // Placeholder - Address is not directly on Client now
    }), [selectedClient]);

    // Determines the title based on the current mode
    const getSheetTitle = () => {
        switch (sheetMode) {
            case 'add': return 'Add New Client';
            // Use correct property names
            case 'view': return selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : 'Client Details';
            case 'edit': return selectedClient ? `Editing ${selectedClient.firstName} ${selectedClient.lastName}` : 'Edit Client';
            default: return 'Client Information';
        }
    };

    // Handler for canceling - Switches back to view if editing, otherwise closes
    const handleCancelEdit = () => {
      if (sheetMode === 'edit' && selectedClient) {
        onChangeMode('view', selectedClient); // Use onChangeMode to switch back to view (type is now correct)
      } else {
        onCloseSheet(); // Close sheet if cancelling 'add' or if something unexpected happens
      }
    };

    // Dynamically determine the sheet title
    const sheetTitle = getSheetTitle();

    // Tab content for mobile view
    const renderMobileTabContent = () => {
        switch (selectedMobileTab) {
            case 'INFO':
                return (
                    <>
                        {sheetMode === 'view' && selectedClient && (
                            <div className="space-y-3 mb-3">
                                 {/* Use grid for mobile too: Tags left, Last Visited right */}
                                 <div className="grid grid-cols-2 gap-4"> {/* Increased gap slightly */}
                                    {/* Left Column: Tags */}
                                    <div>
                                        <Label className="text-xs font-semibold text-muted-foreground">Tags</Label>
                                        {/* Hair Tags */}
                                        <div className="flex flex-wrap gap-1 mt-1">{StaticClientViewData.tagsHair.map((tag, index) => (<Badge key={`hair-${index}`} variant="secondary" className="text-xs font-semibold px-2 py-0.5 leading-tight">{tag}</Badge>))}</div>
                                        {/* Salon Tags */}
                                        <div className="flex flex-wrap gap-1 mt-1">{StaticClientViewData.tagsSalon.map((tag, index) => (<Badge key={`salon-${index}`} variant="secondary" className="text-xs font-semibold px-2 py-0.5 leading-tight">{tag}</Badge>))}</div>
                                    </div>
                                    {/* Right Column: Last Visited */}
                                    <div>
                                        <Label className="text-xs font-semibold text-muted-foreground">Last Visited</Label>
                                        <p className="text-xs font-semibold mt-1">{StaticClientViewData.addressDisplay}</p>
                                    </div>
                                </div>
                               <Separator className="my-2"/>
                            </div>
                        )}
                        <AddClientForm
                            key={selectedClient?.id || 'mobile-view-edit-form'}
                            initialData={mapClientToFormData(selectedClient)}
                            isInitiallyEditing={sheetMode === 'edit'}
                            onSuccess={onSuccess}
                            onCancelEdit={handleCancelEdit}
                            onRequestDeleteFromForm={onRequestDelete}
                            className="mt-0"
                        />
                    </>
                );
            case 'DASH':
            case 'NOTES':
            case 'MESSAGES':
            case 'APPOINTMENTS':
            case 'PRODUCTS':
                return <p className="text-lg font-medium text-muted-foreground">{selectedMobileTab.charAt(0) + selectedMobileTab.slice(1).toLowerCase()} Content Area</p>;
            default:
                return null;
        }
    };

    return (
        <SheetContent className={cn(
            "w-full p-0 flex flex-col overflow-hidden",
            (sheetMode === 'view' || sheetMode === 'edit') ? "sm:max-w-4xl" : "sm:max-w-md"
        )}>
            {(sheetMode === 'view' || sheetMode === 'edit') && selectedClient ? (
                <>
                {/* Mobile View with Tabs */}
                <div className="flex flex-row w-full h-full sm:flex md:hidden">
                    <div className="flex flex-col w-full h-full">
                        {/* Use the reusable header component for mobile */}
                        <ClientSheetHeaderContent
                            selectedClient={selectedClient}
                            staticData={StaticClientViewData}
                            onChangeMode={onChangeMode}
                            onSetMobileTab={setSelectedMobileTab} // Pass mobile tab setter
                        />

                        <div className="p-4 border-b flex-shrink-0 overflow-x-auto">
                            <div className="flex space-x-6 min-w-max">
                                {['INFO', 'DASH', 'NOTES', 'MESSAGES', 'APPOINTMENTS', 'PRODUCTS'].map((tab) => (
                                    <button key={tab} onClick={() => setSelectedMobileTab(tab)} className={cn("uppercase text-xs font-semibold pb-1", selectedMobileTab === tab ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground/80")}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                                    <span>Loading client data...</span>
                                </div>
                            ) : (
                                renderMobileTabContent()
                            )}
                        </div>
                    </div>
                </div>
                {/* Desktop View */}
                <div className="hidden md:flex flex-row w-full h-full">
                    <div className="flex flex-col w-1/2 border-r overflow-hidden">
                        {/* Use the reusable header component for desktop */}
                        <ClientSheetHeaderContent
                            selectedClient={selectedClient}
                            staticData={StaticClientViewData}
                            onChangeMode={onChangeMode}
                            // Do not pass onSetMobileTab for desktop
                        />

                        <div className="flex-1 overflow-y-auto p-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                                    <span>Loading client data...</span>
                                </div>
                            ) : (
                                <>
                                    {sheetMode === 'view' && (
                                        <div className="space-y-3 mb-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-xs font-semibold text-muted-foreground">Tags</Label>
                                                    <div className="flex flex-wrap gap-1 mt-1">{StaticClientViewData.tagsHair.map((tag, index) => (<Badge key={`hair-${index}`} variant="secondary" className="text-xs font-semibold px-2 py-0.5 leading-tight">{tag}</Badge>))}</div>
                                                    <div className="flex flex-wrap gap-1 mt-1">{StaticClientViewData.tagsSalon.map((tag, index) => (<Badge key={`salon-${index}`} variant="secondary" className="text-xs font-semibold px-2 py-0.5 leading-tight">{tag}</Badge>))}</div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs font-semibold text-muted-foreground">Last Visited</Label>
                                                    <p className="text-xs font-semibold mt-1">{StaticClientViewData.addressDisplay}</p>
                                                </div>
                                            </div>
                                            <Separator className="my-2"/>
                                        </div>
                                    )}

                                    <AddClientForm
                                        key={selectedClient.id || 'view-edit-form'}
                                        initialData={mapClientToFormData(selectedClient)}
                                        isInitiallyEditing={sheetMode === 'edit'}
                                        onSuccess={onSuccess}
                                        onCancelEdit={handleCancelEdit}
                                        onRequestDeleteFromForm={onRequestDelete}
                                        className="mt-0"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-1/2 h-full">
                         <div className="p-4 border-b flex-shrink-0">
                            <div className="flex space-x-6">
                                {['DASH', 'NOTES', 'Messages', 'Appointments', "Products"].map((tab) => (
                                    <button key={tab} onClick={() => setSelectedSidebarTab(tab)} className={cn("uppercase text-xs font-semibold pb-1", selectedSidebarTab === tab ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground/80")}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                         </div>
                         <div className="flex-1 overflow-y-auto p-3 flex items-center justify-center">
                            <p className="text-lg font-medium text-muted-foreground">{selectedSidebarTab} Content Area</p>
                         </div>
                    </div>
                </div>
                </>
            ) : (
                <>
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                        <SheetDescription>Fill in the details below to add a new client.</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-3">
                        <AddClientForm
                            key={'add-form'}
                            initialData={undefined}
                            isInitiallyEditing={true}
                            onSuccess={onSuccess }
                            onCancelEdit={handleCancelEdit}
                            className="mt-4"
                        />
                    </div>
                </>
            )}
        </SheetContent>
    );
}