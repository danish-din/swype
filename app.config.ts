import { ExpoConfig } from 'expo';

const config: ExpoConfig = {
  name: 'SwipeFlow',
  slug: 'swipeflow',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#ffffff'
    }
  },
  web: {
    bundler: 'metro',
    output: 'static'
  },
  experiments: {
    typedRoutes: true
  },
  extra: {
    router: {
      origin: 'src/app'
    }
  }
};

export default config;
