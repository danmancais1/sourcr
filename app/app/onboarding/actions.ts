"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function createWorkspaceAndCheckout(formData: FormData) {
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

  const priceId = plan === "pro" ? process.env.STRIPE_PRO_PRICE_ID! : process.env.STRIPE_STARTER_PRICE_ID!;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/app/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/app/onboarding`,
    client_reference_id: workspace.id,
    customer_email: user.email,
  });

  if (session.url) redirect(session.url);
  throw new Error("Failed to create checkout session");
}