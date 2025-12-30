export interface CarouselConfig {
    id: number;
    display_order: number;
    image_url: string;
    image_url_mid: string;
    image_url_low: string;
    title: string;
    description: string;
    alt_text?: string;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    redirect_url: string;
}