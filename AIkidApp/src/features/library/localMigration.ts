import AsyncStorage from '@react-native-async-storage/async-storage';

import { mediaApi } from '@/core/storymee';
import type { SavedCharacter } from '@/features/character/types';
import type { ComicLibraryItem } from '@/features/comic/store/useComicDraft';
import { saveComicStoryToBalo } from '@/features/comic/api/comicRemoteLibrary';

import { AIKID_ASSET_TYPES, AIKID_TAGS, buildAssetTags } from './taxonomy';

const CHARACTER_KEY = 'aikid.character.saved.v1';
const PLOT_KEY = 'aikid.comic.library.v2';
const PLOT_DRAFT_KEY = 'aikid.comic.project.v2';
const TEXT_KEY = 'aikid.comic.text-stories.v1';
const COMIC_KEY = 'aikid.comic.stories.v1';
const RECENT_AI_PREFIX = 'storymee.recent_ai_images.v1';

type JsonRecord = Record<string, unknown>;
export type LocalMigrationPreview = {
  characters: SavedCharacter[];
  plots: ComicLibraryItem[];
  draftPlots: JsonRecord[];
  textStories: JsonRecord[];
  comicStories: JsonRecord[];
  generatedImages: JsonRecord[];
  total: number;
};

function parseArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function inspectLocalLibrary(): Promise<LocalMigrationPreview> {
  const keys = await AsyncStorage.getAllKeys();
  const recentKeys = keys.filter((key) => key === RECENT_AI_PREFIX || key.startsWith(`${RECENT_AI_PREFIX}.child.`));
  const [characters, plots, draftPlot, textStories, comicStories, ...recentValues] = await Promise.all([
    AsyncStorage.getItem(CHARACTER_KEY),
    AsyncStorage.getItem(PLOT_KEY),
    AsyncStorage.getItem(PLOT_DRAFT_KEY),
    AsyncStorage.getItem(TEXT_KEY),
    AsyncStorage.getItem(COMIC_KEY),
    ...recentKeys.map((key) => AsyncStorage.getItem(key)),
  ]);
  const parsedDraft = draftPlot ? parseArray<JsonRecord>(`[${draftPlot}]`) : [];
  const draftPlots = parsedDraft.filter((draft) => {
    const pages = Array.isArray(draft.pages) ? draft.pages as JsonRecord[] : [];
    return pages.some((page) => String(page.idea ?? '').trim());
  });
  const generatedImages = recentValues.flatMap((raw) => parseArray<JsonRecord>(raw))
    .filter((item, index, all) => all.findIndex((candidate) => (
      String(candidate.id ?? candidate.uri) === String(item.id ?? item.uri)
    )) === index);
  const preview = {
    characters: parseArray<SavedCharacter>(characters),
    plots: parseArray<ComicLibraryItem>(plots),
    draftPlots,
    textStories: parseArray<JsonRecord>(textStories),
    comicStories: parseArray<JsonRecord>(comicStories),
    generatedImages,
  };
  return {
    ...preview,
    total: preview.characters.length + preview.plots.length + preview.draftPlots.length +
      preview.textStories.length + preview.comicStories.length + preview.generatedImages.length,
  };
}

function itemId(item: JsonRecord, fallback: string): string {
  return String(item.versionId ?? item.id ?? fallback);
}

async function uploadJsonRecord(input: {
  value: unknown;
  id: string;
  kind: 'storyPlot' | 'storyText' | 'storyComic';
  childId?: string | null;
  ipId: string;
}) {
  const fileName = `${input.kind}-${encodeURIComponent(input.id)}.json`;
  const form = new FormData();
  form.append('ipId', input.ipId);
  form.append('file', new Blob([JSON.stringify(input.value)], { type: 'application/json' }), fileName);
  await mediaApi.upload(form, {
    ipId: input.ipId,
    assetType: AIKID_ASSET_TYPES[input.kind],
    tags: buildAssetTags({ kind: input.kind, childId: input.childId, localId: input.id }),
    permanent: 'true',
  });
}

async function uploadCharacter(input: {
  character: SavedCharacter;
  childId?: string | null;
  ipId: string;
}) {
  if (!input.character.avatarUri) throw new Error(`Nhân vật “${input.character.name}” chưa có ảnh.`);
  const response = await fetch(input.character.avatarUri);
  if (!response.ok) throw new Error(`Không đọc được ảnh của “${input.character.name}”.`);
  const form = new FormData();
  form.append('ipId', input.ipId);
  form.append('file', await response.blob(), `character-${input.character.name}-${input.character.id}.png`);
  await mediaApi.upload(form, {
    ipId: input.ipId,
    assetType: AIKID_ASSET_TYPES.character,
    tags: buildAssetTags({
      kind: 'character',
      childId: input.character.childProfileId || input.childId,
      localId: input.character.id,
    }),
    permanent: 'true',
  });
}

async function uploadGeneratedImage(input: {
  item: JsonRecord;
  childId?: string | null;
  ipId: string;
  id: string;
}) {
  const uri = String(input.item.uri ?? input.item.imageUrl ?? input.item.url ?? '');
  if (!uri) throw new Error(`Ảnh AI ${input.id} không còn đường dẫn.`);
  const response = await fetch(uri);
  if (!response.ok) throw new Error(`Không đọc được ảnh AI ${input.id}.`);
  const form = new FormData();
  form.append('ipId', input.ipId);
  form.append('file', await response.blob(), `generated-image-${input.id}.png`);
  await mediaApi.upload(form, {
    ipId: input.ipId,
    assetType: AIKID_ASSET_TYPES.generatedImage,
    tags: buildAssetTags({ kind: 'generatedImage', childId: input.childId, localId: input.id }),
    permanent: 'true',
  });
}

export async function migrateLocalLibrary(input: {
  childId?: string | null;
  ipId: string;
  preview: LocalMigrationPreview;
  onProgress?: (done: number, total: number) => void;
}): Promise<{ uploaded: number; skipped: number; failed: string[] }> {
  const gallery = await mediaApi.listGallery({ ipId: input.ipId, limit: 100, offset: 0 });
  const remoteTags = new Set(gallery.items.flatMap((asset) => {
    const metadata = asset.metadata && typeof asset.metadata === 'object'
      ? asset.metadata as Record<string, unknown>
      : {};
    const tags = Array.isArray(asset.tags) ? asset.tags : Array.isArray(metadata.tags) ? metadata.tags : [];
    return tags.map(String);
  }));
  const remoteComicIds = new Set(gallery.items.flatMap((asset) => {
    const metadata = asset.metadata && typeof asset.metadata === 'object'
      ? asset.metadata as Record<string, unknown>
      : {};
    if (String(metadata.creativeKind || '').toLowerCase() !== 'comic') return [];
    try {
      const content = JSON.parse(String(metadata.content || '')) as JsonRecord;
      return content?.id ? [String(content.id)] : [];
    } catch {
      return [];
    }
  }));
  let uploaded = 0;
  let skipped = 0;
  let done = 0;
  const failed: string[] = [];

  const run = async (id: string, upload: () => Promise<void>, alreadyExists = remoteTags.has(AIKID_TAGS.localId(id))) => {
    if (alreadyExists) {
      skipped += 1;
    } else {
      try {
        await upload();
        uploaded += 1;
      } catch (error) {
        failed.push(error instanceof Error ? error.message : `Không đồng bộ được ${id}`);
      }
    }
    done += 1;
    input.onProgress?.(done, input.preview.total);
  };

  for (const character of input.preview.characters) {
    await run(character.id, () => uploadCharacter({ character, childId: input.childId, ipId: input.ipId }));
  }
  for (const [index, plot] of input.preview.plots.entries()) {
    const id = itemId(plot as unknown as JsonRecord, `plot-${index}`);
    await run(id, () => uploadJsonRecord({ value: plot, id, kind: 'storyPlot', childId: input.childId, ipId: input.ipId }));
  }
  for (const [index, plot] of input.preview.draftPlots.entries()) {
    const id = itemId(plot, `draft-plot-${index}`);
    await run(id, () => uploadJsonRecord({ value: plot, id, kind: 'storyPlot', childId: input.childId, ipId: input.ipId }));
  }
  for (const [index, story] of input.preview.textStories.entries()) {
    const id = itemId(story, `text-${index}`);
    await run(id, () => uploadJsonRecord({ value: story, id, kind: 'storyText', childId: input.childId, ipId: input.ipId }));
  }
  for (const [index, story] of input.preview.comicStories.entries()) {
    const id = itemId(story, `comic-${index}`);
    await run(id, async () => { await saveComicStoryToBalo({ ...story, id }); }, remoteComicIds.has(id));
  }
  for (const [index, item] of input.preview.generatedImages.entries()) {
    const id = itemId(item, `generated-${index}`);
    await run(id, () => uploadGeneratedImage({ item, id, childId: input.childId, ipId: input.ipId }));
  }
  return { uploaded, skipped, failed };
}
