
export interface WelcomeContentData {
    id: number;
    title: string;
    content: string;
    image_url: string;
    status: string;
    updated_by: number;
    createdAt: string;
    updatedAt: string;
    deletedAt: null | string;
    updater: {
        id: number;
        first_name: string;
        last_name: string;
        email: string;
    };
}

export interface WelcomeContentResponse {
    welcomeContent: WelcomeContentData;
}

