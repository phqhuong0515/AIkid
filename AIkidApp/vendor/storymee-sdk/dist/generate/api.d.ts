import type { AxiosInstance } from 'axios';
import type { JobRecord, JobType } from '../core/types';
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
export declare function normalizeOutputUrls(raw: JobRecord['outputUrls']): string[];
export declare function pickJobId(job: JobRecord | null | undefined): string | null;
export declare function firstOutputUrl(job: JobRecord | null | undefined): string | null;
export declare function createGenerateApi(client: AxiosInstance): {
    createJob(input: CreateGenerateJobInput): Promise<string>;
    createImageJob(input: Omit<CreateGenerateJobInput, "jobType">): Promise<string>;
    createVideoJob(input: Omit<CreateGenerateJobInput, "jobType">): Promise<string>;
    getJob(jobId: string): Promise<JobRecord>;
    isTerminalOk(status: string): boolean;
    isTerminalFail(status: string): boolean;
};
export type GenerateApi = ReturnType<typeof createGenerateApi>;
//# sourceMappingURL=api.d.ts.map