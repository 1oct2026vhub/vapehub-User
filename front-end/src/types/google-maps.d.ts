declare namespace google.maps.places {
  interface PlaceResult {
    address_components?: AddressComponent[];
    formatted_address?: string;
    geometry?: {
      location: LatLng;
      viewport?: LatLngBounds;
    };
    name?: string;
  }

  interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
  }

  class Autocomplete {
    constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
    addListener(eventName: string, handler: () => void): google.maps.MapsEventListener;
    getPlace(): PlaceResult;
  }

  interface AutocompleteOptions {
    bounds?: LatLngBounds;
    componentRestrictions?: ComponentRestrictions;
    types?: string[];
    fields?: string[];
  }

  interface ComponentRestrictions {
    country: string | string[];
  }
}

declare namespace google.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(point: LatLng): LatLngBounds;
  }

  interface MapsEventListener {
    remove(): void;
  }

  namespace event {
    function removeListener(listener: MapsEventListener): void;
  }
} 