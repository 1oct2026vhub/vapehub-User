import { z } from 'zod';

// * Zod Form Schemas
export const HEADER_IN_SCHEMA = z.object({
  search: z.string().optional()
 
});

export type HeaderFormSchema = z.infer<typeof HEADER_IN_SCHEMA>;

// * Constants
export const Header_FORM_CONFIG = {
  SEARCH: {
    LABEL: '',
    PH: 'Search products, brands or anything else!',
    TYPE: 'search',
  },
  
};
