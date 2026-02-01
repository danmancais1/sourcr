"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSellerOnboardingState } from "./actions";
import { SellerOnboardingForm } from "./seller-onboarding-form";

export function SellerOnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") === "pro" ? "pro" : "starter";
  const [plan, setPlan] = useState<"starter" | "pro">(planParam);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSellerOnboardingState(planParam)
      .then((state) => {
        if (!state.hasUser) {
          router.replace("/login");
          return;
        }
        if (state.hasWorkspace) {
          router.replace("/seller");
          return;
        }
        setPlan(state.plan);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [planParam, router]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg py-8 md:py-12 px-4">
        <p className="text-deep-teal-200">Loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg py-8 md:py-12 px-4">
      <h1 className="text-display text-deep-teal-50 mb-2">Seller onboarding</h1>
      <p className="text-body text-deep-teal-200 mb-8">
        Subscribe to upload properties, post opportunity ads, and see investor contact details.
      </p>
      <SellerOnboardingForm defaultPlan={plan} />
    </div>
  );
}
