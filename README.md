# AIKid App

Public standalone repository for the StoryMee AIKid React Native / Expo app.

All product source, runtime assets, configuration and the vendored public
StoryMee SDK contract live under [`AIkidApp/`](./AIkidApp/). Legacy HTML
prototypes, duplicate SVG export trees and the old lobby implementation were
removed from the active branch so a new developer has one source of truth.

## Start

```bash
cd AIkidApp
cp .env.example .env
npm ci
npm run typecheck
npm run web
```

## Public web build

GitHub Actions exports the Expo web app and publishes it to GitHub Pages.
The build uses `/aikid-app` as its base path.
