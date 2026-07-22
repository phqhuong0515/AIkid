# AIkidApp — agent entry

Expo SDK 54 client. Mobile capability source of truth is
`../../../StoryMeeMobileApp`; shared network/domain source of truth is
`../../../../0-Shared-Libs/sdk`.

## Non-negotiable boundaries

1. Import StoryMee domains from `src/core/storymee.ts` / `@storymee/sdk`.
2. Client traffic uses Gateway `EXPO_PUBLIC_API_URL` and `/api/v1/*` only.
3. Never call `/internal/v1`, `/worker/v1`, microservice ports, or ship provider keys.
4. Parent and child share the auth store. Child username/password remains
   canonical even when Firebase opt-in is enabled; Firebase failure falls back to it.
5. AI jobs require a hydrated workspace `ipId`; family media/jobs require the
   verified active-child header.
6. Plans replace monthly allowance; credit packs/vouchers add bonus credits.
   Display monthly and bonus buckets separately.
7. Gallery queries include `childId` and `ipId` in the cache key and refetch on focus.
8. Camera/library selections uploaded to a profile use `media` with a
   `child:<id>` tag. Avatar changes use profile/family ownership APIs.

## Migration direction

All product screens are React Native/Expo. Browser-prototype runtime files have
been removed from `public/`; their design history remains recoverable from Git.
Keep only reusable image, SVG, font and audio assets there. Build new features
headlessly in the SDK so AIKid routes can later move into StoryMeeMobileApp
without backend forks. Do not introduce iframe/WebView-based product routes.

## Quality gate

Run `npm run typecheck` and at least one `expo export` after source changes.
