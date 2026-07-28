# AIKid application architecture

## Source and deployment branches

- `main` and `feat/*` contain the Expo/React Native source.
- `gh-pages` is a generated deployment target. Do not develop or merge source
  code there.
- `npm run build:pages` produces the static web application in `dist/`.
- `npm run deploy:pages` builds and publishes `dist/` to the StoryMee
  `gh-pages` branch.

The same source tree builds React Native Web, iOS and Android. Product routes
must not fork into HTML/WebView implementations.

## Dependency direction

```text
app routes
  -> feature modules
    -> UI primitives -> design-system template
    -> domain hooks/stores -> src/core/storymee.ts
      -> vendored @storymee/sdk -> public StoryMee Gateway
```

Routes compose features. Features own use cases and local state. They may use
the UI primitives and public SDK capability boundary, but the design system
must never import a feature or route.

## Replaceable UI templates

`src/design-system/types.ts` is the stable template contract.
`src/design-system/registry.ts` is the only registry for selectable templates.
`TemplateProvider` exposes the selected template to both native and web UI.

To import another interface:

1. Create `src/design-system/templates/<template-name>.ts`.
2. Implement the complete `AikidTemplate` contract (colors, fonts, gradients,
   radii, spacing, shadows and scene assets).
3. Add it to `templateRegistry`.
4. Set `EXPO_PUBLIC_UI_TEMPLATE=<template-name>` before building.

Screens should use primitives from `@/ui`. New primitives read values through
`useAikidTemplate()` and must not hardcode brand tokens. Existing screens can be
migrated incrementally without changing their business logic.

## VPS/backend boundary

Clients connect only to the HTTPS StoryMee Gateway selected by
`EXPO_PUBLIC_API_URL`. The Gateway on Ubuntu routes `/api/v1/*` to backend
services. The app must never call VPS IP addresses, microservice ports,
`/internal/v1`, or `/worker/v1`.

`src/core/api/client.ts` owns transport concerns:

- bearer token attachment;
- active child header (`X-Child-Profile-Id`);
- session invalidation on authenticated `401` responses;
- one public Gateway base URL.

`src/core/storymee.ts` is the capability boundary for auth, billing, family,
generation, media and profile APIs. Feature code imports capabilities from that
module instead of constructing backend URLs.

Environment promotion changes configuration, not source:

```text
development -> https://dev-hub.storymee.com
production  -> production Gateway domain
```

Provider secrets and internal service credentials stay on the VPS and are
never exposed as `EXPO_PUBLIC_*` variables.
