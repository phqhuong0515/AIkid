import { useQuery } from '@tanstack/react-query';

import apiClient from '@/core/api/client';
import { unwrapData } from '@/core/api/unwrap';

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
 * GET /internal/v1/account/profile
 * Backend: `{ data: { profile, stats } }`
 */
export function useProfile() {
  return useQuery({
    queryKey: ['account', 'profile'],
    queryFn: async (): Promise<ProfilePayload> => {
      const { data } = await apiClient.get<unknown>(
        'internal/v1/account/profile',
      );
      const inner = unwrapData<{
        profile?: Profile;
        stats?: unknown;
      }>(data);

      if (!inner?.profile?.email && !inner?.profile?.name) {
        throw new Error('Profile response thiếu dữ liệu user');
      }

      return {
        profile: {
          id: inner.profile.id,
          name: inner.profile.name || 'User',
          email: inner.profile.email || '',
          role: inner.profile.role,
          isGuest: inner.profile.isGuest,
          createdAt: inner.profile.createdAt,
          avatarUrl: inner.profile.avatarUrl,
        },
        stats: normalizeStats(inner.stats),
      };
    },
  });
}
