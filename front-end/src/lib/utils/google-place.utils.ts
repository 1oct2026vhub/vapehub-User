
export type PlaceAutocompleteAddress = {
    street: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    region: string;
}


export const extractAddressComponents = (place: google.maps.places.PlaceResult) => {
  const addressComponents = place.address_components || [];
  const getComponent = (type: string, useShortName: boolean = false) => {
    const component = addressComponents.find((comp) => comp.types.includes(type));
    if (!component) return '';
    return useShortName ? component.short_name : component.long_name;
  };

  const routeShort = getComponent('route', true);
  const routeLong = getComponent('route');
  const localityShort = getComponent('locality', true);
  const localityLong = getComponent('locality');
  const postalTownShort = getComponent('postal_town', true);
  const postalTownLong = getComponent('postal_town');
  const countryLong = getComponent('country');
  const countryShort = getComponent('country', true);

  return {
    // Address Line 1 should only be the street.
    // `route` is what Google considers the street name/number.
    street: routeShort || routeLong || place.name || '',
    city: localityLong || getComponent('postal_town'),
    state: getComponent('administrative_area_level_1'),
    postcode: getComponent('postal_code'),
    country: countryLong,
    region: getComponent('administrative_area_level_2'),
  };
};