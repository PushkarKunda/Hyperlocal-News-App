module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@components': './components',
            '@constants': './constants',
            '@hooks': './hooks',
            '@services': './services',
            '@store': './store',
            '@types': './types',
            '@utils': './utils',
          },
        },
      ],
    ],
  };
};