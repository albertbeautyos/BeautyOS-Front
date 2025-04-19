'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// Import User type
import { User } from "@/services/users"; // Changed import from Client to User
import { Mail, Phone, Bell, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from './StarIcon'; // Assuming StarIcon is generic or not used here

type SheetMode = 'add' | 'view' | 'edit' | null;

// Define props for the header component using User
interface UserSheetHeaderContentProps { // Renamed interface
    selectedUser: User; // Changed prop name and type to User
    staticData: { // Adjust static data structure for User - Placeholder examples
        // ratingCount: number; // Example user metric
        // showRate: number; // Example user metric
        // avgVisitWeeks: number; // Example user metric
        // avgVisitValue: number; // Example user metric
        // Using placeholders until specific user metrics are defined
        metric1: number | string;
        metric2: number | string;
        metric3: number | string;
    };
    onChangeMode: (mode: SheetMode, user?: User | null) => void; // Updated type to User
    onSetMobileTab?: (tab: string) => void;
}

// Reusable Header Content Component - Renamed
const UserSheetHeaderContent: React.FC<UserSheetHeaderContentProps> = ({
    selectedUser, // Changed prop name
    staticData,
    onChangeMode,
    onSetMobileTab
}) => {
    const handleEditClick = () => {
        onChangeMode('edit', selectedUser); // Pass selectedUser
        if (onSetMobileTab) {
            onSetMobileTab('INFO');
        }
    };

    // Determine initials for AvatarFallback
    const userInitials = `${selectedUser.firstName?.[0] ?? ''}${selectedUser.lastName?.[0] ?? ''}`.toUpperCase();

    return (
        <SheetHeader className="p-2.5 border-b bg-muted/30 space-y-2 flex-shrink-0">
            <div className="flex items-center gap-2">
                <Avatar className="h-12 w-12 border">
                    {/* Use profileImage if available */}
                    <AvatarImage src={selectedUser.profileImage || undefined} alt={`${selectedUser.firstName} ${selectedUser.lastName}`} />
                    <AvatarFallback className="text-lg">{userInitials || '?'}</AvatarFallback> {/* Use calculated initials */}
                </Avatar>
                <div className="flex-1">
                    <SheetTitle className="text-lg font-semibold leading-tight">{selectedUser.firstName} {selectedUser.lastName}</SheetTitle>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mt-0.5">
                        {/* Display user's email */}
                        {selectedUser.email && <span>{selectedUser.email}</span>}
                    </div>
                </div>
                {/* Action buttons - Keep structure, functionality might change based on user context */}
                <div className="flex justify-end gap-1 pr-1" >
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleEditClick}>
                        <Edit className="h-4 w-4" /><span className="sr-only">Edit User</span> {/* Updated sr-only text */}
                    </Button>
                    {/* Keep other buttons as placeholders for now */}
                    <Button size="icon" variant="outline" className="h-8 w-8"><Mail className="h-4 w-4" /><span className="sr-only">Email User</span></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8"><Phone className="h-4 w-4" /><span className="sr-only">Call User</span></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8"><Bell className="h-4 w-4" /><span className="sr-only">User Notifications</span></Button>
                </div>
            </div>
            {/* Placeholder metrics grid - Adjust fields and labels as needed for User */}
            <div className="grid grid-cols-3 gap-1 text-center text-xs">
                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{staticData.metric1}</p><p className="text-muted-foreground leading-tight">Metric 1</p></div>
                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{staticData.metric2}</p><p className="text-muted-foreground leading-tight">Metric 2</p></div>
                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{staticData.metric3}</p><p className="text-muted-foreground leading-tight">Metric 3</p></div>
            </div>
        </SheetHeader>
    );
};

// Export with updated names
export { UserSheetHeaderContent, type UserSheetHeaderContentProps, type SheetMode };