"use client";

import React, { useState, useMemo, useCallback } from 'react';
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AddUserForm } from './add-user-form';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UserSheetHeaderContent, type SheetMode } from './UserSheetHeaderContent';
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
    try {
        return {
            id: user.id || '',
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            email: user.email,
            profileImage: user.profileImage,
            gender: user.gender,
            pronouns: user.pronouns,
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
            salonId: user.salonId ,
        };
    } catch (error) {
        console.error("Error mapping user data:", error);
        return {
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            phone: user.phone || "",
            email: user.email || "",
            gender: user.gender || "Male",
            profileImage: user.profileImage || "",
            salonId: user.salonId,
        };
    }
};

// The Sheet Content Component - Updated
export const UserSheetContent: React.FC<UserSheetContentProps> = ({
    sheetMode,
    selectedUser,
    onSuccess,
    onChangeMode,
    onCloseSheet,
    onRequestDelete,
    isLoading
}) => {
    const [selectedSidebarTab, setSelectedSidebarTab] = useState<string>('DASH');
    const [selectedMobileTab, setSelectedMobileTab] = useState<string>('INFO');

    // Updated Static Data to match UserSheetHeaderContentProps
    const StaticUserViewData = useMemo(() => ({
        // Replace with actual logic or relevant user data later
        metric1: selectedUser?.id?.substring(0, 5) ?? 'N/A', // Placeholder Example
        metric2: selectedUser?.role?.join(', ') ?? 'N/A', // Placeholder Example
        metric3: 'Placeholder',
    }), [selectedUser]);

    const getSheetTitle = () => {
        switch (sheetMode) {
            case 'add': return 'Add New User';
            case 'view': return selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'User Details';
            case 'edit': return selectedUser ? `Editing ${selectedUser.firstName} ${selectedUser.lastName}` : 'Edit User';
            default: return 'User Information';
        }
    };

    const handleCancelEdit = () => {
      if (sheetMode === 'edit' && selectedUser) {
        onChangeMode('view', selectedUser);
      } else {
        onCloseSheet();
      }
    };

    const sheetTitle = getSheetTitle();

    const renderMobileTabContent = () => {
        switch (selectedMobileTab) {
            case 'INFO':
                return (
                    <AddUserForm
                        key={selectedUser?.id || 'mobile-add-edit-form'}
                        initialData={mapUserToFormData(selectedUser)}
                        isInitiallyEditing={sheetMode === 'edit'}
                        onSuccess={onSuccess}
                        onCancelEdit={handleCancelEdit}
                        onRequestDeleteFromForm={onRequestDelete}
                        className="mt-0 p-3"
                        submitButtonLabel={sheetMode === 'edit' ? "Update User" : "Add User"}
                    />
                );
            case 'SERVICES':
                 <div>
              <p>Services</p>
            </div>
            case 'NOTES':
            case 'MESSAGES':
            case 'APPOINTMENTS':
            case 'PRODUCTS':
                return <div className="p-4"><p className="text-lg font-medium text-muted-foreground">{selectedMobileTab.charAt(0) + selectedMobileTab.slice(1).toLowerCase()} Content Area</p></div>;
            default:
                return null;
        }
    };

    const renderDesktopSidebarContent = () => {
        switch (selectedSidebarTab) {
          case 'SERVICES':
            <div>
              <p>Services</p>
            </div>
          case 'NOTES':
          case 'MESSAGES':
          case 'APPOINTMENTS':
          case 'PRODUCTS':
              return <div className="p-4 flex items-center justify-center h-full"><p className="text-lg font-medium text-muted-foreground">{selectedSidebarTab.charAt(0) + selectedSidebarTab.slice(1).toLowerCase()} Content Area</p></div>;
          default:
              return null;
        }
    };

    const TABS = ['INFO', 'SERVICES', 'NOTES', 'MESSAGES', 'APPOINTMENTS', 'PRODUCTS'];
    const DESKTOP_SIDEBAR_TABS = ['SERVICES', 'NOTES', 'MESSAGES', 'APPOINTMENTS', 'PRODUCTS'];

    return (
        <SheetContent className={cn(
            "w-full p-0 flex flex-col overflow-hidden",
            (sheetMode === 'view' || sheetMode === 'edit') ? "sm:max-w-4xl" : "sm:max-w-md"
        )}>
            {(sheetMode === 'view' || sheetMode === 'edit') && selectedUser ? (
                <>
                    {/* Mobile View */}
                    <div className="flex flex-col w-full h-full sm:flex md:hidden">
                        <UserSheetHeaderContent
                            selectedUser={selectedUser}
                            staticData={StaticUserViewData}
                            onChangeMode={onChangeMode}
                            onSetMobileTab={setSelectedMobileTab}
                        />
                        <div className="p-4 border-b flex-shrink-0 overflow-x-auto">
                            <div className="flex space-x-6 min-w-max">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setSelectedMobileTab(tab)}
                                        className={cn(
                                            "uppercase text-xs font-semibold pb-1",
                                            selectedMobileTab === tab
                                                ? "text-foreground border-b-2 border-foreground"
                                                : "text-muted-foreground hover:text-foreground/80"
                                        )}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {renderMobileTabContent()}
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:flex flex-row w-full h-full">
                        <div className="flex flex-col w-1/2 border-r overflow-hidden">
                            <UserSheetHeaderContent
                                selectedUser={selectedUser}
                                staticData={StaticUserViewData}
                                onChangeMode={onChangeMode}
                            />
                            <div className="flex-1 overflow-y-auto">
                                <AddUserForm
                                    key={selectedUser.id || 'desktop-edit-form'}
                                    initialData={mapUserToFormData(selectedUser)}
                                    isInitiallyEditing={sheetMode === 'edit'}
                                    onSuccess={onSuccess}
                                    onCancelEdit={handleCancelEdit}
                                    onRequestDeleteFromForm={onRequestDelete}
                                    className="mt-0 p-3"
                                    submitButtonLabel={sheetMode === 'edit' ? "Update User" : "Add User"}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col w-1/2 h-full">
                            <div className="p-4 border-b flex-shrink-0">
                                <div className="flex space-x-6">
                                    {DESKTOP_SIDEBAR_TABS.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedSidebarTab(tab)}
                                            className={cn(
                                                "uppercase text-xs font-semibold pb-1",
                                                selectedSidebarTab === tab
                                                    ? "text-foreground border-b-2 border-foreground"
                                                    : "text-muted-foreground hover:text-foreground/80"
                                            )}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {renderDesktopSidebarContent()}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <SheetHeader className="p-6 border-b">
                        <SheetTitle>{sheetTitle}</SheetTitle>
                        <SheetDescription>Fill in the details below to add a new user.</SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-3">
                        <AddUserForm
                            key={'add-form'}
                            initialData={undefined}
                            isInitiallyEditing={true}
                            onSuccess={onSuccess}
                            onCancelEdit={handleCancelEdit}
                            className="mt-4"
                            submitButtonLabel="Add User"
                        />
                    </div>
                </>
            )}
        </SheetContent>
    );
}