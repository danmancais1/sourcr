"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AppNav } from "./app-nav";
import { Button } from "@/components/ui/button";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import { AppSidebar } from "@/components/AppSidebar";
import { getAppSession } from "./get-app-session";

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<"loading" | "no-session" | "no-role" | "redirect" | "error" | "ready">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s?.user) {
        router.replace("/login");
        setState("no-session");
        return;
      }
      getAppSession()
        .then((res) => {
          if (!res.role) {
            setState("no-role");
            return;
          }
          if (res.role === "seller") {
            router.replace("/seller");
            setState("redirect");
            return;
          }
          if (res.role === "investor" && !res.hasWorkspace && (pathname === "/app" || pathname === "/app/dashboard" || pathname === "/app/leads")) {
            router.replace("/app/onboarding");
            setState("redirect");
            return;
          }
          setState("ready");
        })
        .catch((err) => {
          setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
          setState("error");
        });
    });
  }, [router, pathname]);

  if (state === "no-session" || state === "redirect") {
    return (
      <div className="min-h-screen bg-deep-teal-950 flex items-center justify-center p-4">
        <p className="text-deep-teal-200">Redirecting…</p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-deep-teal-950 flex items-center justify-center p-4">
        <p className="text-deep-teal-200">Loading…</p>
      </div>
    );
  }

  if (state === "no-role") {
    return <RoleSelectionModal />;
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-deep-teal-950 flex items-center justify-center p-4">
        <div className="rounded-xl border border-deep-teal-700 bg-deep-teal-900/80 p-6 max-w-md text-center">
          <h1 className="text-display text-deep-teal-50">Something went wrong</h1>
          <p className="mt-2 text-body text-deep-teal-200">{errorMessage ?? "We couldn't load this page."}</p>
          <p className="mt-4 text-body-sm text-deep-teal-300">
            Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your deployment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-teal-950 flex">
      <AppSidebar logoHref="/app/leads">
        <AppNav />
        <div className="mt-auto pt-4 border-t border-deep-teal-800">
          <form action="/api/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start text-deep-teal-200 hover:text-deep-teal-50 min-h-[44px] touch-manipulation"
            >
              Sign out
            </Button>
          </form>
        </div>
      </AppSidebar>
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">{children}</main>
    </div>
  );
}
