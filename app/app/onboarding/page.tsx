import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceAndCheckout } from "./actions";

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
  const plan = (params.plan === "pro" ? "pro" : "starter") as "starter" | "pro";

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
    <div className="mx-auto max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create your workspace</CardTitle>
          <CardDescription>
            Choose a name. You will be taken to Stripe to complete payment for {plan === "pro" ? "Pro" : "Starter"}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createWorkspaceAndCheckout} className="space-y-4">
            <input type="hidden" name="plan" value={plan} />
            <div className="space-y-2">
              <Label htmlFor="name">Workspace name</Label>
              <Input id="name" name="name" required placeholder="My Sourcing" />
            </div>
            <Button type="submit" className="w-full">
              Continue to payment
            </Button>
          </form>
          <p className="mt-4 text-center text-body-sm text-deep-teal-200">
            <Link href="/app/dashboard" className="underline">
              I already have a workspace
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
