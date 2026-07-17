import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { apiClient } from '@/core/api/client';
import { unwrapData } from '@/core/api/unwrap';
import { useWorkspace } from '@/core/workspace/useWorkspace';
import { resolveMediaUri } from '@/features/media/api/mediaHooks';

export type JobStatus =
  | 'queued'
  | 'pending'
  | 'working'
  | 'done'
  | 'success'
  | 'completed'
  | 'failed'
  | 'error'
  | 'cancelled'
  | 'canceled'
  | string;

export type JobRecord = {
  id?: string;
  jobId?: string;
  status: JobStatus;
  outputUrls?: string[] | string | null;
  errorMessage?: string | null;
  jobType?: string;
  inputParams?: Record<string, unknown>;
  createdAt?: string;
};

export type CreateImageJobInput = {
  prompt: string;
  /** Default: google-native (Imagen/Gemini path trên core-job-api) */
  provider?: string;
  ipId?: string;
  /** Public URLs (đã upload) — gflow/sdk/google-native */
  referenceImageUrls?: string[];
  /** Family: gắn job với hồ sơ con */
  childProfileId?: string;
};

export const TERMINAL_OK = new Set(['done', 'success', 'completed']);
export const TERMINAL_FAIL = new Set([
  'failed',
  'error',
  'cancelled',
  'canceled',
]);

export function normalizeOutputUrls(
  raw: JobRecord['outputUrls'],
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(String).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      if (raw.startsWith('http') || raw.startsWith('sb://') || raw.startsWith('/')) {
        return [raw];
      }
    }
  }
  return [];
}

export function pickJobId(job: JobRecord | null | undefined): string | null {
  if (!job) return null;
  return job.id || job.jobId || null;
}

export function firstOutputUri(job: JobRecord | null | undefined): string | null {
  if (!job) return null;
  const urls = normalizeOutputUrls(job.outputUrls);
  if (!urls.length) return null;
  return resolveMediaUri(urls[0]);
}

/** Create image job via Gateway → core-job-api (same as MobileApp) */
export async function createImageJob(input: CreateImageJobInput): Promise<string> {
  const ipId =
    input.ipId ?? useWorkspace.getState().getActiveIpId();
  const provider = input.provider ?? 'google-native';
  const refUrls = (input.referenceImageUrls || []).filter(Boolean);

  const inputParams: Record<string, unknown> = {
    prompt: input.prompt.trim(),
    provider,
  };

  if (refUrls.length > 0) {
    inputParams.reference_image_urls = refUrls;
    inputParams.reference_image_url = refUrls[0];
    inputParams.image_url = refUrls[0];
  }
  if (input.childProfileId) {
    inputParams.child_profile_id = input.childProfileId;
  }

  const { data } = await apiClient.post<unknown>(
    '/internal/v1/jobs',
    {
      jobType: 'image',
      ipId,
      inputParams,
    },
    input.childProfileId
      ? { headers: { 'X-Child-Profile-Id': input.childProfileId } }
      : undefined,
  );

  const job =
    unwrapData<JobRecord>(data) ?? (data as JobRecord);
  const jobId = pickJobId(job);
  if (!jobId) {
    throw new Error('Không nhận được Job ID từ server');
  }
  return jobId;
}

export async function fetchJob(jobId: string): Promise<JobRecord> {
  const { data } = await apiClient.get<unknown>(`/internal/v1/jobs/${jobId}`);
  const job = unwrapData<JobRecord>(data) ?? (data as JobRecord);
  if (!job?.status && !job?.id) {
    throw new Error('Phản hồi job không hợp lệ');
  }
  return {
    ...job,
    status: String(job.status || 'queued'),
  };
}

/** Poll until terminal status or timeout (~3 min default). */
export async function pollJobUntilDone(
  jobId: string,
  options?: { maxTicks?: number; pollMs?: number; signal?: AbortSignal },
): Promise<JobRecord> {
  const maxTicks = options?.maxTicks ?? 72;
  const pollMs = options?.pollMs ?? 2500;

  for (let i = 0; i < maxTicks; i++) {
    if (options?.signal?.aborted) {
      throw new Error('Đã huỷ chờ job');
    }
    const job = await fetchJob(jobId);
    const status = String(job.status || '').toLowerCase();
    if (TERMINAL_OK.has(status)) return job;
    if (TERMINAL_FAIL.has(status)) {
      throw new Error(job.errorMessage || `Job thất bại (${status})`);
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
  throw new Error('Job quá lâu — thử lại sau');
}

/** Mutation tạo job image */
export function useCreateImageJob() {
  return useMutation({
    mutationFn: createImageJob,
  });
}

/**
 * Poll job status mỗi 2.5s cho đến terminal / timeout.
 * @param jobId active job
 * @param maxTicks default 72 (~3 phút)
 */
export function useJobStatus(
  jobId: string | null,
  options?: { maxTicks?: number; pollMs?: number },
) {
  const maxTicks = options?.maxTicks ?? 72;
  const pollMs = options?.pollMs ?? 2500;
  let ticks = 0;

  return useQuery({
    queryKey: ['jobs', 'status', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      return fetchJob(jobId);
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = String(query.state.data?.status || '').toLowerCase();
      if (TERMINAL_OK.has(status) || TERMINAL_FAIL.has(status)) {
        return false;
      }
      ticks += 1;
      if (ticks >= maxTicks) return false;
      return pollMs;
    },
  });
}

/** Invalidate media caches sau khi gen xong */
export function useInvalidateMediaAfterJob() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['media', 'gallery'] });
    void queryClient.invalidateQueries({ queryKey: ['media', 'ai-images'] });
    void queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };
}
