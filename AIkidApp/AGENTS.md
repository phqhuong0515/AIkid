# AIkidApp — Agent / Dev Guide

Expo SDK **54** · Xưởng Sáng Tạo (kids creative) · Auth = **core-account-api via Gateway** (same as StoryMeeMobileApp)

## Stack
- Routing: expo-router (`app/`)
- Style: NativeWind v4
- Auth: Zustand + SecureStore / localStorage web (JWT parent)
- Data: TanStack Query + Axios → `EXPO_PUBLIC_API_URL` (Gateway only)
- Structure: `src/core` + `src/features/*` (mirror MobileApp)

## Auth (Class A)
| Call | Path |
|------|------|
| Login | `POST /internal/v1/account/login` |
| Register | `POST /internal/v1/account/register` (`asParent`, `parentalConsentAccepted`) |
| Me | `GET /internal/v1/account/me` |
| Workspaces | `GET /internal/v1/account/workspaces` |
| Select IP | `POST /internal/v1/account/workspaces/:ipId/select` |
| Delete me | `DELETE /internal/v1/account/me` |

## Image gen (Class A — same as MobileApp)
| Step | Path |
|------|------|
| Upload ref | `POST /internal/v1/media/upload` (multipart `ipId` + `file`) |
| Create job | `POST /internal/v1/jobs` `{ jobType: 'image', ipId, inputParams: { prompt, provider, reference_image_urls? } }` |
| Poll | `GET /internal/v1/jobs/:id` |
| Provider default | `google-native` |

- RN: `src/features/creative/generateImageViaGateway.ts`
- HTML art canvas: `public/aikid-gateway-gen.js` (JWT + ipId từ localStorage)

Never call microservice ports. Never put provider API keys in Expo public env.

## Option C roadmap (current)
1. ✅ Auth parent (Gateway → account-api)
2. ✅ **Family** (MobileApp model): `src/features/family` + `/family` · `/family/create-child`  
   - Age 9–12 / 13–15 · consent allowAiCreate/allowPhoto  
   - Header `X-Child-Profile-Id` on API when child selected  
3. ✅ Account: profile · children · workspace · logout · delete account  
4. ✅ Creative hub + HTML embeds (Mee/Art/Comic) · Character RN + Gateway gen  
5. ❌ No `/internal/v1/creative` BFF unless jobs proven insufficient

### Mee design source of truth
- HTML/CSS/JS: `../AIkid/SVG/` (`index.html`, `styles.css`, `app.js`, `assets.js`, packs)
- Expo only hosts + embeds; do not replace with NativeWind “shell” without product OK

## Commands
```bash
cp .env.example .env
npm install
npm run web   # primary for creative UI
npx tsc --noEmit
```

## Related
- Design: `../docs/DESIGN_AIKID_FEATURE_REFACTOR.md`
- Mobile SSOT: `../../StoryMeeMobileApp/docs/APP_ARCHITECTURE.md`
- Gateway: `00-Ecosystem-Docs/01-architecture/gateway/gateway-and-clients.md`
