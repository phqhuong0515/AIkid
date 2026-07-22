/**
 * Shared creative image gen — same stack as StoryMeeMobileApp:
 * 1) optional ref → SDK media upload through `/api/v1`
 * 2) SDK create image job through `/api/v1`
 * 3) SDK polls the job through `/api/v1`
 */

import {
  createImageJob,
  firstOutputUri,
  pollJobUntilDone,
} from '@/features/jobs/api/jobHooks';
import { uploadDataUrlAsPublicRef } from '@/features/media/api/mediaHooks';

export type CreativeGenerateInput = {
  /** User-facing prompt only (no server STYLE_PROMPT secrets) */
  userPrompt: string;
  /** Optional data-URL or already-public https ref */
  referenceDataUrl?: string | null;
  referenceHttpsUrl?: string | null;
  provider?: string;
  childProfileId?: string;
  ipId?: string;
  signal?: AbortSignal;
};

export type CreativeGenerateResult = {
  jobId: string;
  imageUrl: string;
};

export async function generateImageViaGateway(
  input: CreativeGenerateInput,
): Promise<CreativeGenerateResult> {
  const prompt = input.userPrompt.trim();
  if (!prompt) {
    throw new Error('Cần mô tả / prompt để tạo ảnh');
  }

  const refs: string[] = [];
  if (input.referenceHttpsUrl?.startsWith('http')) {
    refs.push(input.referenceHttpsUrl);
  } else if (input.referenceDataUrl?.startsWith('data:')) {
    const publicUrl = await uploadDataUrlAsPublicRef(input.referenceDataUrl, {
      fileName: `aikid-ref-${Date.now()}.png`,
      ipId: input.ipId,
    });
    refs.push(publicUrl);
  }

  const jobId = await createImageJob({
    prompt,
    provider: input.provider,
    ipId: input.ipId,
    referenceImageUrls: refs.length ? refs : undefined,
    childProfileId: input.childProfileId,
  });

  const job = await pollJobUntilDone(jobId, { signal: input.signal });
  const imageUrl = firstOutputUri(job);
  if (!imageUrl) {
    throw new Error('Job xong nhưng không có URL ảnh');
  }

  return { jobId, imageUrl };
}

/** Character prompt wrapper for job-api (user fields already in base) */
export function buildCharacterJobPrompt(userPrompt: string): string {
  const base = userPrompt.trim();
  return [
    base,
    'Single character only, full body preferred, centered,',
    'plain white or simple pastel background, no multi-view turnaround,',
    'no character sheet, stylized 3D cartoon, kid-friendly.',
  ].join(' ');
}
