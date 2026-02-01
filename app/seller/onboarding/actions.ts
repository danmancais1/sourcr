"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export type SellerOnboardingState = {
  hasUser: boolean;
  hasWorkspace: boolean;
  plan: "starter" | "pro";
};

export async function getSellerOnboardingState(planFromUrl: "starter" | "pro"): Promise<SellerOnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { hasUser: false, hasWorkspace: false, plan: planFromUrl };
  }

  const { data: existing } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return {
    hasUser: true,
    hasWorkspace: Boolean(existing?.workspace_id),
    plan: planFromUrl,
  };
}

export async function createSellerWorkspaceAndCheckout(formData: FormData) {
  const stripe = getStripe();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    throw new Error("Not authenticated");
  }

  const name = (formData.get("name") as string)?.trim();
  const plan = (formData.get("plan") as string) === "pro" ? "pro" : "starter";
  if (!name) {
    throw new Error("Workspace name required");
  }

  const priceId = plan === "pro" ? process.env.STRIPE_PRO_PRICE_ID! : process.env.STRIPE_STARTER_PRICE_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/seller?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/seller/onboarding`,
    customer_email: user.email,
    allow_promotion_codes: true,
    metadata: {
      user_id: user.id,
      workspace_name: name,
      plan,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        workspace_name: name,
        plan,
      },
    },
  });

  if (session.url) redirect(session.url);
  throw new Error("Failed to create checkout session");
}
