const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Configure path aliases
config.resolver = config.resolver || {};
config.resolver.alias = config.resolver.alias || {};
config.resolver.alias['@'] = path.resolve(__dirname, '.');

module.exports = config;