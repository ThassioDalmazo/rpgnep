// Removed reference to 'vite/client' due to missing type definition file
declare namespace NodeJS {
  interface ProcessEnv {
    readonly FIREBASE_API_KEY: string;
    readonly API_KEY: string; // Gemini Key
    readonly CLIENT_ID: string;
    readonly AUTH_DOMAIN: string;
    readonly DATABASE_URL: string;
    readonly PROJECT_ID: string;
    readonly STORAGE_BUCKET: string;
    readonly MESSAGING_SENDER_ID: string;
    readonly APP_ID: string;
    [key: string]: string | undefined;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_AUTH_DOMAIN: string;
  readonly VITE_DATABASE_URL: string;
  readonly VITE_PROJECT_ID: string;
  readonly VITE_STORAGE_BUCKET: string;
  readonly VITE_MESSAGING_SENDER_ID: string;
  readonly VITE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}