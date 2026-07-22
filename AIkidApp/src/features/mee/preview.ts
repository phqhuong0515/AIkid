import { mediaApi } from '@/core/storymee';
import { pickUploadPublicUrl } from '@/features/media/api/mediaHooks';
import { SKIN_TONE_COLORS } from './skinTones';
import type { MeeDraft } from './types';

const HAIR = ['#3B2416', '#6B3E26', '#111827', '#D97706', '#F3D36A', '#F7A8B8'];
const SHIRTS = ['#FB7185', '#38BDF8', '#A78BFA', '#34D399', '#FBBF24'];

export function buildMeePreviewSvg(draft: MeeDraft): string {
  const skin = SKIN_TONE_COLORS[draft.skinTone] ?? '#F4C7A1';
  const hair = HAIR[draft.hairColor % HAIR.length];
  const shirt = SHIRTS[draft.shirtColor % SHIRTS.length];
  const eye = draft.eyes % 2 === 0 ? 'circle' : 'ellipse';
  const eyeRy = draft.eyes % 2 === 0 ? 10 : 15;
  const smile = draft.mouth % 2 === 0 ? 'M205 270 Q256 305 307 270' : 'M215 275 Q256 290 297 275';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="64" fill="${draft.backgroundColor}"/><path d="M100 512V420c0-80 312-80 312 0v92" fill="${shirt}"/><ellipse cx="256" cy="235" rx="142" ry="165" fill="${skin}" stroke="${hair}" stroke-width="24"/><path d="M120 185Q155 45 256 55Q360 45 392 185Q330 120 256 135Q180 115 120 185" fill="${hair}"/><${eye} cx="205" cy="220" r="10" rx="10" ry="${eyeRy}" fill="#1F2937"/><${eye} cx="307" cy="220" r="10" rx="10" ry="${eyeRy}" fill="#1F2937"/><path d="${smile}" fill="none" stroke="#E11D48" stroke-width="12" stroke-linecap="round"/><circle cx="256" cy="252" r="8" fill="#E9A578"/></svg>`;
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
