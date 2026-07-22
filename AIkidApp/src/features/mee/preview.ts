import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { mediaApi } from '@/core/storymee';
import { pickUploadPublicUrl } from '@/features/media/api/mediaHooks';
import { buildMeeAssetSvg } from './composer';
import type { MeeDraft } from './types';

export function buildMeePreviewSvg(draft: MeeDraft): string {
  return buildMeeAssetSvg(draft);
}

export async function uploadMeePreview(draft: MeeDraft, options: { childId: string; ipId: string }): Promise<string> {
  const svg = buildMeePreviewSvg(draft);
  const form = new FormData();
  const fileName = `mee-${options.childId}-${Date.now()}.svg`;
  form.append('ipId', options.ipId);
  let cacheFile: File | null = null;
  try {
    if (Platform.OS === 'web') {
      form.append('file', new Blob([svg], { type: 'image/svg+xml' }), fileName);
    } else {
      // React Native multipart requires a real file URI. Passing a browser
      // Blob here makes Axios fail with the opaque "Network Error" message.
      cacheFile = new File(Paths.cache, fileName);
      cacheFile.create({ overwrite: true, intermediates: true });
      cacheFile.write(svg);
      form.append('file', {
        uri: cacheFile.uri,
        name: fileName,
        type: 'image/svg+xml',
      } as unknown as Blob);
    }
    const result = await mediaApi.upload(form, { ipId: options.ipId, assetType: 'uploaded', tags: `child:${options.childId},mee`, permanent: 'true' });
    const url = pickUploadPublicUrl(result);
    if (!url) throw new Error('Đã lưu Mee nhưng không nhận được URL công khai');
    return url;
  } finally {
    if (cacheFile?.exists) cacheFile.delete();
  }
}
