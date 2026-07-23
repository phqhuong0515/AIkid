import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';
import type { JobRecord, JobType } from '../core/types';
import { TERMINAL_FAIL, TERMINAL_OK } from '../core/types';

export type CreateGenerateJobInput = {
  jobType?: JobType;
  prompt: string;
  /** vertex | google-native | gflow | dreamina | … */
  provider?: string;
  ipId: string;
  /** @deprecated Identity is derived from the verified JWT by the gateway. */
  userId?: string;
  referenceImageUrls?: string[];
  childProfileId?: string;
  extraInputParams?: Record<string, unknown>;
};

export function normalizeOutputUrls(
  raw: JobRecord['outputUrls'],
): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
    } catch {
      if (
        raw.startsWith('http') ||
        raw.startsWith('sb://') ||
        raw.startsWith('/')
      ) {
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

export function firstOutputUrl(job: JobRecord | null | undefined): string | null {
  const urls = normalizeOutputUrls(job?.outputUrls);
  return urls[0] || null;
}

export function createGenerateApi(client: AxiosInstance) {
  return {
    async createJob(input: CreateGenerateJobInput): Promise<string> {
      const jobType = input.jobType || 'image';
      // Preferred provider hint only — hub/job-api owns keys + plan routing.
      // If omitted, job-api / plan defaultImageRoute may choose.
      const provider = input.provider || undefined;
      const refUrls = (input.referenceImageUrls || []).filter(Boolean);

      const inputParams: Record<string, unknown> = {
        prompt: input.prompt.trim(),
        ...(provider ? { provider } : {}),
        ...(input.extraInputParams || {}),
      };
      if (refUrls.length) {
        inputParams.reference_image_urls = refUrls;
        inputParams.reference_image_url = refUrls[0];
        inputParams.image_url = refUrls[0];
      }
      if (input.childProfileId) {
        inputParams.child_profile_id = input.childProfileId;
      }

      const headers: Record<string, string> = {};
      if (input.childProfileId) {
        headers['X-Child-Profile-Id'] = input.childProfileId;
      }

      const { data } = await client.post<unknown>(
        Paths.jobs,
        {
          jobType,
          ipId: input.ipId,
          inputParams,
        },
        Object.keys(headers).length ? { headers } : undefined,
      );

      const job = unwrapData<JobRecord>(data) ?? (data as JobRecord);
      const jobId = pickJobId(job);
      if (!jobId) throw new Error('Không nhận được Job ID từ server');
      return jobId;
    },

    async createImageJob(
      input: Omit<CreateGenerateJobInput, 'jobType'>,
    ): Promise<string> {
      return this.createJob({ ...input, jobType: 'image' });
    },

    async createVideoJob(
      input: Omit<CreateGenerateJobInput, 'jobType'>,
    ): Promise<string> {
      return this.createJob({ ...input, jobType: 'video' });
    },

    async getJob(jobId: string): Promise<JobRecord> {
      const { data } = await client.get<unknown>(Paths.job(jobId));
      const job = unwrapData<JobRecord>(data) ?? (data as JobRecord);
      if (!job?.status && !job?.id) {
        throw new Error('Phản hồi job không hợp lệ');
      }
      return { ...job, status: String(job.status || 'queued') };
    },

    isTerminalOk(status: string): boolean {
      return TERMINAL_OK.has(String(status || '').toLowerCase());
    },

    isTerminalFail(status: string): boolean {
      return TERMINAL_FAIL.has(String(status || '').toLowerCase());
    },
  };
}

export type GenerateApi = ReturnType<typeof createGenerateApi>;
