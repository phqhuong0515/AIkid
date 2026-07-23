import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';

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
  pagination?: { hasMore?: boolean; total?: number; limit?: number; offset?: number };
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

function extractItems(payload: unknown): MediaAsset[] {
  if (Array.isArray(payload)) return payload as MediaAsset[];
  if (!payload || typeof payload !== 'object') return [];
  const body = payload as Record<string, unknown>;
  const inner = unwrapData<unknown>(payload);
  if (Array.isArray(inner)) return inner as MediaAsset[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as { items?: unknown }).items)) {
    return (inner as { items: MediaAsset[] }).items;
  }
  if (Array.isArray(body.assets)) return body.assets as MediaAsset[];
  if (Array.isArray(body.items)) return body.items as MediaAsset[];
  return [];
}

export function createMediaApi(client: AxiosInstance) {
  return {
    async listGallery(params: Record<string, string | number | undefined>): Promise<MediaGalleryPage> {
      const { data } = await client.get<unknown>(Paths.mediaGallery, { params });
      const inner = unwrapData<Record<string, unknown>>(data);
      return {
        items: extractItems(data),
        pagination: (inner?.pagination || (data as Record<string, unknown>)?.pagination) as MediaGalleryPage['pagination'],
      };
    },

    async upload(formData: FormData, params?: MediaUploadParams): Promise<MediaUploadResult> {
      const { data } = await client.post<unknown>(Paths.mediaUpload, formData, {
        params,
        headers: { Accept: 'application/json' },
        transformRequest: [(body, headers) => {
          if (headers && typeof headers === 'object') delete (headers as Record<string, unknown>)['Content-Type'];
          return body;
        }],
        timeout: 120_000,
      });
      return unwrapData<MediaUploadResult>(data) ?? (data as MediaUploadResult);
    },
  };
}

export type MediaApi = ReturnType<typeof createMediaApi>;
