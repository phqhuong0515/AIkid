"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationsApi = createNotificationsApi;
const paths_1 = require("../core/paths");
const unwrap_1 = require("../core/unwrap");
function createNotificationsApi(client) {
    return {
        async list(params) {
            const { data } = await client.get(paths_1.Paths.notifications, { params });
            return (0, unwrap_1.unwrapData)(data);
        },
        async markRead(id) {
            const { data } = await client.post(paths_1.Paths.notificationRead(id));
            return (0, unwrap_1.unwrapData)(data).notification;
        },
        async markAllRead() {
            const { data } = await client.post(paths_1.Paths.notificationsReadAll);
            return (0, unwrap_1.unwrapData)(data).updated;
        },
        async getPreferences() {
            const { data } = await client.get(paths_1.Paths.notificationPreferences);
            return (0, unwrap_1.unwrapData)(data).preference;
        },
        async updatePreferences(input) {
            const { data } = await client.put(paths_1.Paths.notificationPreferences, input);
            return (0, unwrap_1.unwrapData)(data).preference;
        },
        async registerDevice(input) {
            const { data } = await client.post(paths_1.Paths.notificationDevices, input);
            return (0, unwrap_1.unwrapData)(data).device;
        },
        async revokeDevice(id) {
            await client.delete(paths_1.Paths.notificationDevice(id));
        },
    };
}
//# sourceMappingURL=api.js.map