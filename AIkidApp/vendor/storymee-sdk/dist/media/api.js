"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMediaApi = createMediaApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
function extractItems(payload) {
    if (Array.isArray(payload))
        return payload;
    if (!payload || typeof payload !== 'object')
        return [];
    const body = payload;
    const inner = (0, unwrap_1.unwrapData)(payload);
    if (Array.isArray(inner))
        return inner;
    if (inner && typeof inner === 'object' && Array.isArray(inner.items)) {
        return inner.items;
    }
    if (Array.isArray(body.assets))
        return body.assets;
    if (Array.isArray(body.items))
        return body.items;
    return [];
}
function createMediaApi(client) {
    return {
        async listGallery(params) {
            const { data } = await client.get(paths_1.Paths.mediaGallery, { params });
            const inner = (0, unwrap_1.unwrapData)(data);
            return {
                items: extractItems(data),
                pagination: (inner?.pagination || data?.pagination),
            };
        },
        async upload(formData, params) {
            const { data } = await client.post(paths_1.Paths.mediaUpload, formData, {
                params,
                headers: { Accept: 'application/json' },
                transformRequest: [(body, headers) => {
                        if (headers && typeof headers === 'object')
                            delete headers['Content-Type'];
                        return body;
                    }],
                timeout: 120000,
            });
            return (0, unwrap_1.unwrapData)(data) ?? data;
        },
    };
}
//# sourceMappingURL=api.js.map