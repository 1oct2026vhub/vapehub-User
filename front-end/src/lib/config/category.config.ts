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
        slug: "/brands",
    },
    {
        name: "Blogs",
        slug: "/blogs",
    },
    {
        name: "Deals",
        slug: "/deals",
    }

];

export enum CategoryDetails {
    title = "Shop by Category",
    viewAllHref = "/categories"
}