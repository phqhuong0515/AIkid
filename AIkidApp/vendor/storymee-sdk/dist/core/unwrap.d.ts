/**
 * Unwrap StoryMee gateway / core-* response envelopes.
 */
export declare function unwrapData<T>(payload: unknown): T;
/** End-user friendly error message from axios/fastify/gin bodies. */
export declare function extractErrorMessage(err: unknown, fallback: string): string;
//# sourceMappingURL=unwrap.d.ts.map