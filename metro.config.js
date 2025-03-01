const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolution for @supabase/realtime-js
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@supabase/realtime-js': require.resolve('@supabase/realtime-js'),
};

// Enable async storage
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config; 