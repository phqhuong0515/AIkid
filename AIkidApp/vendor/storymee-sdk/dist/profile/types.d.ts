export interface ProfileResponse {
    id?: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role?: string;
    isGuest?: boolean;
    createdAt?: string;
    stats?: {
        imagesUploaded?: number;
        imagesGenerated?: number;
        jobsFailed?: number;
        workspaces?: number;
    };
}
//# sourceMappingURL=types.d.ts.map