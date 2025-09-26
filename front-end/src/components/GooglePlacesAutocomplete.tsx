import { extractAddressComponents, PlaceAutocompleteAddress } from '@/lib/utils/google-place.utils';
import { useEffect, useRef } from 'react';
import { Input, InputProps } from '@nextui-org/react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { useGoogleMaps } from '@/providers/GoogleMapsProvider';

interface GooglePlacesAutocompleteProps<T extends FieldValues> extends InputProps {
  onPlaceSelect: (place: PlaceAutocompleteAddress) => void;
  control: Control<T>;
  name: Path<T>;
  inputClassName?: string;
}

const GooglePlacesAutocomplete = <T extends FieldValues>({
  onPlaceSelect,
  control,
  name,
  inputClassName,
  ...props
}: GooglePlacesAutocompleteProps<T>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const listenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const onChangeRef = useRef<(value: string) => void>(() => {});
  
  // Use the Google Maps context for better loading management
  const { isLoaded, isLoading, error } = useGoogleMaps();

  useEffect(() => {
    if (!inputRef.current || !isLoaded || !window.google) return;

    // Initialize Google Places Autocomplete
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'UK' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      }
    );

    // Add place_changed event listener
    listenerRef.current = autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place) {
        const address = extractAddressComponents(place); 
        onPlaceSelect(address); 
        onChangeRef.current(place.name || '');
      }
    });

    // Cleanup
    return () => {
      if (listenerRef.current) {
        google.maps.event.removeListener(listenerRef.current);
        listenerRef.current = null;
      }
      if (autocompleteRef.current) {
        autocompleteRef.current = null;
      }
    };
  }, [onPlaceSelect, isLoaded]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error: fieldError } }) => {
        onChangeRef.current = onChange;
        
        // Show loading state while Google Maps is loading
        if (isLoading) {
          return (
            <Input
              {...field}
              {...props}
              value={value || ''}
              placeholder="Loading address autocomplete..."
              isDisabled
              classNames={{
                label: "!text-skin-neutral-400 !font-bold !text-content-2 md:!text-title-2 whitespace-nowrap group-data-[filled-within=true]:mt-1",
                input: `!bg-skin-neutral-50 !text-skin-neutral-300 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1 ${inputClassName}`,
                innerWrapper: "!bg-skin-neutral-50 disabled:!bg-skin-neutral-50 gap-2 hover:!bg-skin-neutral-50 pb-0 group-data-[has-label=true]:pt-9",
                inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded-lg lg:rounded-10 !bg-skin-neutral-50 border border-skin-neutral-100 hover:border-skin-neutral-100 group-data-[filled-within=true]:border-skin-neutral-100 data-[hover=true]:!bg-skin-neutral-50 group-data-[focus=true]:border-skin-neutral-100 group-data-[focus=true]:!bg-skin-neutral-50 !cursor-not-allowed disabled:!bg-skin-neutral-50",
              }}
            />
          );
        }
        
        // Show error state if Google Maps failed to load
        if (error) {
          return (
            <Input
              {...field}
              {...props}
              value={value || ''}
              placeholder="Address autocomplete unavailable"
              isInvalid
              errorMessage="Failed to load address autocomplete. Please enter your address manually."
              classNames={{
                label: "!text-skin-neutral-400 !font-bold !text-content-2 md:!text-title-2 whitespace-nowrap group-data-[filled-within=true]:mt-1",
                input: `!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1 ${inputClassName}`,
                innerWrapper: "!bg-skin-white disabled:!bg-skin-neutral-50 gap-2 hover:!bg-skin-white pb-0 group-data-[has-label=true]:pt-9",
                inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded-lg lg:rounded-10 !bg-skin-white border border-red-300 hover:border-red-400 group-data-[filled-within=true]:border-red-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-red-500 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50",
              }}
            />
          );
        }
        
        return (
          <Input
            {...field}
            {...props}
            ref={inputRef}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                inputRef.current?.blur();
              }
            }}
            isInvalid={!!fieldError}
            errorMessage={fieldError?.message}
            classNames={{
              label: "!text-skin-neutral-400 !font-bold !text-content-2 md:!text-title-2 whitespace-nowrap group-data-[filled-within=true]:mt-1",
              input: `!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1 ${inputClassName}`,
              innerWrapper: "!bg-skin-white disabled:!bg-skin-neutral-50 gap-2 hover:!bg-skin-white pb-0 group-data-[has-label=true]:pt-9",
              inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded-lg lg:rounded-10 !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 group-data-[filled-within=true]:border-skin-primary-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50",
            }}
          />
        );
      }}
    />
  );
};

export default GooglePlacesAutocomplete; 