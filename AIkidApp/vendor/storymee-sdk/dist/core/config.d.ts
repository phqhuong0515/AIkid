/**
 * Resolve public gateway URL for product apps.
 * Never hardcode LAN IPs on clients.
 */
export declare function resolveGatewayBaseUrl(envValue?: string | null): string;
/**
 * No synthetic workspace is valid. Authenticated clients must resolve their
 * workspace from GET /account/workspaces; an env value is only an explicit
 * development fallback.
 */
export declare const DEFAULT_IP_ID = "";
export declare function resolveDefaultIpId(envValue?: string | null): string;
//# sourceMappingURL=config.d.ts.map