"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfileApi = createProfileApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
function createProfileApi(client) {
    return {
        async getProfile() {
            const { data } = await client.get(paths_1.Paths.accountMe);
            const body = data;
            return body.user || (0, unwrap_1.unwrapData)(data) || {};
        },
        async updateProfile(input) {
            const { data } = await client.patch('/api/v1/account/profile', input);
            const body = data;
            return body.user || (0, unwrap_1.unwrapData)(data) || {};
        },
    };
}
//# sourceMappingURL=api.js.map