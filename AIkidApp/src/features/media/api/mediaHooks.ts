import {
  useMutation,
  useInfiniteQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { apiClient } from '@/core/api/client';
import { mediaApi } from '@/core/storymee';
import { unwrapData } from '@/core/api/unwrap';
import { useWorkspace } from '@/core/workspace/useWorkspace';

/** Item media chuẩn hoá cho UI Gallery */
export type GalleryMediaItem = {
  id: string;
  uri: string;
  driveUrl?: string | null;
  assetType?: string | null;
  tags?: string[];
  createdAt?: string | null;
  width?: number | null;
  height?: number | null;
};

export type GalleryFilters = {
  ipId?: string;
  projectId?: string;
  universeId?: string;
  episodeId?: string;
  sceneId?: string;
  assetType?: string;
};

export type UploadMediaInput = {
  /** Local file URI (camera cache / image-picker) */
  uri: string;
  fileName?: string;
  mimeType?: string;
  ipId?: string;
};

export type UploadMediaResult = {
  url?: string;
  urls?: string[];
  imageUrl?: string;
  errors?: string[];
  [key: string]: unknown;
};

type GalleryPage = {
  items: GalleryMediaItem[];
  hasMore: boolean;
  nextOffset: number;
};

/** Raw asset từ core-media-api gallery */
type AssetRecord = {
  id?: string;
  driveUrl?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  previewUrl?: string | null;
  assetType?: string | null;
  tags?: string[] | null;
  createdAt?: string | null;
  width?: number | null;
  height?: number | null;
  [key: string]: unknown;
};

export const GALLERY_PAGE_SIZE = 30;

export const galleryQueryKey = (filters?: GalleryFilters) =>
  ['media', 'gallery', filters ?? {}] as const;

/**
 * Chuyển `sb://content-media/...` hoặc path tương đối → URL hiển thị được.
 * Upload media-api may return a relative public upload path → prefix Gateway.
 */
export function resolveMediaUri(raw?: string | null): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('file://') ||
    value.startsWith('data:')
  ) {
    return value;
  }

  if (value.startsWith('sb://')) {
    const withoutScheme = value.replace(/^sb:\/\//, '');
    const slash = withoutScheme.indexOf('/');
    if (slash === -1) return null;
    const bucket = withoutScheme.slice(0, slash);
    const objectPath = withoutScheme.slice(slash + 1);
    return `https://storage.storymee.com/${bucket}/${objectPath}`;
  }

  // Gateway-relative media public path (core-media-api library upload)
  if (
    value.startsWith('/internal/v1/media/') ||
    value.startsWith('/media/public/')
  ) {
    const base = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '';
    return base ? `${base}${value.startsWith('/') ? value : `/${value}`}` : value;
  }

  if (value.startsWith('/')) {
    const base = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '';
    return `${base}${value}`;
  }

  return value;
}

function normalizeAsset(
  raw: AssetRecord,
  index: number,
): GalleryMediaItem | null {
  const uri =
    resolveMediaUri(raw.imageUrl) ??
    resolveMediaUri(raw.previewUrl) ??
    resolveMediaUri(raw.driveUrl) ??
    resolveMediaUri(raw.url);

  if (!uri) return null;

  return {
    id: String(raw.id ?? `media-${index}`),
    uri,
    driveUrl: raw.driveUrl ?? raw.imageUrl ?? raw.url ?? null,
    assetType: raw.assetType ?? null,
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    createdAt: raw.createdAt ?? null,
    width: raw.width ?? null,
    height: raw.height ?? null,
  };
}

function extractAssetList(payload: unknown): AssetRecord[] {
  if (Array.isArray(payload)) return payload as AssetRecord[];
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (obj.data && typeof obj.data === 'object') {
      const data = obj.data as Record<string, unknown>;
      if (Array.isArray(data.items)) return data.items as AssetRecord[];
      if (Array.isArray(obj.data)) return obj.data as AssetRecord[];
    }
    if (Array.isArray(obj.assets)) return obj.assets as AssetRecord[];
    if (Array.isArray(obj.items)) return obj.items as AssetRecord[];
  }
  return [];
}

function extractPagination(
  payload: unknown,
  fetchedCount: number,
  offset: number,
  limit: number,
): { hasMore: boolean } {
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const data =
      obj.data && typeof obj.data === 'object'
        ? (obj.data as Record<string, unknown>)
        : obj;
    const pagination = data.pagination as
      | { hasMore?: boolean; total?: number; limit?: number; offset?: number }
      | undefined;
    if (pagination && typeof pagination.hasMore === 'boolean') {
      return { hasMore: pagination.hasMore };
    }
    if (pagination && typeof pagination.total === 'number') {
      const skip = pagination.offset ?? offset;
      return { hasMore: skip + fetchedCount < pagination.total };
    }
  }
  // Fallback: full page → có thể còn
  return { hasMore: fetchedCount >= limit };
}

function resolveIpId(explicit?: string): string {
  return explicit ?? useWorkspace.getState().getActiveIpId();
}

async function fetchGalleryPage(
  filters: GalleryFilters | undefined,
  offset: number,
): Promise<GalleryPage> {
  const limit = GALLERY_PAGE_SIZE;
  const ipId = resolveIpId(filters?.ipId);

  const { data } = await apiClient.get<unknown>('/api/v1/media/gallery', {
    params: {
      ipId,
      // Backend gallery: ipId / tag / isUsed / limit / offset
      limit,
      offset,
    },
  });

  const items = extractAssetList(data)
    .map(normalizeAsset)
    .filter((item): item is GalleryMediaItem => item != null);

  const { hasMore } = extractPagination(data, items.length, offset, limit);

  return {
    items,
    hasMore,
    nextOffset: offset + items.length,
  };
}

function guessFileName(uri: string, mimeType?: string): string {
  const fromUri = uri.split('/').pop()?.split('?')[0];
  if (fromUri && fromUri.includes('.')) return fromUri;

  const ext =
    mimeType === 'image/png'
      ? 'png'
      : mimeType === 'image/webp'
        ? 'webp'
        : 'jpg';
  return `photo-${Date.now()}.${ext}`;
}

function deepFindMediaUrl(obj: unknown, depth = 0): string | null {
  if (depth > 8 || obj == null) return null;
  if (typeof obj === 'string') {
    const s = obj.trim();
    if (!s) return null;
    if (
      /^https?:\/\//i.test(s) ||
      s.startsWith('sb://') ||
      s.startsWith('/internal/v1/media/') ||
      s.includes('/media/public/') ||
      s.includes('storage.storymee.com')
    ) {
      return s;
    }
    return null;
  }
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const hit = deepFindMediaUrl(item, depth + 1);
      if (hit) return hit;
    }
    return null;
  }
  if (typeof obj === 'object') {
    const rec = obj as Record<string, unknown>;
    for (const key of [
      'imageUrl',
      'url',
      'driveUrl',
      'previewUrl',
      'publicUrl',
      'fileUrl',
    ]) {
      if (typeof rec[key] === 'string') {
        const hit = deepFindMediaUrl(rec[key], depth + 1);
        if (hit) return hit;
      }
    }
    for (const key of Object.keys(rec)) {
      const hit = deepFindMediaUrl(rec[key], depth + 1);
      if (hit) return hit;
    }
  }
  return null;
}

/**
 * Pick fetchable URL from media-api upload response.
 * media-api returns relative `/internal/v1/media/public/uploads/...` — resolve to Gateway absolute.
 */
export function pickUploadPublicUrl(
  result: UploadMediaResult | Record<string, unknown> | null | undefined,
): string | null {
  if (!result) return null;
  const found = deepFindMediaUrl(result);
  if (!found) return null;
  const resolved = resolveMediaUri(found);
  if (!resolved) return null;
  if (resolved.startsWith('/')) {
    const base = apiClient.defaults.baseURL?.replace(/\/$/, '') ?? '';
    return base ? `${base}${resolved}` : resolved;
  }
  return resolved;
}

async function postMultipartUpload(formData: FormData): Promise<UploadMediaResult> {
  const { data } = await apiClient.post<unknown>(
    '/api/v1/media/upload',
    formData,
    {
      headers: {
        Accept: 'application/json',
      },
      transformRequest: [
        (body, headers) => {
          if (headers && typeof headers === 'object') {
            delete (headers as Record<string, unknown>)['Content-Type'];
          }
          return body;
        },
      ],
      timeout: 120_000,
    },
  );

  return unwrapData<UploadMediaResult>(data) ?? (data as UploadMediaResult);
}

export async function uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult> {
  const mimeType = input.mimeType ?? 'image/jpeg';
  const fileName = input.fileName ?? guessFileName(input.uri, mimeType);
  const ipId = resolveIpId(input.ipId);

  const formData = new FormData();
  // Text fields TRƯỚC file (fastify-multipart)
  formData.append('ipId', ipId);
  formData.append(
    'file',
    {
      uri: input.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob,
  );

  return postMultipartUpload(formData);
}

/**
 * Web path: upload real Blob|File to core-media-api via Gateway.
 * Prefer this for data URLs and browser files.
 */
export async function uploadMediaBlob(input: {
  blob: Blob;
  fileName?: string;
  mimeType?: string;
  ipId?: string;
}): Promise<UploadMediaResult> {
  const mimeType = input.mimeType ?? input.blob.type ?? 'image/png';
  const fileName =
    input.fileName ??
    `aikid-${Date.now()}.${mimeType.includes('png') ? 'png' : 'jpg'}`;
  const ipId = resolveIpId(input.ipId);

  const formData = new FormData();
  formData.append('ipId', ipId);
  formData.append('file', input.blob, fileName);

  return postMultipartUpload(formData);
}

/** data:URL → Blob → media-api → HTTPS public URL (never pass raw data URL to jobs) */
export async function uploadDataUrlAsPublicRef(
  dataUrl: string,
  options?: { fileName?: string; ipId?: string },
): Promise<string> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Ảnh không hợp lệ (cần data URL)');
  }
  const mimeType = match[1] || 'image/png';
  const b64 = match[2];
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mimeType });

  const uploaded = await uploadMediaBlob({
    blob,
    mimeType,
    fileName: options?.fileName,
    ipId: options?.ipId,
  });
  const publicUrl = pickUploadPublicUrl(uploaded);
  if (!publicUrl || !publicUrl.startsWith('http')) {
    throw new Error('Upload media thành công nhưng không lấy được URL công khai');
  }
  return publicUrl;
}

/**
 * Camera/library URI -> permanent media asset -> public HTTPS job reference.
 * Native pickers normally return file:// without base64; web normally returns blob:.
 */
export async function uploadPickedImageAsPublicRef(input: {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  childId: string;
  ipId: string;
  assetType?: string;
}): Promise<string> {
  const mimeType = input.mimeType || 'image/jpeg';
  const fileName = input.fileName || guessFileName(input.uri, mimeType);
  const form = new FormData();

  if (input.uri.startsWith('data:') || input.uri.startsWith('blob:')) {
    const response = await fetch(input.uri);
    if (!response.ok) throw new Error('Không đọc được ảnh đã chọn');
    const blob = await response.blob();
    form.append('file', blob, fileName);
  } else {
    form.append('file', {
      uri: input.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);
  }
  form.append('ipId', input.ipId);

  const uploaded = await mediaApi.upload(form, {
    ipId: input.ipId,
    assetType: input.assetType ?? 'uploaded',
    tags: `child:${input.childId},art-reference`,
    permanent: 'true',
  });
  const publicUrl = pickUploadPublicUrl(uploaded);
  if (!publicUrl?.startsWith('http')) {
    throw new Error('Đã tải ảnh nhưng không nhận được URL công khai');
  }
  return publicUrl;
}

/**
 * Infinite gallery — offset/limit khớp core-media-api.
 */
export function useGallery(filters?: GalleryFilters, options?: { enabled?: boolean }) {
  const activeIpId = useWorkspace((s) => s.activeIpId);
  const resolvedFilters: GalleryFilters = {
    ...filters,
    ipId: filters?.ipId ?? activeIpId ?? undefined,
  };

  return useInfiniteQuery({
    queryKey: galleryQueryKey(resolvedFilters),
    queryFn: ({ pageParam }) =>
      fetchGalleryPage(resolvedFilters, pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    enabled: (options?.enabled ?? true) && !!resolveIpId(resolvedFilters.ipId),
  });
}

export function useUploadMedia(): UseMutationResult<
  UploadMediaResult,
  Error,
  UploadMediaInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
    },
  });
}

/**
 * AI images từ job list (client-filter tạm).
 * Backend nên filter jobType+status server-side về sau.
 */
async function fetchAiImagesPage(offset: number): Promise<GalleryPage> {
  const limit = GALLERY_PAGE_SIZE;
  const page = Math.floor(offset / limit) + 1;

  try {
    const { data } = await apiClient.get<unknown>('/api/v1/jobs', {
      params: { limit, page },
    });

    // Response shape: { status, data: Job[] | [], jobs?: Job[] }
    // JWT user thường nhận data=[] (filter Hub API key) — không throw.
    const body = data as Record<string, unknown> | unknown[] | null;
    let jobs: unknown[] = [];
    if (Array.isArray(body)) {
      jobs = body;
    } else if (body && typeof body === 'object') {
      const unwrapped = unwrapData<unknown>(body);
      if (Array.isArray(unwrapped)) jobs = unwrapped;
      else if (Array.isArray((body as { jobs?: unknown }).jobs)) {
        jobs = (body as { jobs: unknown[] }).jobs;
      } else if (
        unwrapped &&
        typeof unwrapped === 'object' &&
        Array.isArray((unwrapped as { items?: unknown }).items)
      ) {
        jobs = (unwrapped as { items: unknown[] }).items;
      }
    }

    const items = (jobs as Array<Record<string, unknown>>)
      .filter((job) => {
        if (!job || typeof job !== 'object') return false;
        const status = String(job.status || '').toLowerCase();
        const isDone =
          status === 'done' || status === 'success' || status === 'completed';
        if (job.jobType !== 'image' || !isDone) return false;
        const urls = job.outputUrls;
        if (Array.isArray(urls)) return urls.length > 0;
        if (typeof urls === 'string' && urls.length > 2) return true;
        return false;
      })
      .map((job, index): GalleryMediaItem | null => {
        let first: string | null = null;
        const urls = job.outputUrls;
        if (Array.isArray(urls) && urls[0]) first = String(urls[0]);
        else if (typeof urls === 'string') {
          try {
            const parsed = JSON.parse(urls);
            if (Array.isArray(parsed) && parsed[0]) first = String(parsed[0]);
            else first = urls;
          } catch {
            first = urls;
          }
        }
        const uri = resolveMediaUri(first);
        if (!uri) return null;
        return {
          id: String(job.id ?? job.jobId ?? `ai-${offset}-${index}`),
          uri,
          createdAt: (job.createdAt as string) ?? null,
          assetType: 'ai-image',
        };
      })
      .filter((item): item is GalleryMediaItem => item != null);

    const rawCount = jobs.length;
    // JWT list rỗng: hasMore=false — tránh loop infinite query
    const hasMore = rawCount >= limit;

    return {
      items,
      hasMore,
      nextOffset: offset + limit,
    };
  } catch (err) {
    // Không làm crash tab Ảnh AI — UI vẫn hiện recent local
    console.warn('[useAiImages] fetch failed', err);
    return {
      items: [],
      hasMore: false,
      nextOffset: offset + limit,
    };
  }
}

export function useAiImages(options?: {
  enabled?: boolean;
  childId?: string | null;
  ipId?: string | null;
}) {
  return useInfiniteQuery({
    queryKey: ['media', 'ai-images', options?.childId ?? null, options?.ipId ?? null],
    queryFn: ({ pageParam }) => fetchAiImagesPage(pageParam as number),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextOffset : undefined,
    enabled: options?.enabled ?? true,
  });
}
