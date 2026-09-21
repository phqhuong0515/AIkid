import { Platform } from 'react-native';

import { mediaApi } from '@/core/storymee';
import { resolveMediaUri } from '@/features/media/api/mediaHooks';
import { AIKID_ASSET_TYPES, buildAssetTags, isAssetKind } from '@/features/library/taxonomy';

import type { SavedCharacter } from '../types';

type RemoteAsset = Record<string, unknown>;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : typeof value === 'string' ? value.split(',') : [];
}

function isCharacterAsset(asset: RemoteAsset): boolean {
  const metadata = record(asset.metadata ?? asset.meta);
  const tags = strings(asset.tags ?? metadata.tags).map((tag) => tag.toLowerCase());
  const kind = String(
    asset.assetType ?? metadata.assetType ?? metadata.creativeKind ?? metadata.kind ?? '',
  ).toLowerCase();
  return isAssetKind(asset, 'character') ||
    kind.includes('character') ||
    tags.some((tag) => tag === 'character' || tag.startsWith('character:'));
}

function normalizedName(value: string): string {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('vi')
    .replace(/[-_]+/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizedUri(value?: string | null): string {
  return String(value || '').trim().replace(/[?#].*$/, '');
}

/**
 * DB is the source of truth; local characters are an offline cache.
 * Keep all remote rows, then add only local rows that do not represent the
 * same image/name. This prevents one save action appearing twice with two IDs.
 */
export function mergeCharacterLibrary(
  remote: SavedCharacter[],
  local: SavedCharacter[],
): SavedCharacter[] {
  const remoteUris = new Set(remote.flatMap((character) => [
    normalizedUri(character.fullbodyImgUri),
    normalizedUri(character.avatarUri),
  ].filter(Boolean)));
  const remoteNames = new Set(remote.map((character) => normalizedName(character.name)).filter(Boolean));
  const localSeen = new Set<string>();
  const uniqueLocal = local.filter((character) => {
    const uri = normalizedUri(character.fullbodyImgUri || character.avatarUri);
    const name = normalizedName(character.name);
    if ((uri && remoteUris.has(uri)) || (name && remoteNames.has(name))) return false;
    const key = uri ? `uri:${uri}` : name ? `name:${name}` : `id:${character.id}`;
    if (localSeen.has(key)) return false;
    localSeen.add(key);
    return true;
  });
  return [...remote, ...uniqueLocal];
}

export async function listRemoteCharacters(input: {
  ipId: string;
  childId?: string | null;
}): Promise<SavedCharacter[]> {
  const page = await mediaApi.listGallery({
    ipId: input.ipId,
    tag: input.childId ? `child:${input.childId}` : undefined,
    limit: 100,
    offset: 0,
  });

  return page.items.flatMap((item, index) => {
    const asset = item as RemoteAsset;
    if (!isCharacterAsset(asset)) return [];
    const metadata = record(asset.metadata ?? asset.meta);
    const uri = resolveMediaUri(String(
      asset.imageUrl ?? asset.previewUrl ?? asset.driveUrl ?? asset.url ?? '',
    ));
    if (!uri) return [];
    const originalName = String(metadata.characterName ?? metadata.originalName ?? asset.name ?? '');
    const name = originalName
      .replace(/^character-/, '')
      .replace(/-\d+\.(png|jpe?g|webp)$/i, '')
      .replace(/\.(png|jpe?g|webp)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || `Nhân vật ${index + 1}`;
    return [{
      id: String(asset.id ?? `remote-character-${index}`),
      name,
      description: String(metadata.description ?? ''),
      species: String(metadata.species ?? ''),
      avatarUri: uri,
      fullbodyImgUri: uri,
      source: 'ai' as const,
      childProfileId: input.childId ?? undefined,
      createdAt: String(asset.createdAt ?? new Date().toISOString()),
      userPrompt: String(metadata.prompt ?? ''),
    }];
  });
}

export async function saveCharacterToRemote(input: {
  imageUri: string;
  name: string;
  childId?: string | null;
  ipId: string;
}): Promise<string> {
  const safeName = input.name.trim().replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-|-$/g, '') || 'nhan-vat';
  const fileName = `character-${safeName}-${Date.now()}.png`;
  const form = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(input.imageUri);
    if (!response.ok) throw new Error('Không đọc được ảnh nhân vật để lưu vào Balo.');
    form.append('file', await response.blob(), fileName);
  } else {
    form.append('file', {
      uri: input.imageUri,
      name: fileName,
      type: 'image/png',
    } as unknown as Blob);
  }
  form.append('ipId', input.ipId);

  const result = await mediaApi.upload(form, {
    ipId: input.ipId,
    assetType: AIKID_ASSET_TYPES.character,
    tags: buildAssetTags({ kind: 'character', childId: input.childId }),
    permanent: 'true',
  });
  const uri = resolveMediaUri(String(result.imageUrl ?? result.url ?? ''));
  if (!uri) throw new Error('Đã lưu nhân vật nhưng DB không trả về ảnh.');
  return uri;
}
