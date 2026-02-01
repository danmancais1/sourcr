"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App segment error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-deep-teal-950 flex items-center justify-center p-4">
      <div className="rounded-xl border border-deep-teal-700 bg-deep-teal-900/80 p-6 max-w-md text-center">
        <h1 className="text-display text-deep-teal-50">Something went wrong</h1>
        <p className="mt-2 text-body text-deep-teal-200">
          We couldn&apos;t load this page. This can happen if the app isn&apos;t fully configured or there was a temporary issue.
        </p>
        <p className="mt-4 text-body-sm text-deep-teal-300">
          Check that Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) are set in your deployment. Check the server logs for the digest: {error.digest ?? "—"}
        </p>
        <Button onClick={() => reset()} className="mt-6">
          Try again
        </Button>
      </div>
    </div>
  );
}
