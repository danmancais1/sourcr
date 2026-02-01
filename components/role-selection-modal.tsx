"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setUserRole } from "./role-selection-actions";

function RoleSelectionModalInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") === "pro" ? "pro" : "starter";
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(role: "investor" | "seller") {
    setError(null);
    setLoading(role);
    try {
      await setUserRole(role);
      const path = role === "investor" ? `/app/onboarding?plan=${plan}` : "/seller/dashboard";
      router.push(path);
      router.refresh();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal-950/95">
      <Card className="w-full max-w-2xl mx-4 border-deep-teal-700">
        <CardHeader className="text-center">
          <CardTitle className="text-display text-deep-teal-50">What brings you here?</CardTitle>
          <CardDescription className="text-deep-teal-200">
            Choose your path to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {error && (
            <p className="col-span-full rounded-lg bg-red-950/80 border border-red-800 p-3 text-body-sm text-red-200" role="alert">
              {error}
            </p>
          )}
          <button
            onClick={() => handleSelect("investor")}
            disabled={loading !== null}
            className="rounded-2xl border border-deep-teal-800 bg-deep-teal-900 p-6 text-left shadow-lg hover:ring-2 hover:ring-deep-teal-500 transition-all bg-gradient-to-br from-deep-teal-900 to-deep-teal-800"
          >
            <h3 className="text-xl font-semibold text-deep-teal-50 mb-2">
              I want to source/invest in property
            </h3>
            <p className="text-body-sm text-deep-teal-200">
              Access CRM, leads, pipeline, distress signals, outreach campaigns, and direct seller matches.
            </p>
          </button>
          <button
            onClick={() => handleSelect("seller")}
            disabled={loading !== null}
            className="rounded-2xl border border-deep-teal-800 bg-deep-teal-900 p-6 text-left shadow-lg hover:ring-2 hover:ring-deep-teal-500 transition-all bg-gradient-to-br from-deep-teal-900 to-deep-teal-800"
          >
            <h3 className="text-xl font-semibold text-deep-teal-50 mb-2">
              I want to sell a property
            </h3>
            <p className="text-body-sm text-deep-teal-200">
              Submit your property, get matched with verified investors, and communicate discreetly.
            </p>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

export function RoleSelectionModal() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-teal-950/95 text-deep-teal-200">Loading…</div>}>
      <RoleSelectionModalInner />
    </Suspense>
  );
}
