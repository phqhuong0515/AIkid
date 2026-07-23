import type { AxiosInstance } from 'axios';
export type MediaAsset = {
    id?: string;
    url?: string | null;
    imageUrl?: string | null;
    previewUrl?: string | null;
    driveUrl?: string | null;
    assetType?: string | null;
    tags?: string[] | null;
    createdAt?: string | null;
    [key: string]: unknown;
};
export type MediaGalleryPage = {
    items: MediaAsset[];
    pagination?: {
        hasMore?: boolean;
        total?: number;
        limit?: number;
        offset?: number;
    };
};
export type MediaUploadResult = {
    url?: string;
    urls?: string[];
    imageUrl?: string;
    [key: string]: unknown;
};
export type MediaUploadParams = {
    ipId?: string;
    assetType?: string;
    tags?: string;
    temporary?: string;
    permanent?: string;
};
export declare function createMediaApi(client: AxiosInstance): {
    listGallery(params: Record<string, string | number | undefined>): Promise<MediaGalleryPage>;
    upload(formData: FormData, params?: MediaUploadParams): Promise<MediaUploadResult>;
};
export type MediaApi = ReturnType<typeof createMediaApi>;
//# sourceMappingURL=api.d.ts.map