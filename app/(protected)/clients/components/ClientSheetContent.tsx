"use client";

import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddClientForm } from './add-client-form';
// Import Client from columns with an alias
import { Client as TableClient } from "./columns";
// Import types from the service
import { NewClientData, Client as ServiceClient } from '@/services/clients';
import { Copy, Mail, Phone, Bell, Instagram, Twitter, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StarIcon } from './StarIcon'; // Import StarIcon from its file

type SheetMode = 'add' | 'view' | 'edit' | null;

// Interface for the component props
interface ClientSheetContentProps {
    sheetMode: SheetMode;
    selectedClient: TableClient | null; // Use TableClient alias
    onSuccess: (formData: NewClientData | ServiceClient) => void; // Use ServiceClient and NewClientData
    onOpenSheet: (mode: SheetMode, client: TableClient | null) => void; // Use TableClient alias
    onCloseSheet: () => void;
    onRequestDelete?: () => void; // Added prop for delete request from sheet
}

// Utility function to map Client data to form data structure
// Input should be TableClient from the table data
const mapClientToFormData = (client: TableClient | null): Partial<NewClientData> | undefined => {
    if (!client) return undefined;
    return {
        firstName: client.first_name,
        lastName: client.last_name,
        phone: client.contact,
        email: client.email,
        gender: client.gender,
        pronouns: client.pronouns,
        referredBy: client.referredBy,
        clientType: client.clientType,
        birthday: client.birthday,
        address: client.address ? {
            street: client.address.street,
            city: client.address.city,
            state: client.address.state,
            postalCode: client.address.postalCode,
            country: client.address.country,
        } : undefined,
    };
};

// The Sheet Content Component
export const ClientSheetContent: React.FC<ClientSheetContentProps> = ({
    sheetMode,
    selectedClient,
    onSuccess,
    onOpenSheet,
    onCloseSheet,
    onRequestDelete
}) => {
    const [selectedSidebarTab, setSelectedSidebarTab] = useState<string>('DASH'); // Default sidebar tab

    // Static Data Helper - Remains here as it uses selectedClient (TableClient)
    const StaticClientViewData = useMemo(() => ({
        points: selectedClient?.points ?? 0,
        visits: selectedClient?.visits ?? 0,
        rating: selectedClient?.rating ?? 0,
        ratingCount: 84,
        showRate: 100,
        avgVisitWeeks: 4.5,
        avgVisitValue: 284,
        lastVisited: selectedClient?.last_visit ? new Date(selectedClient.last_visit).toLocaleString() : "N/A",
        tagsHair: ["Hair color", "Haircuts", "Haircuts"], // Example data
        tagsSalon: ["Salon 1", "Salon 2"], // Example data
        social: [
            { platform: 'instagram', handle: 'albertmanukyan', value: '4,400', Icon: Instagram },
            { platform: 'tiktok', handle: 'albert_cit', value: '10,546', Icon: () => <svg>...</svg> }, // Placeholder icon
            { platform: 'twitter', handle: 'albertoo', value: '437', Icon: Twitter },
        ],
        addressDisplay: selectedClient?.address
            ? `${selectedClient.address.street || ''}, ${selectedClient.address.city || ''} ${selectedClient.address.state || ''}`.trim().replace(/, $/, '')
            : "No Address",
    }), [selectedClient]);

    // Determines the title based on the current mode
    const getSheetTitle = () => {
        switch (sheetMode) {
            case 'add': return 'Add New Client';
            case 'view': return selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : 'Client Details';
            case 'edit': return selectedClient ? `Editing ${selectedClient.first_name} ${selectedClient.last_name}` : 'Edit Client';
            default: return 'Client Information';
        }
    };

    // Handler for canceling - Switches back to view if editing, otherwise closes
    const handleCancelEdit = () => {
      if (sheetMode === 'edit' || sheetMode === 'view' && selectedClient) {
        onOpenSheet('view', selectedClient); // Switch back to view mode
      } else {
        onCloseSheet(); // Close sheet if cancelling 'add' or if something unexpected happens
      }
    };

    // Dynamically determine the sheet title
    const sheetTitle = getSheetTitle();

    return (
        <SheetContent className={cn(
            "w-full p-0 flex flex-col overflow-hidden",
            (sheetMode === 'view' || sheetMode === 'edit') ? "sm:max-w-4xl" : "sm:max-w-md"
        )}>
            {(sheetMode === 'view' || sheetMode === 'edit') && selectedClient ? (
                <div className="flex flex-row w-full h-full">
                    <div className="flex flex-col w-1/2 border-r overflow-hidden">
                        <SheetHeader className="p-2.5 border-b bg-muted/30 space-y-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={undefined} alt={`${selectedClient.first_name} ${selectedClient.last_name}`} />
                                    <AvatarFallback className="text-base">{selectedClient.first_name?.[0]}{selectedClient.last_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <SheetTitle className="text-base font-semibold leading-tight">{selectedClient.first_name} {selectedClient.last_name}</SheetTitle>
                                    {/* Static Stats Badges */}
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                        <span>{StaticClientViewData.points} PTS</span><span className="mx-0.5">&bull;</span>
                                        <span>{StaticClientViewData.visits} VST</span><span className="mx-0.5">&bull;</span>
                                        <span className="flex items-center gap-0.5"><StarIcon className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{StaticClientViewData.rating}({StaticClientViewData.ratingCount})</span>
                                    </div>
                                </div>
                                {/* Action Buttons - Delete Button Removed */}
                                <div className="flex justify-end gap-1 pr-8" >
                                    {sheetMode === 'view' && (
                                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => onOpenSheet('edit', selectedClient)}>
                                            <Edit className="h-3.5 w-3.5" /><span className="sr-only">Edit</span>
                                        </Button>
                                    )}
                                    <Button size="icon" variant="outline" className="h-6 w-6"><Mail className="h-3.5 w-3.5" /><span className="sr-only">Email</span></Button>
                                    <Button size="icon" variant="outline" className="h-6 w-6"><Phone className="h-3.5 w-3.5" /><span className="sr-only">Call</span></Button>
                                    <Button size="icon" variant="outline" className="h-6 w-6"><Bell className="h-3.5 w-3.5" /><span className="sr-only">Notifications</span></Button>
                                     {/* --- Delete Button Removed From Header --- */}
                                </div>
                            </div>
                            {/* Static Stats Grid */}
                            <div className="grid grid-cols-3 gap-1 text-center text-[10px]">
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-[11px]">{StaticClientViewData.showRate}%</p><p className="text-muted-foreground leading-tight">Show Rate</p></div>
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-[11px]">{StaticClientViewData.avgVisitWeeks} <span className="font-normal">Wks</span></p><p className="text-muted-foreground leading-tight">AVG Visit</p></div>
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-[11px]">${StaticClientViewData.avgVisitValue}</p><p className="text-muted-foreground leading-tight">AVG Value</p></div>
                            </div>
                        </SheetHeader>

                        {/* Scrollable Content Area */}
                        <div className="flex-1 overflow-y-auto p-3">
                            {/* Static View Elements Displayed Above the Form (Only in View Mode) */}
                            {sheetMode === 'view' && (
                                <div className="space-y-3 mb-3">
                                    {/* Contact Info */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">Contact</Label>
                                            <div className="flex items-center gap-1 mt-0"><p className="text-[11px] truncate">{selectedClient.email}</p><Button variant="ghost" size="icon" className="h-4 w-4"><Copy className="h-2 w-2" /></Button></div>
                                            <div className="flex items-center gap-1 mt-0"><p className="text-[11px]">{selectedClient.contact}</p><Button variant="ghost" size="icon" className="h-4 w-4"><Copy className="h-2 w-2" /></Button></div>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-muted-foreground">Last Visited</Label>
                                            <p className="text-[11px] mt-0">{StaticClientViewData.lastVisited}</p>
                                        </div>
                                    </div>
                                    {/* Hair Tags */}
                                    <div><div className="flex flex-wrap gap-1 mt-1">{StaticClientViewData.tagsHair.map((tag, index) => (<Badge key={`hair-${index}`} variant="secondary" className="font-normal text-[10px] px-1 py-0 leading-tight">{tag}</Badge>))}</div></div>
                                    {/* Salon Tags */}
                                    <div><div className="flex flex-wrap gap-1 mt-1">{StaticClientViewData.tagsSalon.map((tag, index) => (<Badge key={`salon-${index}`} variant="secondary" className="font-normal text-[10px] px-1 py-0 leading-tight">{tag}</Badge>))}</div></div>
                                    <Separator className="my-2"/>
                                </div>
                            )}

                            {/* Delete Button - Now visible in view mode as well, if onRequestDelete is provided */}
                            {(sheetMode === 'view' || sheetMode === 'edit') && onRequestDelete && (
                                <div className="mb-4 flex justify-end"> {/* Wrapper for positioning */}
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={onRequestDelete}
                                        // Optionally disable if not in edit mode, depending on desired UX
                                        // disabled={sheetMode !== 'edit'}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}

                            {/* The Client Form */}
                            <AddClientForm
                                key={selectedClient.id || 'view-edit-form'}
                                initialData={mapClientToFormData(selectedClient)}
                                isInitiallyEditing={sheetMode === 'edit'}
                                onSuccess={onSuccess} // Propagate success callback
                                onCancelEdit={handleCancelEdit} // Propagate cancel callback
                                className="mt-0"
                            />
                        </div>
                    </div>

                    {/* Right Column: Sidebar/Tabs */}
                    <div className="flex flex-col w-1/2 h-full">
                         {/* Tab Navigation */}
                         <div className="p-4 border-b flex-shrink-0">
                            <div className="flex space-x-6">
                                {['DASH', 'NOTES', 'Messages', 'Appointments', "Products"].map((tab) => (
                                    <button key={tab} onClick={() => setSelectedSidebarTab(tab)} className={cn("uppercase text-xs font-semibold pb-1", selectedSidebarTab === tab ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground/80")}>
                                        {tab}
                                    </button>
                                ))}
                            </div>
                         </div>
                         {/* Tab Content Area */}
                         <div className="flex-1 overflow-y-auto p-3 flex items-center justify-center">
                            {/* Placeholder content - Replace with actual tab content components */}
                            <p className="text-lg font-medium text-muted-foreground">{selectedSidebarTab} Content Area</p>
                         </div>
                    </div>
                </div>
            ) : (
                // --- Single Column Layout (Add Mode) ---
                <>
                    {/* Header for Add Mode */}
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                        <SheetDescription>Fill in the details below to add a new client.</SheetDescription>
                    </SheetHeader>
                    {/* Form Area */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <AddClientForm
                            key={'add-form'} // Unique key for the add form instance
                            initialData={undefined} // No initial data for add mode
                            isInitiallyEditing={true} // Always editing in add mode
                            onSuccess={onSuccess } // Propagate success callback
                            onCancelEdit={handleCancelEdit} // Propagate cancel callback
                            className="mt-4"
                        />
                    </div>
                </>
            )}
        </SheetContent>
    );
}