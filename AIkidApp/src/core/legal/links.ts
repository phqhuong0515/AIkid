function cleanUrl(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  if (!v) return fallback;
  return v.replace(/\/$/, '');
}

export const PRIVACY_POLICY_URL = cleanUrl(
  process.env.EXPO_PUBLIC_PRIVACY_URL,
  'https://aikids.storymee.com/privacy',
);

export const TERMS_OF_SERVICE_URL = cleanUrl(
  process.env.EXPO_PUBLIC_TERMS_URL,
  'https://aikids.storymee.com/terms',
);

export const DELETE_ACCOUNT_WEB_URL = cleanUrl(
  process.env.EXPO_PUBLIC_DELETE_ACCOUNT_URL,
  'https://aikids.storymee.com/account/delete',
);

export const SUPPORT_EMAIL =
  process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() || 'storymee.com@gmail.com';

export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  'AIkid / StoryMee Support',
)}`;
