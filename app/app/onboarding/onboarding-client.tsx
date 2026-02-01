"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getOnboardingState } from "./actions";
import { OnboardingForm } from "./onboarding-form";

export function OnboardingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan") === "pro" ? "pro" : "starter";
  const [plan, setPlan] = useState<"starter" | "pro">(planParam);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getOnboardingState(planParam)
      .then((state) => {
        if (!state.hasUser) {
          router.replace("/login");
          return;
        }
        if (state.hasWorkspace) {
          router.replace("/app/dashboard");
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
      <OnboardingForm defaultPlan={plan} />
    </div>
  );
}
