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
    onChangeMode: (mode: SheetMode, client?: TableClient | null) => void; // Use TableClient alias
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
    onChangeMode,
    onCloseSheet,
    onRequestDelete
}) => {
    const [selectedSidebarTab, setSelectedSidebarTab] = useState<string>('DASH'); // Default sidebar tab
    const [selectedMobileTab, setSelectedMobileTab] = useState<string>('INFO'); // Default mobile tab for view/edit

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
      if (sheetMode === 'edit' && selectedClient) {
        onChangeMode('view', selectedClient); // Use onChangeMode to switch back to view
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
                                        <p className="text-xs font-semibold mt-1">{StaticClientViewData.lastVisited}</p>
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
                        <SheetHeader className="p-2.5 border-b bg-muted/30 space-y-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={undefined} alt={`${selectedClient.first_name} ${selectedClient.last_name}`} />
                                    <AvatarFallback className="text-lg">{selectedClient.first_name?.[0]}{selectedClient.last_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <SheetTitle className="text-lg font-semibold leading-tight">{selectedClient.first_name} {selectedClient.last_name}</SheetTitle>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mt-0.5">
                                        <span>{StaticClientViewData.points} PTS</span><span className="mx-0.5">&bull;</span>
                                        <span>{StaticClientViewData.visits} VST</span><span className="mx-0.5">&bull;</span>
                                        <span className="flex items-center gap-0.5"><StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />{StaticClientViewData.rating}({StaticClientViewData.ratingCount})</span>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-1 pr-8" >
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { onChangeMode('edit', selectedClient); setSelectedMobileTab('INFO'); }}>
                                        <Edit className="h-4 w-4" /><span className="sr-only">Edit</span>
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8"><Mail className="h-4 w-4" /><span className="sr-only">Email</span></Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8"><Phone className="h-4 w-4" /><span className="sr-only">Call</span></Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8"><Bell className="h-4 w-4" /><span className="sr-only">Notifications</span></Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{StaticClientViewData.showRate}%</p><p className="text-muted-foreground leading-tight">Show Rate</p></div>
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{StaticClientViewData.avgVisitWeeks} <span className="font-normal">Wks</span></p><p className="text-muted-foreground leading-tight">AVG Visit</p></div>
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">${StaticClientViewData.avgVisitValue}</p><p className="text-muted-foreground leading-tight">AVG Value</p></div>
                            </div>
                        </SheetHeader>

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
                            {renderMobileTabContent()}
                        </div>
                    </div>
                </div>
                {/* Desktop View */}
                <div className="hidden md:flex flex-row w-full h-full">
                    <div className="flex flex-col w-1/2 border-r overflow-hidden">
                        <SheetHeader className="p-2.5 border-b bg-muted/30 space-y-2 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-12 w-12 border">
                                    <AvatarImage src={undefined} alt={`${selectedClient.first_name} ${selectedClient.last_name}`} />
                                    <AvatarFallback className="text-lg">{selectedClient.first_name?.[0]}{selectedClient.last_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <SheetTitle className="text-lg font-semibold leading-tight">{selectedClient.first_name} {selectedClient.last_name}</SheetTitle>
                                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mt-0.5">
                                        <span>{StaticClientViewData.points} PTS</span><span className="mx-0.5">&bull;</span>
                                        <span>{StaticClientViewData.visits} VST</span><span className="mx-0.5">&bull;</span>
                                        <span className="flex items-center gap-0.5"><StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />{StaticClientViewData.rating}({StaticClientViewData.ratingCount})</span>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-1 pr-8" >
                                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => { onChangeMode('edit', selectedClient); /* Optionally set desktop tab here if needed */ }}>
                                        <Edit className="h-4 w-4" /><span className="sr-only">Edit</span>
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8"><Mail className="h-4 w-4" /><span className="sr-only">Email</span></Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8"><Phone className="h-4 w-4" /><span className="sr-only">Call</span></Button>
                                    <Button size="icon" variant="outline" className="h-8 w-8"><Bell className="h-4 w-4" /><span className="sr-only">Notifications</span></Button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-center text-xs">
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{StaticClientViewData.showRate}%</p><p className="text-muted-foreground leading-tight">Show Rate</p></div>
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{StaticClientViewData.avgVisitWeeks} <span className="font-normal">Wks</span></p><p className="text-muted-foreground leading-tight">AVG Visit</p></div>
                                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">${StaticClientViewData.avgVisitValue}</p><p className="text-muted-foreground leading-tight">AVG Value</p></div>
                            </div>
                        </SheetHeader>

                        <div className="flex-1 overflow-y-auto p-3">
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
                                            <p className="text-xs font-semibold mt-1">{StaticClientViewData.lastVisited}</p>
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