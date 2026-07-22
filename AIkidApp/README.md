# AIkidApp

Native React/Expo client for the AIkid creative experience. It now consumes the
same StoryMee capability contracts as `StoryMeeMobileApp`; the planned end state
is to merge these routes into MobileApp without rewriting domain calls.

## Runtime contract

- Package: local `@storymee/sdk` (`../../../../0-Shared-Libs/sdk`)
- Network: public Gateway only, `EXPO_PUBLIC_API_URL`
- Consumer routes: `/api/v1/*`; never `/internal/v1`, `/worker/v1` or service ports
- Identity: parent email/password or child username/password
- Firebase: opt-in child flow is StoryMee username/password → SDK custom token
  → Firebase `signInWithCustomToken` → ID token → SDK exchange. When disabled,
  classroom login stays direct StoryMee username/password. When enabled, an
  exchange failure is surfaced and credentials are not silently replayed.
- Parent forgot-password is the native `(auth)/forgot-password` SDK flow.
- Active child: persisted locally and sent as `X-Child-Profile-Id` by the host transport

## Native capability map

| Domain | Native route | SDK capability |
| --- | --- | --- |
| Auth | `(auth)/login`, `(auth)/register` | `auth` |
| Family/profile/avatar | `(app)/family`, `(app)/account` | `family`, `profile`, `media` |
| Plans/credits/voucher | `(app)/plans` | `billing` |
| Gallery | `(app)/gallery` | `media` (refetch on focus) |
| Camera/library upload | `(app)/capture` | `media` |
| Generate/jobs | `(app)/character/generate` | `generate` |
| Mee customizer | `(app)/mee` | Native draft, permanent media, optional AI/avatar |
| Art redraw | `(app)/art` | `media`, `generate` |
| Comic/story | `(app)/comic` | Versioned multi-page projects, per-page `generate` |

Mee, Art and Comic are React Native/Expo routes on iOS, Android and web. The old
browser prototype was removed from `public/`; its design history remains in Git.
Only reusable image, SVG, font and audio assets stay in the app. Do not add
WebView or iframe product routes. Drafts use AsyncStorage and AI generation uses
the shared SDK/Gateway boundary so these routes can move into
`StoryMeeMobileApp` without a backend fork.

Comic projects use the local `schemaVersion: 2` contract. Each ordered page
stores narration, visual prompt, job id, result URL and independent status.
Saving creates an immutable library version; export shares the complete project
JSON only when the active child has export consent. Mee preview assets are
uploaded permanently with the active child tag. A child actor may only apply the
result to its own avatar; a parent actor applies it to the selected child through
the family ownership API.

## Run and verify

```bash
cp .env.example .env
npm install
npm run typecheck
npx expo export --platform web --output-dir /tmp/aikid-export
```

See `AGENTS.md` and `../../StoryMeeMobileApp/docs/APP_ARCHITECTURE.md`.
