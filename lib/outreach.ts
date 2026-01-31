/**
 * Outreach: email (Resend), SMS (Twilio), letter PDF.
 * Assisted send only; checks suppression, consent, daily limits.
 */

import { Resend } from "resend";
import twilio from "twilio";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DAILY_LIMITS } from "@/lib/types";
import type { Plan } from "@/lib/types";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export async function checkDailyLimit(
  supabase: SupabaseClient,
  workspaceId: string,
  plan: Plan
): Promise<{ allowed: boolean; remaining: number }> {
  const limit = DAILY_LIMITS[plan];
  const today = new Date().toISOString().slice(0, 10);
  const { data: row } = await supabase
    .from("daily_send_count")
    .select("count")
    .eq("workspace_id", workspaceId)
    .eq("date_utc", today)
    .single();
  const count = (row?.count as number) ?? 0;
  return { allowed: count < limit, remaining: Math.max(0, limit - count) };
}

export async function recordSend(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("daily_send_count")
    .select("count")
    .eq("workspace_id", workspaceId)
    .eq("date_utc", today)
    .single();
  const nextCount = ((existing?.count as number) ?? 0) + 1;
  await supabase
    .from("daily_send_count")
    .upsert(
      { workspace_id: workspaceId, date_utc: today, count: nextCount },
      { onConflict: "workspace_id,date_utc" }
    );
}

export async function isSuppressed(
  supabase: SupabaseClient,
  workspaceId: string,
  email: string | null,
  phone: string | null
): Promise<boolean> {
  if (email) {
    const { data } = await supabase
      .from("suppression_list")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", email)
      .limit(1)
      .single();
    if (data) return true;
  }
  if (phone) {
    const { data } = await supabase
      .from("suppression_list")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("phone", phone)
      .limit(1)
      .single();
    if (data) return true;
  }
  return false;
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  from?: string
): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: false, error: "Resend not configured" };
  try {
    const { error } = await resend.emails.send({
      from: from ?? process.env.RESEND_FROM ?? "onboarding@resend.dev",
      to,
      subject,
      html: body.replace(/\n/g, "<br/>"),
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!twilioClient) return { ok: false, error: "Twilio not configured" };
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!from) return { ok: false, error: "TWILIO_PHONE_NUMBER not set" };
  try {
    await twilioClient.messages.create({ body, from, to });
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
