"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOutputUrls = normalizeOutputUrls;
exports.pickJobId = pickJobId;
exports.firstOutputUrl = firstOutputUrl;
exports.createGenerateApi = createGenerateApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
const types_1 = require("../core/types");
function normalizeOutputUrls(raw) {
    if (!raw)
        return [];
    if (Array.isArray(raw))
        return raw.map(String).filter(Boolean);
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed))
                return parsed.map(String).filter(Boolean);
        }
        catch {
            if (raw.startsWith('http') ||
                raw.startsWith('sb://') ||
                raw.startsWith('/')) {
                return [raw];
            }
        }
    }
    return [];
}
function pickJobId(job) {
    if (!job)
        return null;
    return job.id || job.jobId || null;
}
function firstOutputUrl(job) {
    const urls = normalizeOutputUrls(job?.outputUrls);
    return urls[0] || null;
}
function createGenerateApi(client) {
    return {
        async createJob(input) {
            const jobType = input.jobType || 'image';
            // Preferred provider hint only — hub/job-api owns keys + plan routing.
            // If omitted, job-api / plan defaultImageRoute may choose.
            const provider = input.provider || undefined;
            const refUrls = (input.referenceImageUrls || []).filter(Boolean);
            const inputParams = {
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
            const headers = {};
            if (input.childProfileId) {
                headers['X-Child-Profile-Id'] = input.childProfileId;
            }
            const { data } = await client.post(paths_1.Paths.jobs, {
                jobType,
                ipId: input.ipId,
                inputParams,
            }, Object.keys(headers).length ? { headers } : undefined);
            const job = (0, unwrap_1.unwrapData)(data) ?? data;
            const jobId = pickJobId(job);
            if (!jobId)
                throw new Error('Không nhận được Job ID từ server');
            return jobId;
        },
        async createImageJob(input) {
            return this.createJob({ ...input, jobType: 'image' });
        },
        async createVideoJob(input) {
            return this.createJob({ ...input, jobType: 'video' });
        },
        async getJob(jobId) {
            const { data } = await client.get(paths_1.Paths.job(jobId));
            const job = (0, unwrap_1.unwrapData)(data) ?? data;
            if (!job?.status && !job?.id) {
                throw new Error('Phản hồi job không hợp lệ');
            }
            return { ...job, status: String(job.status || 'queued') };
        },
        isTerminalOk(status) {
            return types_1.TERMINAL_OK.has(String(status || '').toLowerCase());
        },
        isTerminalFail(status) {
            return types_1.TERMINAL_FAIL.has(String(status || '').toLowerCase());
        },
    };
}
//# sourceMappingURL=api.js.map