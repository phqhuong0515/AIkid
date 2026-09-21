import { apiClient } from '@/core/api/client';
import { mediaApi } from '@/core/storymee';
import { resolveMediaUri } from '@/features/media/api/mediaHooks';

export type RemoteComicStory = {
  id: string;
  title?: string;
  artStyle?: string;
  coverImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  remoteAssetId?: string;
  pages?: { id?: string; imageUrl?: string; jobId?: string; [key: string]: unknown }[];
  panels?: { id?: string; imageUrl?: string; jobId?: string; content?: string; [key: string]: unknown }[];
  [key: string]: unknown;
};

type GalleryAsset = Record<string, unknown>;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : typeof value === 'string' ? value.split(',').map((item) => item.trim()) : [];
}

function unwrapAssetId(payload: unknown): string {
  const root = record(payload);
  const data = record(root.data);
  const asset = record(data.asset ?? root.asset);
  return String(asset.id ?? asset.mediaId ?? '');
}

export async function saveComicStoryToBalo(story: RemoteComicStory): Promise<string> {
  const cover = String(story.coverImageUrl || story.pages?.find((page) => page.imageUrl)?.imageUrl || '');
  const { data } = await apiClient.post('api/v1/media/gallery/promote', {
    url: cover,
    purpose: 'creative_workshop',
    creativeKind: 'comic',
    title: story.title || 'Truyện tranh của em',
    content: JSON.stringify(story),
  });
  const assetId = unwrapAssetId(data);
  if (!assetId) throw new Error('Backend đã lưu nhưng không trả mã tác phẩm.');
  return assetId;
}

export function parseRemoteComicStories(items: unknown[]): RemoteComicStory[] {
  return items.flatMap((raw, index) => {
    const asset = record(raw) as GalleryAsset;
    const metadata = record(asset.metadata ?? asset.meta);
    const tags = strings(asset.tags ?? metadata.tags).map((tag) => tag.toLowerCase());
    const kind = String(metadata.creativeKind ?? asset.creativeKind ?? metadata.assetType ?? asset.assetType ?? '').toLowerCase();
    const purpose = String(metadata.purpose ?? asset.purpose ?? '').toLowerCase();
    const isComic = kind.includes('comic') || tags.some((tag) => tag.includes('story-comic') || tag.includes('comic-page'));
    if (!isComic || (purpose && purpose !== 'creative_workshop' && !tags.includes('kind:story-comic'))) return [];

    const content = String(metadata.content ?? asset.content ?? '');
    let parsed: RemoteComicStory | null = null;
    if (content) {
      try {
        const value = JSON.parse(content);
        if (value && typeof value === 'object') parsed = value as RemoteComicStory;
      } catch {
        parsed = null;
      }
    }
    const remoteAssetId = String(asset.id ?? `remote-comic-${index}`);
    const cover = resolveMediaUri(String(asset.imageUrl ?? asset.previewUrl ?? asset.driveUrl ?? asset.url ?? ''));
    return [{
      ...(parsed || {}),
      id: String(parsed?.id || remoteAssetId),
      remoteAssetId,
      title: parsed?.title || String(metadata.originalName ?? metadata.title ?? asset.name ?? 'Truyện tranh của em'),
      coverImageUrl: parsed?.coverImageUrl || cover || undefined,
      createdAt: parsed?.createdAt || String(asset.createdAt ?? ''),
    }];
  });
}

export async function listRemoteComicStories(input: { ipId: string; childId?: string | null }) {
  const page = await mediaApi.listGallery({
    ipId: input.ipId,
    tag: input.childId ? `child:${input.childId}` : undefined,
    limit: 100,
    offset: 0,
  });
  return parseRemoteComicStories(page.items);
}

export function mergeComicStories<T extends RemoteComicStory>(local: T[], remote: RemoteComicStory[]): (T | RemoteComicStory)[] {
  const remoteLocalIds = new Set(remote.map((story) => story.id));
  const remoteAssetIds = new Set(remote.map((story) => story.remoteAssetId).filter(Boolean));
  return [
    ...remote,
    ...local.filter((story) => !remoteLocalIds.has(story.id) && (!story.remoteAssetId || !remoteAssetIds.has(story.remoteAssetId))),
  ];
}
