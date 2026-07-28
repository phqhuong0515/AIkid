import expoConfig from 'eslint-config-expo/flat.js';

export default [
  ...expoConfig,
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'vendor/**'],
  },
  {
    rules: {
      // React Compiler does not yet understand Reanimated SharedValue mutations.
      'react-hooks/immutability': 'off',
      // These checks currently flag stable React Native Animated refs and local
      // render helpers; keep the runtime-safe Hooks rules enabled instead.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
    },
  },
];
