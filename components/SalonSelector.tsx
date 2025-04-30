import { useState, useEffect } from 'react';
import { LocalStorageManager } from '@/helpers/localStorageManager';
import { SELECTED_SALON_ID } from '@/constants';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check, Building2, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectSalonId, selectSalons, updateSelectedSalonId } from '@/store/slices/authSlice';
import { UserSalon } from '@/services/getProfile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CreateSalonForm } from './CreateSalonForm';

export const SalonSelector = () => {
  const [selectedSalon, setSelectedSalon] = useState<UserSalon | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
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
  };

  const handleCreateSuccess = () => {
    setIsSheetOpen(false);
  };

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
              <Button
                key={salon.id}
                variant="ghost"
                className={`w-full justify-start px-4 py-3 ${
                  selectedSalon?.id === salon.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleSalonSelect(salon)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{salon.name}</div>
                  </div>
                  {selectedSalon?.id === salon.id && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              </Button>
            ))}
            <Separator className="my-2" />
            <Button
              variant="ghost"
              className="w-full justify-start px-4 py-3"
              onClick={() => setIsSheetOpen(true)}
            >
              <div className="flex items-center space-x-3 w-full">
                <Plus className="h-4 w-4 shrink-0" />
                <span className="font-medium">Create New Salon</span>
              </div>
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-[500px] sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle>Create New Salon</SheetTitle>
          </SheetHeader>
          <CreateSalonForm onSuccess={handleCreateSuccess} />
        </SheetContent>
      </Sheet>
    </div>
  );
};