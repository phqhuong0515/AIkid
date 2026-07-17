# AIkidApp

Expo app cho **Xưởng Sáng Tạo / AIkid Universe**.  
Auth giống **StoryMeeMobileApp**: JWT phụ huynh qua Gateway → **core-account-api**.

## Quick start

```bash
cd 1-Harness-Apps/xuong-sang-tao/AIkidApp
cp .env.example .env
npm install

# Mee HTML (SVG assets) — clone/link prototype sibling folder if missing:
#   xuong-sang-tao/AIkid/SVG  ← from github.com/phqhuong0515/AIkid
# public/mee + public/mee-html are relative symlinks → ../../AIkid/SVG

npm run web -- --port 8082
# or: npx expo start --web --port 8082
npx tsc --noEmit
```

## Auth API (Gateway only)

| Action | Path |
|--------|------|
| Login | `POST /internal/v1/account/login` |
| Register | `POST /internal/v1/account/register` |
| Me | `GET /internal/v1/account/me` |
| Workspaces | `GET /internal/v1/account/workspaces` |

Base URL: `EXPO_PUBLIC_API_URL` (default `https://dev-hub.storymee.com`).

## Structure

```
app/(auth)/login|register
app/(app)/lobby
app/(app)/character/*   # hub · feature · generate · storage (offline)
app/(app)/mee           # draft shell
app/(app)/art|comic     # catalog / hub stubs
src/core/…              # Class A auth/api
src/features/character|mee|art|kids-ui
```

**Option C:** creative offline now; Family + AI jobs later. No `/creative` BFF.

## Docs

- [Design refactor](../docs/DESIGN_AIKID_FEATURE_REFACTOR.md)
- [AGENTS.md](./AGENTS.md)
- Mobile auth SSOT: `../../StoryMeeMobileApp/docs/APP_ARCHITECTURE.md`
