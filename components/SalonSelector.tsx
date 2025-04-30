import { useState, useEffect } from 'react';
import { SalonResponse } from '@/services/salons';
import { LocalStorageManager } from '@/helpers/localStorageManager';
import { SELECTED_SALON_ID } from '@/constants';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, Check, Building2, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/hooks';
import { selectSalons } from '@/store/slices/authSlice';
import { UserSalon } from '@/services/getProfile';
export const SalonSelector = () => {
  const [selectedSalon, setSelectedSalon] = useState<UserSalon | null>(null);
  const salons=useAppSelector(selectSalons) || []


  useEffect(() => {
    const storedSalonId = LocalStorageManager.get(SELECTED_SALON_ID);
    const currentSalon = salons.find(salon => salon.id === storedSalonId) || salons[0];
    setSelectedSalon(currentSalon);
  }, []);



  const handleSalonSelect = (salon: UserSalon) => {
    setSelectedSalon(salon);
    LocalStorageManager.set(SELECTED_SALON_ID, salon.id);
  };

  if (salons.length === 0) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-[200px]" />
      </div>
    );
  }

  return (
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
        </div>
      </PopoverContent>
    </Popover>
  );
};