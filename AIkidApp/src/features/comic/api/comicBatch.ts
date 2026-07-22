import { apiClient } from '@/core/api/client';
import { unwrapData } from '@/core/api/unwrap';

import type { ComicCharacter, ComicPage, ComicPanelStatus } from '../store/useComicDraft';

export type ComicBatchPanel = {
  panelId: string;
  order: number;
  status: ComicPanelStatus;
  jobId: string | null;
  imageUrl: string | null;
  error: string | null;
};

export type ComicBatch = {
  batchId: string;
  status: 'queued' | 'working' | 'composing' | 'done' | 'error';
  panels: ComicBatchPanel[];
  finalImageUrl: string | null;
  composeJobId: string | null;
  error: string | null;
};

type BatchPayload = {
  page: ComicPage;
  projectId: string;
  genre: string;
  artStyle: string;
  cast: ComicCharacter[];
  childProfileId: string;
  ipId: string;
};

const ROOT = 'api/v1/jobs/comic-batches';

function normalizeBatch(raw: unknown): ComicBatch {
  const value = unwrapData<Record<string, unknown>>(raw);
  const rawPanels = Array.isArray(value.panels) ? value.panels : [];
  const compose = value.compose && typeof value.compose === 'object'
    ? value.compose as Record<string, unknown>
    : {};
  const status: ComicBatch['status'] = value.status === 'done'
    ? 'done'
    : value.status === 'failed' || value.status === 'cancelled' || compose.status === 'failed'
      ? 'error'
      : compose.status === 'processing'
        ? 'composing'
        : value.status === 'processing'
          ? 'working'
          : 'queued';
  return {
    batchId: String(value.batchId || value.id || ''),
    status,
    panels: rawPanels.map((entry, index) => {
      const panel = entry && typeof entry === 'object' ? entry as Record<string, unknown> : {};
      const status = panel.status === 'done'
        ? 'done'
        : panel.status === 'failed' || panel.status === 'error'
          ? 'error'
          : panel.status === 'processing' || panel.status === 'working'
            ? 'working'
            : panel.status === 'queued' || panel.status === 'waiting'
              ? 'queued'
              : 'draft';
      return {
        panelId: String(panel.panelId || panel.id || ''),
        order: Number(panel.order) || index + 1,
        status,
        jobId: typeof panel.jobId === 'string' ? panel.jobId : null,
        imageUrl: typeof panel.imageUrl === 'string' ? panel.imageUrl : null,
        error: typeof panel.error === 'string' ? panel.error : null,
      };
    }),
    finalImageUrl: typeof value.finalImageUrl === 'string' ? value.finalImageUrl : typeof value.imageUrl === 'string' ? value.imageUrl : null,
    composeJobId: typeof value.composeJobId === 'string' ? value.composeJobId : null,
    error: typeof value.error === 'string' ? value.error : typeof compose.error === 'string' ? compose.error : null,
  };
}

export async function createComicBatch(input: BatchPayload): Promise<ComicBatch> {
  const { page } = input;
  const { data } = await apiClient.post(ROOT, {
    projectId: input.projectId,
    pageId: page.id,
    title: page.title || page.idea.slice(0, 240) || 'Trang truyện',
    idea: page.idea,
    panelCount: page.panelCount,
    genre: input.genre,
    artStyle: input.artStyle,
    childProfileId: input.childProfileId,
    ipId: input.ipId,
    panels: page.panels.map(({ id, order, action, speaker, dialogue }) => ({ id, order, action, speaker, dialogue })),
    cast: input.cast.map(({ id, name, role, personality, appearancePrompt, referenceImageUrl }) => ({ id, name, role, personality, appearancePrompt, referenceImageUrl })),
    referenceImageUrls: input.cast.map((item) => item.referenceImageUrl).filter((url): url is string => Boolean(url?.startsWith('http'))),
  });
  const batch = normalizeBatch(data);
  if (!batch.batchId) throw new Error('Backend không trả batchId');
  return batch;
}

export async function fetchComicBatch(batchId: string): Promise<ComicBatch> {
  const { data } = await apiClient.get(`${ROOT}/${encodeURIComponent(batchId)}`);
  return normalizeBatch(data);
}

export async function retryComicPanel(batchId: string, panelId: string): Promise<ComicBatch> {
  const { data } = await apiClient.post(`${ROOT}/${encodeURIComponent(batchId)}/panels/${encodeURIComponent(panelId)}/retry`);
  return normalizeBatch(data);
}

export async function pollComicBatch(batchId: string, onProgress: (batch: ComicBatch) => void, options?: { maxTicks?: number; pollMs?: number }): Promise<ComicBatch> {
  const maxTicks = options?.maxTicks ?? 180;
  const pollMs = options?.pollMs ?? 2500;
  for (let tick = 0; tick < maxTicks; tick += 1) {
    const batch = await fetchComicBatch(batchId);
    onProgress(batch);
    if (batch.status === 'done') {
      if (!batch.finalImageUrl) throw new Error('Ghép trang hoàn tất nhưng thiếu ảnh PNG');
      return batch;
    }
    if (batch.status === 'error') throw new Error(batch.error || 'Không tạo được trang truyện');
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error('Trang truyện đang xếp hàng quá lâu — có thể mở lại để xem tiếp');
}
