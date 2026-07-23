/**
 * @storymee/sdk — product capability modules for multi-app clients.
 *
 * Usage:
 *   import { createStorymeeClient, createAuthApi, createGenerateApi, ... } from '@storymee/sdk';
 *   const client = createStorymeeClient({ baseURL, getAccessToken, ... });
 *   const auth = createAuthApi(client);
 */

export * from './core';
export * from './auth';
export * from './generate';
export * from './billing';
export * from './family';
export * from './profile';
export * from './media';
export * from './lms';
export * from './notifications';

import type { AxiosInstance } from 'axios';
import { createAuthApi } from './auth';
import { createBillingApi } from './billing';
import { createFamilyApi } from './family';
import { createGenerateApi } from './generate';
import { createProfileApi } from './profile';
import { createMediaApi } from './media';
import { createLmsApi } from './lms';
import { createNotificationsApi } from './notifications';

/** Bundle all capability APIs on one client */
export function createStorymeeApis(client: AxiosInstance) {
  return {
    auth: createAuthApi(client),
    generate: createGenerateApi(client),
    billing: createBillingApi(client),
    family: createFamilyApi(client),
    profile: createProfileApi(client),
    media: createMediaApi(client),
    lms: createLmsApi(client),
    notifications: createNotificationsApi(client),
    client,
  };
}

export type StorymeeApis = ReturnType<typeof createStorymeeApis>;
