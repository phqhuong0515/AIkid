import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';

export type NotificationMessage = {
  id: string;
  topic: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt?: string | null;
  createdAt: string;
};

export function createNotificationsApi(client: AxiosInstance) {
  return {
    async list(params?: { unreadOnly?: boolean; limit?: number }) {
      const { data } = await client.get<unknown>(Paths.notifications, { params });
      return unwrapData<{
        items: NotificationMessage[];
        unreadCount: number;
      }>(data);
    },
    async markRead(id: string): Promise<NotificationMessage> {
      const { data } = await client.post<unknown>(Paths.notificationRead(id));
      return unwrapData<{ notification: NotificationMessage }>(data).notification;
    },
    async markAllRead(): Promise<number> {
      const { data } = await client.post<unknown>(Paths.notificationsReadAll);
      return unwrapData<{ updated: number }>(data).updated;
    },
    async getPreferences(): Promise<Record<string, unknown>> {
      const { data } = await client.get<unknown>(Paths.notificationPreferences);
      return unwrapData<{ preference: Record<string, unknown> }>(data).preference;
    },
    async updatePreferences(input: {
      locale?: 'vi' | 'en';
      inboxEnabled?: boolean;
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      timezone?: string;
      quietStart?: string | null;
      quietEnd?: string | null;
    }): Promise<Record<string, unknown>> {
      const { data } = await client.put<unknown>(
        Paths.notificationPreferences,
        input,
      );
      return unwrapData<{ preference: Record<string, unknown> }>(data).preference;
    },
    async registerDevice(input: {
      platform: 'ios' | 'android' | 'web';
      token: string;
    }): Promise<Record<string, unknown>> {
      const { data } = await client.post<unknown>(Paths.notificationDevices, input);
      return unwrapData<{ device: Record<string, unknown> }>(data).device;
    },
    async revokeDevice(id: string): Promise<void> {
      await client.delete(Paths.notificationDevice(id));
    },
  };
}

export type NotificationsApi = ReturnType<typeof createNotificationsApi>;
