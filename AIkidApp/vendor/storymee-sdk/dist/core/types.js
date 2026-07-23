"use strict";
/** Shared domain types for StoryMee product apps */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_STORAGE_BYTES_LIMIT = exports.TERMINAL_FAIL = exports.TERMINAL_OK = void 0;
exports.TERMINAL_OK = new Set(['done', 'success', 'completed']);
exports.TERMINAL_FAIL = new Set([
    'failed',
    'error',
    'cancelled',
    'canceled',
]);
exports.DEFAULT_STORAGE_BYTES_LIMIT = 500 * 1024 * 1024;
//# sourceMappingURL=types.js.map