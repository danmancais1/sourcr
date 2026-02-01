import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_ENV_ERROR =
  "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (e.g. Vercel project settings).";

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

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return throwOnUseProxy(SUPABASE_ENV_ERROR);
  }
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Components
        }
      },
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, value, options);
        } catch {
          // Ignore in Server Components
        }
      },
      remove(name: string, options: Parameters<typeof cookieStore.set>[2]) {
        try {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        } catch {
          // Ignore in Server Components
        }
      },
    },
  });
}

const SERVICE_ROLE_ENV_ERROR =
  "Missing Supabase env vars. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).";

export async function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return throwOnUseProxy(SERVICE_ROLE_ENV_ERROR);
  }
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // Service role does not use cookies; no-op
      },
      get() {
        return undefined;
      },
      set() {},
      remove() {},
    },
  });
}
