 
export interface BrandConfig {
    id: number;
    updated_by: number | null;
    slug: string;
    name: string;
    logo_url: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface BrandListResponse {
    brands: BrandConfig[];
    pagination: {
        currentPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        itemsPerPage: number;
        totalItems: number;
        totalPages: number;
    };
}

export interface BrandListPayload {
    page: number;
    limit: number;
}

