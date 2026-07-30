/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_API_SERVER: string;
    readonly [key: string]: string | boolean | undefined;
  };
}
