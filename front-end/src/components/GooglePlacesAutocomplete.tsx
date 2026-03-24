import { extractAddressComponents, PlaceAutocompleteAddress } from '@/lib/utils/google-place.utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Input, InputProps } from '@nextui-org/react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

const MIN_CHARS_FOR_SEARCH = 3;
/** Debounce delay (ms) before calling Places API — only call after user stops typing. 300–500ms reduces API calls and billing. */
const DEFAULT_DEBOUNCE_MS = 600;

/** Restrict address search to UK only (ISO 3166-1 alpha-2: gb). Limits results, reduces typing and API calls. */
const DEFAULT_COUNTRY_RESTRICTION: string[] = ['gb'];

interface GooglePlacesAutocompleteProps<T extends FieldValues> extends InputProps {
  onPlaceSelect: (place: PlaceAutocompleteAddress) => void;
  control: Control<T>;
  name: Path<T>;
  inputClassName?: string;
  /** Delay in ms before fetching predictions after user stops typing (recommended 300–500). Default 400. */
  debounceMs?: number;
  /** ISO country codes to restrict results to (e.g. ['gb'] for UK). Restricts scope and reduces API calls. */
  restrictToCountries?: string[];
}

const GooglePlacesAutocomplete = <T extends FieldValues>({
  onPlaceSelect,
  control,
  name,
  inputClassName,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  restrictToCountries = DEFAULT_COUNTRY_RESTRICTION,
  ...props
}: GooglePlacesAutocompleteProps<T>) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onChangeRef = useRef<(value: string) => void>(() => {});
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const previousLengthRef = useRef(0);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  // Check for Google Maps loading (AutocompleteService is in same places library)
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (
        typeof window !== 'undefined' &&
        window.google?.maps?.places &&
        window.google.maps.places.AutocompleteService
      ) {
        setIsLoaded(true);
        setError(null);
        return true;
      }
      return false;
    };

    if (checkGoogleMaps()) return;

    const handleGoogleMapsLoaded = () => {
      if (checkGoogleMaps()) return;
      setTimeout(() => checkGoogleMaps(), 100);
    };

    const handleGoogleMapsError = () => {
      setError(new Error('Failed to load Google Maps API'));
    };

    window.addEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
    window.addEventListener('googleMapsError', handleGoogleMapsError as EventListener);

    const interval = setInterval(checkGoogleMaps, 500);

    return () => {
      window.removeEventListener('googleMapsLoaded', handleGoogleMapsLoaded);
      window.removeEventListener('googleMapsError', handleGoogleMapsError as EventListener);
      clearInterval(interval);
    };
  }, []);

  // Create AutocompleteService and PlacesService when Maps is loaded
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google?.maps?.places) return;

    autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    placesServiceRef.current = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    return () => {
      autocompleteServiceRef.current = null;
      placesServiceRef.current = null;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [isLoaded]);

  const fetchPredictions = useCallback(
    (input: string) => {
      if (!autocompleteServiceRef.current || input.length < MIN_CHARS_FOR_SEARCH) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      // Restrict search scope to delivery countries (components/country) — faster results, fewer API calls
      const componentRestrictions =
        restrictToCountries.length > 0
          ? { country: restrictToCountries.length === 1 ? restrictToCountries[0] : restrictToCountries }
          : undefined;

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          types: ['address'],
          componentRestrictions,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    },
    [restrictToCountries]
  );

  const handleInputChange = useCallback(
    (newValue: string, onChange: (value: string) => void) => {
      const newLength = newValue.length;
      const previousLength = previousLengthRef.current;
      previousLengthRef.current = newLength;

      onChange(newValue);

      // Do not call the API when the user is deleting or pressing backspace
      const isDeleting = newLength < previousLength;
      if (isDeleting) {
        setPredictions([]);
        setShowPredictions(false);
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        return;
      }

      if (newLength < MIN_CHARS_FOR_SEARCH) {
        setPredictions([]);
        setShowPredictions(false);
        return;
      }

      // Debounce: API is only called after user stops typing for debounceMs (reduces billing)
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        fetchPredictions(newValue);
      }, debounceMs);
    },
    [fetchPredictions, debounceMs]
  );

  const handleSelectPrediction = useCallback(
    (prediction: google.maps.places.AutocompletePrediction, onChange: (value: string) => void) => {
      if (!placesServiceRef.current) return;

      setIsSelecting(true);

      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        },
        (place, status) => {
          setIsSelecting(false);
          if (status !== window.google.maps.places.PlacesServiceStatus.OK || !place) return;

          const address = extractAddressComponents(place);

          onPlaceSelect(address);
          onChange(address.street);
          setPredictions([]);
          setShowPredictions(false);
          onChangeRef.current(address.street);
        }
      );
    },
    [onPlaceSelect]
  );

  const handleBlur = useCallback(() => {
    if (isSelecting) return;
    setTimeout(() => setShowPredictions(false), 200);
  }, [isSelecting]);

  const inputClassNames = {
    label:
      '!text-skin-neutral-400 !font-bold !text-content-2 md:!text-title-2 whitespace-nowrap group-data-[filled-within=true]:mt-1',
    input: `!bg-skin-white !text-skin-neutral-400 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1 ${inputClassName ?? ''}`,
    innerWrapper:
      '!bg-skin-white disabled:!bg-skin-neutral-50 gap-2 hover:!bg-skin-white pb-0 group-data-[has-label=true]:pt-9',
    inputWrapper:
      'pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-white border border-skin-neutral-100 hover:border-skin-primary-500 group-data-[filled-within=true]:border-skin-primary-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-skin-primary-300 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50',
  };

  const loadingClassNames = {
    ...inputClassNames,
    input: `!bg-skin-neutral-50 !text-skin-neutral-300 font-bold text-content-2 md:!text-title-2 placeholder:!text-skin-neutral-200 placeholder:font-semibold max-md:placeholder:text-content-1 ${inputClassName ?? ''}`,
    innerWrapper: '!bg-skin-neutral-50 disabled:!bg-skin-neutral-50 gap-2 hover:!bg-skin-neutral-50 pb-0 group-data-[has-label=true]:pt-9',
    inputWrapper:
      'pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-neutral-50 border border-skin-neutral-100 hover:border-skin-neutral-100 group-data-[filled-within=true]:border-skin-neutral-100 data-[hover=true]:!bg-skin-neutral-50 group-data-[focus=true]:border-skin-neutral-100 group-data-[focus=true]:!bg-skin-neutral-50 !cursor-not-allowed disabled:!bg-skin-neutral-50',
  };

  const errorClassNames = {
    ...inputClassNames,
    inputWrapper:
      'pl-3 md:pl-5 pr-3 h-11 md:h-12 shadow-input rounded !bg-skin-white border border-red-300 hover:border-red-400 group-data-[filled-within=true]:border-red-400 data-[hover=true]:!bg-skin-white group-data-[focus=true]:border-red-500 group-data-[focus=true]:!bg-skin-white !cursor-text disabled:!bg-skin-neutral-50',
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...field }, fieldState: { error: fieldError } }) => {
        onChangeRef.current = onChange;

        if (!isLoaded && !error) {
          return (
            <Input
              {...field}
              {...props}
              value={value || ''}
              placeholder="Loading address autocomplete..."
              isDisabled
              classNames={loadingClassNames}
            />
          );
        }

        if (error) {
          return (
            <Input
              {...field}
              {...props}
              value={value || ''}
              placeholder="Address autocomplete unavailable"
              isInvalid
              errorMessage="Failed to load address autocomplete. Please enter your address manually."
              classNames={errorClassNames}
            />
          );
        }

        return (
          <div className="relative w-full">
            <Input
              {...field}
              {...props}
              ref={inputRef}
              value={value || ''}
              onChange={(e) => handleInputChange(e.target.value, onChange)}
              onBlur={handleBlur}
              onFocus={() => predictions.length > 0 && setShowPredictions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && showPredictions && predictions.length > 0) {
                  e.preventDefault();
                  handleSelectPrediction(predictions[0], onChange);
                }
              }}
              isInvalid={!!fieldError}
              errorMessage={fieldError?.message}
              classNames={inputClassNames}
              autoComplete="off"
            />

            {showPredictions && predictions.length > 0 && (
              <ul
                className="absolute z-[100] mt-1 w-full rounded-lg border border-skin-neutral-100 bg-skin-white py-1 shadow-lg max-h-60 overflow-y-auto"
                role="listbox"
                onMouseDown={(e) => e.preventDefault()}
              >
                {predictions.map((prediction) => (
                  <li
                    key={prediction.place_id}
                    role="option"
                    className="flex cursor-pointer gap-2 px-3 py-2 text-left text-sm text-skin-neutral-400 hover:bg-skin-neutral-50 focus:bg-skin-neutral-50"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectPrediction(prediction, onChange);
                    }}
                  >
                    <span className="shrink-0 text-skin-primary-500" aria-hidden>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="size-4"
                      >
                        <path d="M12 2.5C8.962 2.5 6.5 4.962 6.5 8c0 3.77 3.7 7.59 5.1 9.01.22.22.58.22.8 0 1.4-1.42 5.1-5.24 5.1-9.01 0-3.038-2.462-5.5-5.5-5.5Zm0 3a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-medium text-skin-neutral-400">
                        {prediction.structured_formatting?.main_text ?? prediction.description}
                      </div>
                      {prediction.structured_formatting?.secondary_text && (
                        <div className="text-xs text-skin-neutral-300">
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
                <li className="border-t border-skin-neutral-100 px-3 py-1.5 text-right text-xs text-skin-neutral-300">
                  powered by Google
                </li>
              </ul>
            )}
          </div>
        );
      }}
    />
  );
};

export default GooglePlacesAutocomplete;
