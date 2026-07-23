const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Runtime code, the vendored SDK and Mee assets all live under AIkidApp.
// Keep Metro self-contained so a clean clone never traverses private paths.
module.exports = withNativeWind(config, { input: './global.css' });
