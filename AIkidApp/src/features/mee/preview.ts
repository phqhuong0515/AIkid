import { mediaApi } from '@/core/storymee';
import { pickUploadPublicUrl } from '@/features/media/api/mediaHooks';
import { buildMeeAssetSvg } from './composer';
import type { MeeDraft } from './types';

export function buildMeePreviewSvg(draft: MeeDraft): string {
  return buildMeeAssetSvg(draft);
}

export async function uploadMeePreview(draft: MeeDraft, options: { childId: string; ipId: string }): Promise<string> {
  const svg = buildMeePreviewSvg(draft);
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const form = new FormData();
  form.append('file', blob, `mee-${options.childId}-${Date.now()}.svg`);
  form.append('ipId', options.ipId);
  const result = await mediaApi.upload(form, { ipId: options.ipId, assetType: 'uploaded', tags: `child:${options.childId},mee`, permanent: 'true' });
  const url = pickUploadPublicUrl(result);
  if (!url) throw new Error('Đã lưu Mee nhưng không nhận được URL công khai');
  return url;
}
