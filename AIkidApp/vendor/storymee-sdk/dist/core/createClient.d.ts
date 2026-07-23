import { type AxiosInstance } from 'axios';
export type StorymeeClientOptions = {
    /** Gateway base, e.g. https://dev-hub.storymee.com */
    baseURL: string;
    timeoutMs?: number;
    /** Sync token preferred in interceptor */
    getAccessTokenSync?: () => string | null;
    getAccessToken?: () => Promise<string | null>;
    clearAccessToken?: () => void | Promise<void>;
    onUnauthorized?: () => void;
    /** Active child profile for X-Child-Profile-Id */
    getChildProfileId?: () => string | null;
    /** Paths that should not trigger logout on 401 */
    isCredentialAuthUrl?: (url: string, method?: string) => boolean;
};
/**
 * Gateway-only Axios client shared by all product apps.
 * Inject token storage from the host app (SecureStore / localStorage).
 */
export declare function createStorymeeClient(opts: StorymeeClientOptions): AxiosInstance;
export type StorymeeHttp = AxiosInstance;
//# sourceMappingURL=createClient.d.ts.map