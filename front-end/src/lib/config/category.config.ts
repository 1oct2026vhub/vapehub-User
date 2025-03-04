import { ROUTES } from "../routes";

export interface Category extends SubCategory {
    id: number;
    updated_by: string | null;    
    parent_id: number | null;
    logo_url: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    name: string;
    description: string;
    slug: string;
    
}
export interface SubCategory {
    name: string;
    slug: string;
}

export const defaultNavLinks:SubCategory[] = [
    {
        name: "Brands",
        slug: ROUTES.BRANDS,
    },
    {
        name: "Blogs",
        slug: ROUTES.BLOGS,
    },
    {
        name: "Deals",
        slug: ROUTES.DEALS,
    }

];

export enum CategoryDetails {
    title = "Shop by Category",
    viewAllHref = "/categories"
}