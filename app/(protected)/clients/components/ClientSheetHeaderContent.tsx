'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// Import Client from columns with an alias
import { Client as TableClient } from "./columns";
import { Mail, Phone, Bell, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarIcon } from './StarIcon'; // Import StarIcon from its file

type SheetMode = 'add' | 'view' | 'edit' | null;

// Define props for the header component
interface ClientSheetHeaderContentProps {
    selectedClient: TableClient; // Assuming selectedClient is always present when this is rendered
    staticData: { // Pass the static data as a prop
        points: number;
        visits: number;
        rating: number;
        ratingCount: number;
        showRate: number;
        avgVisitWeeks: number;
        avgVisitValue: number;
    };
    onChangeMode: (mode: SheetMode, client?: TableClient | null) => void;
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
                    <AvatarImage src={undefined} alt={`${selectedClient.first_name} ${selectedClient.last_name}`} />
                    <AvatarFallback className="text-lg">{selectedClient.first_name?.[0]}{selectedClient.last_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <SheetTitle className="text-lg font-semibold leading-tight">{selectedClient.first_name} {selectedClient.last_name}</SheetTitle>
                    <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mt-0.5">
                        <span>{staticData.points} PTS</span><span className="mx-0.5">&bull;</span>
                        <span>{staticData.visits} VST</span><span className="mx-0.5">&bull;</span>
                        <span className="flex items-center gap-0.5"><StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />{staticData.rating}({staticData.ratingCount})</span>
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