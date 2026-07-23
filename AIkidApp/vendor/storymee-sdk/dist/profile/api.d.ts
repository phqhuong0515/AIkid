import type { AxiosInstance } from 'axios';
import type { ProfileResponse } from './types';
import type { UpdateProfileInput } from '../core/types';
export declare function createProfileApi(client: AxiosInstance): {
    getProfile(): Promise<ProfileResponse>;
    updateProfile(input: UpdateProfileInput): Promise<ProfileResponse>;
};
export type ProfileApi = ReturnType<typeof createProfileApi>;
//# sourceMappingURL=api.d.ts.map