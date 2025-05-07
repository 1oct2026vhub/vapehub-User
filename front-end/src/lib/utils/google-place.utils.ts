
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
  const getComponent = (type: string) => {
    const component = addressComponents.find(comp => comp.types.includes(type));
    return component ? component.long_name : '';
  };

  return {
    street: place.name || getComponent('route'),
    city: getComponent('locality') || getComponent('postal_town'),
    state: getComponent('administrative_area_level_1'),
    postcode: getComponent('postal_code'),
    country: getComponent('country'),
    region: getComponent('administrative_area_level_2'),
  };
};