declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_ROUTER_APP_ROOT?: string;
    }
  }
}

export {};
