"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { stripe, STARTER_PRICE_ID, PRO_PRICE_ID } from "@/lib/stripe";

export async function createWorkspaceAndCheckout(formData: FormData) {
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
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "workspace";
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({
      name,
      slug: slug + "-" + Date.now(),
      plan,
    })
    .select("id")
    .single();
  if (wsError) {
    console.error("Workspace create error:", wsError.message);
    throw new Error("Failed to create workspace");
  }
  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
  });
  if (memberError) {
    console.error("Member create error:", memberError.message);
    throw new Error("Failed to add member");
  }
  const priceId = plan === "pro" ? PRO_PRICE_ID : STARTER_PRICE_ID;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/app/onboarding?plan=${plan}`,
    customer_email: user.email,
    client_reference_id: workspace.id,
    subscription_data: {
      metadata: { workspace_id: workspace.id },
    },
  });
  if (session.url) redirect(session.url);
  throw new Error("Failed to create checkout session");
}
