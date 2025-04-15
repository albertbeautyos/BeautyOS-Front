'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// Import Client directly
import { Client } from "@/services/clients";
import { Mail, Phone, Bell, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from './StarIcon'; // Import StarIcon from its file

type SheetMode = 'add' | 'view' | 'edit' | null;

// Define props for the header component
interface ClientSheetHeaderContentProps {
    selectedClient: Client; // Use imported Client type
    staticData: { // Pass the static data as a prop - Removed points, visits, rating
        ratingCount: number; // Keep example/static data
        showRate: number; // From Client type or static
        avgVisitWeeks: number; // Example/static data
        avgVisitValue: number; // From Client type or static
    };
    onChangeMode: (mode: SheetMode, client?: Client | null) => void; // Use imported Client type
    onSetMobileTab?: (tab: string) => void; // Optional: only for mobile edit button
}

// Reusable Header Content Component
const ClientSheetHeaderContent: React.FC<ClientSheetHeaderContentProps> = ({
    selectedClient,
    staticData,
    onChangeMode,
    onSetMobileTab
}) => {
    const handleEditClick = () => {
        onChangeMode('edit', selectedClient);
        if (onSetMobileTab) {
            onSetMobileTab('INFO'); // Set tab only if the handler is provided (mobile view)
        }
    };

    return (
        <SheetHeader className="p-2.5 border-b bg-muted/30 space-y-2 flex-shrink-0">
            <div className="flex items-center gap-2">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={undefined} alt={`${selectedClient.firstName} ${selectedClient.lastName}`} />
                    <AvatarFallback className="text-lg">{selectedClient.firstName?.[0]}{selectedClient.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <SheetTitle className="text-lg font-semibold leading-tight">{selectedClient.firstName} {selectedClient.lastName}</SheetTitle>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mt-0.5">
                        {selectedClient.email && <span>{selectedClient.email}</span>}
                    </div>
                </div>
                <div className="flex justify-end gap-1 pr-1" >
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleEditClick}>
                        <Edit className="h-4 w-4" /><span className="sr-only">Edit</span>
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8"><Mail className="h-4 w-4" /><span className="sr-only">Email</span></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8"><Phone className="h-4 w-4" /><span className="sr-only">Call</span></Button>
                    <Button size="icon" variant="outline" className="h-8 w-8"><Bell className="h-4 w-4" /><span className="sr-only">Notifications</span></Button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-xs">
                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{staticData.showRate}%</p><p className="text-muted-foreground leading-tight">Show Rate</p></div>
                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">{staticData.avgVisitWeeks} <span className="font-normal">Wks</span></p><p className="text-muted-foreground leading-tight">AVG Visit</p></div>
                <div className="bg-background p-1 rounded border"><p className="font-semibold text-sm">${staticData.avgVisitValue}</p><p className="text-muted-foreground leading-tight">AVG Value</p></div>
            </div>
        </SheetHeader>
    );
};

export { ClientSheetHeaderContent, type ClientSheetHeaderContentProps, type SheetMode }; // Export component, props type and SheetMode type