import { apiClient } from '@/core/api/client';
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
    level: Number(raw.level ?? 1) || 1,
    xp: Number(raw.xp ?? 0) || 0,
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
  const { data } = await apiClient.get<unknown>('/internal/v1/account/family');
  const inner = unwrapData<{
    accountType?: string;
    childrenCount?: number;
    children?: unknown[];
  }>(data);
  const children = Array.isArray(inner?.children)
    ? inner!.children
        .map((c) => normalizeChild(c as Record<string, unknown>))
        .filter((c) => c.id)
    : [];
  return {
    accountType: inner?.accountType === 'parent' ? 'parent' : 'user',
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
    '/internal/v1/account/family/children',
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
  },
): Promise<ChildProfile> {
  const { data } = await apiClient.patch<unknown>(
    `/internal/v1/account/family/children/${childId}`,
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
  const { data } = await apiClient.patch<unknown>(
    `/internal/v1/account/family/children/${childId}/consent`,
    consent,
  );
  const inner = unwrapData<{ child?: Record<string, unknown> }>(data);
  if (!inner?.child) throw new Error('Không cập nhật quyền');
  return normalizeChild(inner.child);
}

export async function deleteChild(childId: string): Promise<void> {
  await apiClient.delete(`/internal/v1/account/family/children/${childId}`);
}
