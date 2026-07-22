const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../../../..');
const sdkRoot = path.resolve(monorepoRoot, '0-Shared-Libs/sdk');
const meeAssetRoot = path.resolve(projectRoot, '..', 'SVG');
const config = getDefaultConfig(projectRoot);

// Only watch the linked package. Watching the full StoryMee monorepo makes
// Metro crawl backend builds, docs and other apps on every start.
config.watchFolders = [sdkRoot, meeAssetRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
module.exports = withNativeWind(config, { input: './global.css' });
