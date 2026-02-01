"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createWorkspaceAndCheckout } from "./actions";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "£29",
    period: "/month",
    description: "For individuals and small teams.",
    features: ["Up to 25 sends per day", "Leads, pipeline, campaigns", "Companies House, EPC, Gazette, PPD"],
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: "£79",
    period: "/month",
    description: "For growing teams and higher volume.",
    features: ["Up to 200 sends per day", "Everything in Starter", "Direct Sellers inbox & matching", "Priority support"],
    highlighted: true,
  },
];

export function OnboardingForm({ defaultPlan = "starter" }: { defaultPlan?: "starter" | "pro" }) {
  const [plan, setPlan] = useState<"starter" | "pro">(defaultPlan);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("plan", plan);
      formData.set("name", name.trim() || "My workspace");
      await createWorkspaceAndCheckout(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-deep-teal-700">
      <CardHeader>
        <CardTitle className="text-deep-teal-50">Create your workspace</CardTitle>
        <CardDescription className="text-deep-teal-200">
          Choose a plan and workspace name. You&apos;ll be taken to Stripe to enter your payment details and start your subscription.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-deep-teal-200 mb-3 block">Plan</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlan(p.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    plan === p.id
                      ? "border-deep-teal-500 ring-2 ring-deep-teal-500/40 bg-deep-teal-800/80"
                      : "border-deep-teal-800 bg-deep-teal-900/50 hover:border-deep-teal-700"
                  )}
                >
                  <p className="font-semibold text-deep-teal-50">{p.name}</p>
                  <p className="mt-1 text-section font-bold text-deep-teal-50">
                    {p.price}
                    <span className="text-body font-normal text-deep-teal-300">{p.period}</span>
                  </p>
                  <p className="mt-2 text-body-sm text-deep-teal-200">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-deep-teal-200">
              Workspace name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Sourcing"
              required
              className="bg-deep-teal-900 border-deep-teal-700 text-deep-teal-50"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-950/80 border border-red-800 p-3 text-body-sm text-red-200" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Taking you to payment…" : "Continue to payment"}
          </Button>
        </form>
        <p className="text-center text-body-sm text-deep-teal-300">
          You&apos;ll complete payment on Stripe. Cancel anytime from your account settings.
        </p>
      </CardContent>
    </Card>
  );
}
