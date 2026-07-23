import type { AxiosInstance } from 'axios';
import { Paths } from '../core/paths';
import { unwrapData } from '../core/unwrap';
import type { ProfileResponse } from './types';
import type { UpdateProfileInput } from '../core/types';

export function createProfileApi(client: AxiosInstance) {
  return {
    async getProfile(): Promise<ProfileResponse> {
      const { data } = await client.get<unknown>(Paths.accountMe);
      const body = data as Record<string, unknown>;
      return (body.user as ProfileResponse) || unwrapData<ProfileResponse>(data) || ({} as ProfileResponse);
    },

    async updateProfile(input: UpdateProfileInput): Promise<ProfileResponse> {
      const { data } = await client.patch<unknown>('/api/v1/account/profile', input);
      const body = data as Record<string, unknown>;
      return (body.user as ProfileResponse) || unwrapData<ProfileResponse>(data) || ({} as ProfileResponse);
    },
  };
}

export type ProfileApi = ReturnType<typeof createProfileApi>;
