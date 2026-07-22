import { useQuery } from '@tanstack/react-query';

import { profileApi } from '@/core/storymee';

export interface Profile {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role?: string;
  isGuest?: boolean;
  createdAt?: string;
}

/** Stats phù hợp app media/AI — không còn stories/credits mock */
export interface Stats {
  imagesUploaded: number;
  imagesGenerated: number;
  jobsFailed: number;
  workspaces: number;
}

export type ProfilePayload = {
  profile: Profile;
  stats: Stats;
};

function normalizeStats(raw: unknown): Stats {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >;
  // Hỗ trợ backend cũ (imagesGenerated, storiesRead, credits) nếu còn
  return {
    imagesUploaded: Number(s.imagesUploaded ?? 0) || 0,
    imagesGenerated: Number(s.imagesGenerated ?? 0) || 0,
    jobsFailed: Number(s.jobsFailed ?? 0) || 0,
    workspaces: Number(s.workspaces ?? 0) || 0,
  };
}

/**
 * GET `/api/v1/account/me` through the shared SDK.
 * Backend: `{ data: { profile, stats } }`
 */
export function useProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['account', 'profile'],
    queryFn: async (): Promise<ProfilePayload> => {
      const profile = await profileApi.getProfile();
      if (!profile?.email && !profile?.name) {
        throw new Error('Profile response thiếu dữ liệu user');
      }

      return {
        profile: {
          id: profile.id,
          name: profile.name || 'User',
          email: profile.email || '',
          role: profile.role,
          createdAt: profile.createdAt,
          avatarUrl: profile.avatarUrl || undefined,
        },
        stats: normalizeStats(profile.stats),
      };
    },
    enabled: options?.enabled ?? true,
  });
}
