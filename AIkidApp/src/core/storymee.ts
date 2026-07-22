import { createStorymeeApis } from '@storymee/sdk';

import { apiClient } from './api/client';

/**
 * Single capability boundary for AIKidApp.
 *
 * The SDK owns the public `/api/v1` contracts. The host app only owns native
 * state (SecureStore, active child and React Query caches).
 */
export const storymee = createStorymeeApis(apiClient);
export const {
  auth: authApi,
  billing: billingApi,
  family: familyApi,
  generate: generateApi,
  media: mediaApi,
  profile: profileApi,
} = storymee;
