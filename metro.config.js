const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'wasm' to the list of resolved asset extensions
config.resolver.assetExts.push('wasm');

// Polyfill Node.js modules for AWS SDK
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  stream: require.resolve('stream-browserify'),
  'node:stream': require.resolve('stream-browserify'),
  events: require.resolve('events'),
  'node:events': require.resolve('events'),
};

module.exports = config;
