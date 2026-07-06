const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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

// Exclude the scripts/ folder from bundling — Node.js-only utility scripts
const scriptsDir = path.resolve(__dirname, 'scripts');
config.resolver.blockList = [
  new RegExp(`^${scriptsDir.replace(/\\/g, '\\\\')}\\\\.*$`),
];

module.exports = config;
