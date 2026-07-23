"use strict";
/**
 * Unwrap StoryMee gateway / core-* response envelopes.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapData = unwrapData;
exports.extractErrorMessage = extractErrorMessage;
function unwrapData(payload) {
    if (payload != null && typeof payload === 'object') {
        const obj = payload;
        if ('data' in obj && obj.data !== undefined) {
            return obj.data;
        }
    }
    return payload;
}
function pickServerMessage(data) {
    if (!data || typeof data !== 'object')
        return undefined;
    const d = data;
    if (typeof d.message === 'string' && d.message.trim())
        return d.message;
    if (typeof d.error === 'string' && d.error.trim())
        return d.error;
    if (d.error && typeof d.error === 'object') {
        const e = d.error;
        if (typeof e.message === 'string')
            return e.message;
    }
    return undefined;
}
/** End-user friendly error message from axios/fastify/gin bodies. */
function extractErrorMessage(err, fallback) {
    const ax = err;
    const serverMsg = pickServerMessage(ax.response?.data);
    if (ax.response?.status === 401) {
        if (serverMsg && !/jwt|token|bearer/i.test(serverMsg)) {
            return serverMsg;
        }
        return 'Phiên đăng nhập hết hạn hoặc mật khẩu không đúng';
    }
    if (ax.response?.status === 402) {
        return serverMsg || 'Hết lượt AI hoặc cần nâng gói. Kiểm tra Plan.';
    }
    if (ax.response?.status === 403) {
        return serverMsg || 'Bạn không có quyền thực hiện thao tác này';
    }
    if (ax.response?.status === 409) {
        return serverMsg || 'Dữ liệu đã tồn tại';
    }
    if (ax.response?.status === 413) {
        return (serverMsg ||
            'Hết dung lượng lưu trữ (500 MB). Xóa ảnh AI cũ hoặc mua thêm sau.');
    }
    if (ax.code === 'ERR_NETWORK' || ax.message === 'Network Error') {
        return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.';
    }
    if (ax.code === 'ECONNABORTED' || /timeout/i.test(ax.message || '')) {
        return 'Máy chủ phản hồi chậm. Thử lại sau.';
    }
    const raw = serverMsg ?? (err instanceof Error ? err.message : undefined);
    if (!raw)
        return fallback;
    if (/EXPO_PUBLIC|stack|ECONNREFUSED|at \//i.test(raw) || raw.length > 160) {
        return fallback;
    }
    return raw;
}
//# sourceMappingURL=unwrap.js.map