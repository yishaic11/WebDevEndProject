interface AppEnv {
  VITE_API_URL?: string;
}

declare global {
  interface Window {
    injectedEnv?: Partial<AppEnv>;
  }
}

const buildEnv = import.meta.env as AppEnv;
const runtimeEnv: Partial<AppEnv> = import.meta.env.PROD ? (window.injectedEnv ?? {}) : {};

const env: AppEnv = { ...buildEnv, ...runtimeEnv };

delete window.injectedEnv;

export const API_URL: string = env.VITE_API_URL ?? 'http://localhost:3000';
