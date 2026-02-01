import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_ENV_ERROR =
  "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment (e.g. Vercel project settings).";

/** Returns a proxy that throws only when the client is used (e.g. .auth, .from), not at createClient() call time. */
function throwOnUseProxy(message: string): any {
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message);
      },
    }
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return throwOnUseProxy(SUPABASE_ENV_ERROR);
  }
  return createBrowserClient(url, key);
}
