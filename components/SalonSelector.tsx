import { useState, useEffect } from 'react';
import { LocalStorageManager } from '@/helpers/localStorageManager';
import { SELECTED_SALON_ID } from '@/constants';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check, Building2, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSalonId, selectSalons, updateSelectedSalonId } from '@/store/slices/authSlice';
import { UserSalon } from '@/services/getProfile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CreateSalonForm } from './CreateSalonForm';
import { SalonResponse, getSalonById, deleteSalonById } from '@/services/salons';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Placeholder for the actual Address structure


export const SalonSelector = () => {
  const [selectedSalon, setSelectedSalon] = useState<UserSalon | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [salonToEdit, setSalonToEdit] = useState<SalonResponse | null>(null);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [salonToDelete, setSalonToDelete] = useState<UserSalon | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const salons = useAppSelector(selectSalons) || [];
  const selectedSalonId = useAppSelector(selectSalonId);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if(!selectedSalonId){
      LocalStorageManager.set('selectedSalonId',salons[0].id);
      dispatch(updateSelectedSalonId(salons[0].id));
    }
  }, []);

  useEffect(() => {
    const currentSalon = salons.find(salon => salon.id === selectedSalonId) || salons[0];
    setSelectedSalon(currentSalon);
  }, [selectedSalonId]);

  const handleSalonSelect = (salon: UserSalon) => {
    setSelectedSalon(salon);
    LocalStorageManager.set(SELECTED_SALON_ID, salon.id);
    dispatch(updateSelectedSalonId(salon.id));
    setSalonToEdit(null);
  };

  const handleEditSalon = async (event: React.MouseEvent, salon: UserSalon) => {
    event.stopPropagation();
    setIsFetchingDetails(true);
    setSalonToEdit(null);
    console.log("Fetching details for salon:", salon.id);

    try {
      const detailsResponse = await getSalonById(salon.id);
      setSalonToEdit(detailsResponse);
      setIsSheetOpen(true);
    } catch (error) {
      console.error("Failed to fetch salon details:", error);
      toast.error("Failed to load salon details for editing.");
    } finally {
      setIsFetchingDetails(false);
    }
  };

  const handleDeleteSalon = (event: React.MouseEvent, salon: UserSalon) => {
    event.stopPropagation();
    setSalonToDelete(salon);
    setIsAlertOpen(true);
  };

  const confirmDeleteSalon = async () => {
    if (!salonToDelete) return;

    setIsDeleting(true);
    try {
      await deleteSalonById(salonToDelete.id);
      toast.success(`Salon "${salonToDelete.name}" deleted successfully.`);



      setIsAlertOpen(false);
      setSalonToDelete(null);

    } catch (error) {
      console.error("Failed to delete salon:", error);
      toast.error(`Failed to delete salon "${salonToDelete.name}".`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateSuccess = () => {
    setIsSheetOpen(false);
    setSalonToEdit(null);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      setSalonToEdit(null);
    }
  }

  if (salons.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[200px]" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-[280px] justify-between"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate max-w-[180px]">{selectedSalon?.name || 'Select Salon'}</span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <div className="p-4">
            <h4 className="font-medium leading-none">Select Salon</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Choose from your available salons
            </p>
          </div>
          <Separator />
          <div className="max-h-[300px] overflow-y-auto">
            {salons.map((salon) => (
              <div
                key={salon.id}
                className={`flex items-center w-full justify-between px-4 py-2 text-sm hover:bg-accent cursor-pointer ${
                  selectedSalon?.id === salon.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleSalonSelect(salon)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0 mr-2">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="font-medium truncate">{salon.name}</span>
                </div>
                <div className="flex items-center space-x-1 shrink-0">
                  {selectedSalon?.id === salon.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => handleEditSalon(e, salon)}
                    disabled={isFetchingDetails}
                  >
                    {isFetchingDetails && salonToEdit?.id === salon.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Pencil className="h-3 w-3" />
                    )}
                    <span className="sr-only">Edit {salon.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                    onClick={(e) => handleDeleteSalon(e, salon)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete {salon.name}</span>
                  </Button>
                </div>
              </div>
            ))}
            <Separator className="my-2" />

          </div>
             <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3"
              onClick={() => {
                setSalonToEdit(null);
                setIsSheetOpen(true);
              }}
            >
              <div className="flex items-center space-x-3 w-full">
                <Plus className="h-4 w-4 shrink-0" />
                <span className="font-medium">Create New Salon</span>
              </div>
            </Button>
        </PopoverContent>
      </Popover>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>{salonToEdit ? 'Edit Salon' : 'Create New Salon'}</SheetTitle>
          </SheetHeader>
          <CreateSalonForm
            onSuccess={handleCreateSuccess}
            initialData={salonToEdit}
            isEditing={!!salonToEdit}
          />
        </SheetContent>
      </Sheet>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the salon
              <span className="font-semibold"> &quot;{salonToDelete?.name || ''}&quot;</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteSalon}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};