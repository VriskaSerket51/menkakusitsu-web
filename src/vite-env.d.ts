/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_ENABLED?: "true" | "false";
  readonly VITE_WEB_TITLE: string;
  readonly VITE_WEB_PREFIX: string;
  readonly VITE_API_PREFIX: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
