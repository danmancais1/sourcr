import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const planParam = params.plan === "pro" ? "pro" : "starter";

  const { data: existing } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existing?.workspace_id) {
    redirect("/app/dashboard");
  }

  return (
    <div className="mx-auto max-w-lg py-8 md:py-12 px-4">
      <OnboardingForm defaultPlan={planParam} />
    </div>
  );
}
