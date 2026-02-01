import { Suspense } from "react";
import { OnboardingClient } from "./onboarding-client";

export const dynamic = "force-dynamic";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg py-8 px-4 text-deep-teal-200">Loading…</div>}>
      <OnboardingClient />
    </Suspense>
  );
}
