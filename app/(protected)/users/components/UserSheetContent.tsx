"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddUserForm } from './add-user-form';
// Import Client directly from the service
import { Client, NewClientData } from '@/services/clients'; // Removed ServiceClient alias
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ClientSheetHeaderContent, type SheetMode } from './UserSheetHeaderContent'; // Import the new component and SheetMode type
// Import User and NewUserData types
import { User, NewUserData } from '@/services/users';

// Interface for the main component props
interface UserSheetContentProps {
    sheetMode: SheetMode;
    selectedUser: User | null;
    onSuccess: (formData: NewUserData | User) => void;
    onChangeMode: (mode: SheetMode, user?: User | null) => void;
    onCloseSheet: () => void;
    onRequestDelete?: () => void;
    isLoading?: boolean;
}

// Utility function to map User data to form data structure
const mapUserToFormData = (user: User | null): Partial<NewUserData> & { id?: string } | undefined => {
    if (!user) return undefined;

    console.log("Mapping user data to form:", user);

    try {
        return {
            id: user.id || '',
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            profileImage: user.profileImage, // Added profileImage field
            gender: user.gender,
            pronouns: user.pronouns,
            // Removed referredBy and clientType as they're not in the schema
            birthday: user.birthday ? new Date(user.birthday) : undefined,
            address: user.address ? {
                street: user.address.street,
                city: user.address.city,
                state: user.address.state,
                postalCode: user.address.postalCode,
                country: user.address.country,
                location: {
                    type: user.address.location?.type || "Point",
                    coordinates: user.address.location?.coordinates || [0, 0]
                }
            } : undefined,
            role: Array.isArray(user.role) ? user.role : ["PROFESSIONAL"],
        };
    } catch (error) {
        console.error("Error mapping user data:", error);
        // Return basic data if mapping fails
        return {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phone || "",
            email: user.email || "",
            role: ["PROFESSIONAL"],
            // Include required fields even in error case
            gender: user.gender || "Male", // Default to "Male" as shown in the schema
            profileImage: user.profileImage || "", // Include profileImage in error case
        };
    }
};

// The Sheet Content Component
export const UserSheetContent: React.FC<UserSheetContentProps> = ({
    sheetMode,
    selectedUser,
    onSuccess,
    onChangeMode,
    onCloseSheet,
    onRequestDelete,
    ...props
}) => {
    const [selectedSidebarTab, setSelectedSidebarTab] = useState<string>('DASH'); // Default sidebar tab
    const [selectedMobileTab, setSelectedMobileTab] = useState<string>('INFO'); // Default mobile tab for view/edit

    // Static Data Helper - Updated to match ClientSheetHeaderContent props
    const StaticClientViewData = useMemo(() => ({
        // Use properties available in selectedClient or static examples
        showRate: selectedUser?.showRate ?? 0,
        // avgVisit: selectedClient?.avgVisit ?? 0, // avgVisitWeeks is used in header, keep static example
        avgVisitValue: selectedUser?.avgVisitValue ?? 0,
        // Static/Example Data expected by header
        ratingCount: 84, // Example
        avgVisitWeeks: 4.5, // Example
        // Other static data used within this component
        tagsHair: ["Hair color", "Haircuts", "Haircuts"], // Example data
        tagsSalon: ["Salon 1", "Salon 2"], // Example data
        addressDisplay: "Address info TBD", // Placeholder - Address is not directly on Client now
    }), [selectedUser]);

    // Determines the title based on the current mode
    const getSheetTitle = () => {
        switch (sheetMode) {
            case 'add': return 'Add New Client';
            // Use correct property names
            case 'view': return selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'Client Details';
            case 'edit': return selectedUser ? `Editing ${selectedUser.firstName} ${selectedUser.lastName}` : 'Edit Client';
            default: return 'Client Information';
        }
    };

    // Handler for canceling - Switches back to view if editing, otherwise closes
    const handleCancelEdit = () => {
      if (sheetMode === 'edit' && selectedUser) {
        onChangeMode('view', selectedUser); // Use onChangeMode to switch back to view (type is now correct)
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
                        {sheetMode === 'view' && selectedUser && (
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
                        <AddUserForm
                            key={selectedUser?.id || 'mobile-view-edit-form'}
                            initialData={mapUserToFormData(selectedUser)}
                            isInitiallyEditing={sheetMode === 'edit'}
                            onSuccess={onSuccess}
                            onCancelEdit={handleCancelEdit}
                            onRequestDeleteFromForm={onRequestDelete}
                            className="mt-0"
                            submitButtonLabel={sheetMode === 'edit' ? "Update User" : "Add User"}
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
            {(sheetMode === 'view' || sheetMode === 'edit') && selectedUser ? (
                <>
                {/* Mobile View with Tabs */}
                <div className="flex flex-row w-full h-full sm:flex md:hidden">
                    <div className="flex flex-col w-full h-full">
                        {/* Use the reusable header component for mobile */}
                        <ClientSheetHeaderContent
                            selectedClient={selectedUser}
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
                            {renderMobileTabContent()}
                        </div>
                    </div>
                </div>
                {/* Desktop View */}
                <div className="hidden md:flex flex-row w-full h-full">
                    <div className="flex flex-col w-1/2 border-r overflow-hidden">
                        {/* Use the reusable header component for desktop */}
                        <ClientSheetHeaderContent
                            selectedClient={selectedUser}
                            staticData={StaticClientViewData}
                            onChangeMode={onChangeMode}
                            // Do not pass onSetMobileTab for desktop
                        />

                        <div className="flex-1 overflow-y-auto p-3">
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

                                <AddUserForm
                                    key={selectedUser.id || 'view-edit-form'}
                                    initialData={mapUserToFormData(selectedUser)}
                                    isInitiallyEditing={sheetMode === 'edit'}
                                    onSuccess={onSuccess}
                                    onCancelEdit={handleCancelEdit}
                                    onRequestDeleteFromForm={onRequestDelete}
                                    className="mt-0"
                                    submitButtonLabel={sheetMode === 'edit' ? "Update User" : "Add User"}
                                />
                            </>
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
                        <AddUserForm
                            key={'add-form'}
                            initialData={undefined}
                            isInitiallyEditing={true}
                            onSuccess={onSuccess}
                            onCancelEdit={handleCancelEdit}
                            className="mt-4"
                            submitButtonLabel="Add Client"
                        />
                    </div>
                </>
            )}
        </SheetContent>
    );
}