"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setUserRole } from "./role-selection-actions";

export function RoleSelectionModal() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSelect(role: "investor" | "seller") {
    setLoading(role);
    await setUserRole(role);
    setLoading(null);
    if (role === "investor") {
      router.push("/app/dashboard");
    } else {
      router.push("/seller/dashboard");
    }
    router.refresh();
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
