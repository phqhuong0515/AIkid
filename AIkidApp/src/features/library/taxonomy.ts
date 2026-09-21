export const AIKID_ASSET_TYPES = {
  character: 'aikid-character',
  storyPlot: 'aikid-story-plot',
  storyText: 'aikid-story-text',
  storyComic: 'aikid-story-comic',
  generatedImage: 'aikid-generated-image',
  uploadedImage: 'aikid-uploaded-image',
  mee: 'aikid-mee',
} as const;

export type AikidAssetType = typeof AIKID_ASSET_TYPES[keyof typeof AIKID_ASSET_TYPES];

export const AIKID_TAGS = {
  product: 'product:aikid',
  schema: 'schema:aikid-library-v1',
  character: 'kind:character',
  storyPlot: 'kind:story-plot',
  storyText: 'kind:story-text',
  storyComic: 'kind:story-comic',
  generatedImage: 'kind:generated-image',
  uploadedImage: 'kind:uploaded-image',
  mee: 'kind:mee',
  child: (id: string) => `child:${id}`,
  localId: (id: string) => `local-id:${encodeURIComponent(id)}`,
} as const;

export function buildAssetTags(input: {
  kind: Exclude<keyof typeof AIKID_TAGS, 'child' | 'localId' | 'product' | 'schema'>;
  childId?: string | null;
  localId?: string;
}): string {
  return [
    AIKID_TAGS.product,
    AIKID_TAGS.schema,
    AIKID_TAGS[input.kind],
    input.childId ? AIKID_TAGS.child(input.childId) : '',
    input.localId ? AIKID_TAGS.localId(input.localId) : '',
  ].filter(Boolean).join(',');
}

export function isAssetKind(
  asset: { assetType?: unknown; tags?: unknown; metadata?: unknown; meta?: unknown },
  kind: keyof typeof AIKID_ASSET_TYPES,
): boolean {
  const metadata = (
    asset.metadata && typeof asset.metadata === 'object' ? asset.metadata
      : asset.meta && typeof asset.meta === 'object' ? asset.meta
        : {}
  ) as Record<string, unknown>;
  const assetType = String(asset.assetType ?? metadata.assetType ?? '').toLowerCase();
  const tags = (Array.isArray(asset.tags) ? asset.tags : Array.isArray(metadata.tags) ? metadata.tags : [])
    .map(String)
    .map((tag) => tag.toLowerCase());
  const expectedTag = String(AIKID_TAGS[kind]).toLowerCase();
  return assetType === AIKID_ASSET_TYPES[kind] || tags.includes(expectedTag);
}
