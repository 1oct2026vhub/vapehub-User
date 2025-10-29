import { extractAddressComponents, PlaceAutocompleteAddress } from '@/lib/utils/google-place.utils';
import { useEffect, useRef, useState } from 'react';
import { Input, InputProps } from '@nextui-org/react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

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
  
  // Manage Google Maps loading state internally
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check for Google Maps loading
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && 
          window.google && 
          window.google.maps && 
          window.google.maps.places && 
          window.google.maps.places.Autocomplete) {
        setIsLoaded(true);
        setError(null);
        return true;
      }
      return false;
    };

    // Check immediately
    if (checkGoogleMaps()) {
      return;
    }

    // Listen for custom events from the script loader
    const handleGoogleMapsLoaded = () => {
      // Double-check that everything is properly loaded
      if (checkGoogleMaps()) {
        return;
      }
      // If not fully loaded, wait a bit and try again
      setTimeout(() => {
        checkGoogleMaps();
      }, 100);
    };

    const handleGoogleMapsError = () => {
      const error = new Error('Failed to load Google Maps API');
      setError(error);
    };

    // Add event listeners
    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
    window.addEventListener('googleMapsError', handleGoogleMapsError as EventListener);

    // Also check periodically in case the event doesn't fire
    const interval = setInterval(() => {
      if (checkGoogleMaps()) {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
      window.removeEventListener('googleMapsError', handleGoogleMapsError as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!inputRef.current || !isLoaded || !window.google) return;

    // Check if Google Maps and Places API are properly loaded
    if (!window.google.maps || !window.google.maps.places || !window.google.maps.places.Autocomplete) {
      console.error('Google Maps Places API not properly loaded');
      setError(new Error('Google Maps Places API not available'));
      return;
    }

    try {
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
    } catch (err) {
      console.error('Error initializing Google Places Autocomplete:', err);
      setError(new Error('Failed to initialize address autocomplete'));
    }

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
        if (!isLoaded && !error) {
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
                inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-neutral-50 border border-skin-neutral-100 hover:border-skin-neutral-100 group-data-[filled-within=true]:border-skin-neutral-100 data-[hover=true]:!bg-skin-neutral-50 group-data-[focus=true]:border-skin-neutral-100 group-data-[focus=true]:!bg-skin-neutral-50 !cursor-not-allowed disabled:!bg-skin-neutral-50",
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
                inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-white border border-red-300 hover:border-red-400 group-data-[filled-within=true]:border-red-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-red-500 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50",
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
              inputWrapper: "pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 group-data-[filled-within=true]:border-skin-primary-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50",
            }}
          />
        );
      }}
    />
  );
};

export default GooglePlacesAutocomplete; 