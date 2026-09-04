/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_PAID_REPORTS_ENABLED?: string
  readonly VITE_FREE_LABOR_ORIENTATION_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
