import type { AxiosInstance } from 'axios';
export type NotificationMessage = {
    id: string;
    topic: string;
    title: string;
    body: string;
    data: Record<string, unknown>;
    readAt?: string | null;
    createdAt: string;
};
export declare function createNotificationsApi(client: AxiosInstance): {
    list(params?: {
        unreadOnly?: boolean;
        limit?: number;
    }): Promise<{
        items: NotificationMessage[];
        unreadCount: number;
    }>;
    markRead(id: string): Promise<NotificationMessage>;
    markAllRead(): Promise<number>;
    getPreferences(): Promise<Record<string, unknown>>;
    updatePreferences(input: {
        locale?: "vi" | "en";
        inboxEnabled?: boolean;
        pushEnabled?: boolean;
        emailEnabled?: boolean;
        timezone?: string;
        quietStart?: string | null;
        quietEnd?: string | null;
    }): Promise<Record<string, unknown>>;
    registerDevice(input: {
        platform: "ios" | "android" | "web";
        token: string;
    }): Promise<Record<string, unknown>>;
    revokeDevice(id: string): Promise<void>;
};
export type NotificationsApi = ReturnType<typeof createNotificationsApi>;
//# sourceMappingURL=api.d.ts.map