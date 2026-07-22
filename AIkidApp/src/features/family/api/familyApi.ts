import { apiClient } from '@/core/api/client';
import { familyApi } from '@/core/storymee';
import { unwrapData } from '@/core/api/unwrap';

import type { AgeBand, ChildProfile, FamilySnapshot } from '../types';

function normalizeChild(raw: Record<string, unknown>): ChildProfile {
  const consent = (raw.consent || {}) as Record<string, unknown>;
  return {
    id: String(raw.id || ''),
    name: String(raw.name || 'Con'),
    ageBand: String(raw.ageBand || '9-12'),
    language: String(raw.language || 'vi'),
    avatarColor: String(raw.avatarColor || 'indigo'),
    avatarUrl: raw.avatarUrl ? String(raw.avatarUrl) : null,
    level: Number(raw.level ?? 1) || 1,
    xp: Number(raw.xp ?? 0) || 0,
    loginEnabled: Boolean(raw.loginEnabled),
    loginUsername: raw.loginUsername ? String(raw.loginUsername) : null,
    loginEmail: raw.loginEmail ? String(raw.loginEmail) : null,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : raw.createdAt
          ? String(raw.createdAt)
          : undefined,
    consent: {
      allowAiCreate: Boolean(consent.allowAiCreate),
      allowPhoto: Boolean(consent.allowPhoto),
      allowExport: Boolean(consent.allowExport),
      updatedAt:
        typeof consent.updatedAt === 'string'
          ? consent.updatedAt
          : undefined,
    },
  };
}

export async function fetchFamily(): Promise<FamilySnapshot> {
  const inner = await familyApi.listFamily();
  const children = inner.children.map((child) =>
    normalizeChild(child as unknown as Record<string, unknown>),
  );
  return {
    accountType: 'parent',
    childrenCount: children.length,
    children,
  };
}

export async function createChild(input: {
  name: string;
  ageBand: AgeBand | string;
  allowAiCreate?: boolean;
  allowPhoto?: boolean;
  allowExport?: boolean;
}): Promise<ChildProfile> {
  const { data } = await apiClient.post<unknown>(
    '/api/v1/account/family/children',
    input,
  );
  const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
  if (!inner?.child) throw new Error('Không tạo được hồ sơ con');
  return normalizeChild(inner.child);
}

export async function updateChild(
  childId: string,
  input: {
    name?: string;
    ageBand?: AgeBand | string;
    language?: string;
    avatarColor?: string;
    avatarUrl?: string;
  },
): Promise<ChildProfile> {
  const { data } = await apiClient.patch<unknown>(
    `/api/v1/account/family/children/${childId}`,
    input,
  );
  const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
  if (!inner?.child) throw new Error('Không cập nhật hồ sơ');
  return normalizeChild(inner.child);
}

export async function updateChildConsent(
  childId: string,
  consent: {
    allowAiCreate?: boolean;
    allowPhoto?: boolean;
    allowExport?: boolean;
  },
): Promise<ChildProfile> {
  const child = await familyApi.updateChildConsent(childId, consent);
  return normalizeChild(child as unknown as Record<string, unknown>);
}

export async function deleteChild(childId: string): Promise<void> {
  await apiClient.delete(`/api/v1/account/family/children/${childId}`);
}
