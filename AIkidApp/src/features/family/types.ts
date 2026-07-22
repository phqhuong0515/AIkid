/** Option A: chỉ 9–12 và 13–15 (bỏ 5–8 để dễ pass store) */
export type AgeBand = '9-12' | '13-15';

export type ChildConsent = {
  allowAiCreate: boolean;
  allowPhoto: boolean;
  allowExport: boolean;
  updatedAt?: string;
};

export type ChildProfile = {
  id: string;
  name: string;
  ageBand: AgeBand | string;
  language: string;
  avatarColor: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  createdAt?: string;
  loginEnabled?: boolean;
  loginUsername?: string | null;
  loginEmail?: string | null;
  consent: ChildConsent;
};

export type FamilySnapshot = {
  accountType: 'parent' | 'user';
  childrenCount: number;
  children: ChildProfile[];
};

export const AGE_BAND_OPTIONS: {
  id: AgeBand;
  label: string;
  hint: string;
}[] = [
  { id: '9-12', label: '9–12 tuổi', hint: 'Thiếu nhi · parent quản lý AI' },
  { id: '13-15', label: '13–15 tuổi', hint: 'Thiếu niên · AI mặc định bật' },
];

export function ageBandLabel(band: string): string {
  if (band === '5-8') return '9–12 tuổi'; // legacy display
  return AGE_BAND_OPTIONS.find((o) => o.id === band)?.label ?? band;
}
