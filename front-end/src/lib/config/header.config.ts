import { z } from 'zod';
import { ServerActionStatus } from './app.config';

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
// * Footer Menu
export interface FooterMenuLink {
  id: number;
  section_id: number;
  label: string;
  url: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface FooterMenu {
  id: number;
  title: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  links: FooterMenuLink[];
}
// * Footer Menu Response
export interface FooterMenuResponse {
  data: FooterMenu[];
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    phone_number?: string;
    email?: string;
  };
  status?: ServerActionStatus;
  message?: string;
}


// * Header Mega Menu
export interface HeaderMegaMenu {
  id: number;
  updated_by: number;
  label: string;
  menu_parent: number | null;
  order: number;
  original: string;
  entity_type: string;
  entity_id: number;
  status: boolean;
  show_image: boolean;
  icon: string;
  hide_text: boolean;
  hide_mobile_view: boolean;
  hide_desktop_view: boolean;
  icon_position: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  parent: {
    id: number;
    label: string;
    original: string;
  } | null;
  children: HeaderMegaMenu[];
  entity_data?: {
    id: number;
    name: string;
    slug: string;
    price?: string;
    discount_price?: string;
    ProductImages?: {
      image_url: string;
    }[];
  };
}

// * Header Mega Menu Response
export interface HeaderMegaMenuResponse {
  data: HeaderMegaMenu[];
}

