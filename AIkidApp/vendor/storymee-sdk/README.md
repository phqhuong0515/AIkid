# `@storymee/sdk`

Client **capability modules** for StoryMee product apps (AIkid, Mobile, Studio…).

## Modules

| Import | Responsibility |
|--------|----------------|
| `@storymee/sdk` / `./core` | Gateway HTTP client, paths, unwrap, types |
| `./auth` | login / register / me / deleteAccount |
| `./generate` | image/video jobs create + poll helpers |
| `./billing` | AI plan summary + storage 500MB normalize |
| `./family` | children list/create/password/consent |
| `./profile` | profile + workspace selection |
| `./media` | multipart upload + paginated gallery contract |
| `./lms` | course catalog, authoring, enrollment and lesson progress |

Auth also exposes the Firebase bridge (`getFirebaseChildToken`,
`exchangeFirebaseToken`, `signInWithFirebaseGoogle`, `linkFirebaseGoogle`,
`unlinkFirebaseGoogle`). Firebase authenticates the device; the StoryMee JWT
returned by the exchange remains the authorization token used by every API.
Google sign-in is parent-only. Email collisions require password step-up and
are never linked automatically.

Billing exposes the server-owned catalog, subscription checkout, permanent
credit-pack checkout and voucher redemption. Apps must never calculate prices,
credits or wallet identity locally.

## Rules

1. **Gateway only** — `baseURL` = hub (`https://dev-hub.storymee.com`), never `:450x`.
2. **No money logic** in SDK — billing/job-api are SSOT.
3. Host app injects **token storage** + **child profile id** resolvers.
4. Prefer paths `api/v1/...` (hub rewrites to internal).

## Quick start

```ts
import {
  createStorymeeClient,
  createStorymeeApis,
  resolveGatewayBaseUrl,
} from '@storymee/sdk';

const client = createStorymeeClient({
  baseURL: resolveGatewayBaseUrl(process.env.EXPO_PUBLIC_API_URL),
  getAccessTokenSync: () => memoryToken,
  getAccessToken: async () => secureStore.get(),
  clearAccessToken: async () => secureStore.clear(),
  onUnauthorized: () => logoutUi(),
  getChildProfileId: () => familyStore.activeChildId,
});

const api = createStorymeeApis(client);
await api.auth.login({ login: 'user@x.com', password: '...' });
const jobId = await api.generate.createImageJob({
  prompt: 'a cat',
  ipId,
  userId: parentWalletId,
  childProfileId,
});
const plan = await api.billing.getAiSummary();
// plan.storage.remainingLabel
const catalog = await api.billing.listPlans();
await api.billing.checkoutPlan(catalog[0].id);
```

Google Firebase credential exchange:

```ts
const session = await api.auth.signInWithFirebaseGoogle({
  idToken: await firebaseUser.getIdToken(),
  parentalConsentAccepted: true, // required only for first registration
  termsAccepted: true,           // required only for first registration
});
// Persist session.accessToken as the StoryMee API token.
```

If the API returns `ACCOUNT_LINK_REQUIRED`, first log in using the existing
StoryMee password, then call `linkFirebaseGoogle({ idToken, password })`.

## AiKid → MobileApp convergence

Keep feature UI and navigation inside each app for now, but put reusable HTTP
contracts in this SDK. Both apps should wire one `createStorymeeApis(client)`
instance and consume `auth`, `family`, `profile`, `billing`, `media`, and
`generate`. This leaves the later merge as a route/UI move instead of another
backend integration rewrite.

## Build

```bash
cd 0-Shared-Libs/sdk && npm i && npm run build
```

Apps:

```json
"@storymee/sdk": "file:../../0-Shared-Libs/sdk"
```

## Scaffold new app

See [templates/APP_SCAFFOLD.md](./templates/APP_SCAFFOLD.md).
