"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { SOURCING_CATEGORY_IDS } from "@/lib/sourcing-categories";

export type LeadsFeedItem = {
  id: string;
  type: "lead";
  title: string | null;
  pipeline_stage: string;
  score: number | null;
  created_at: string;
  property?: { address_line_1?: string; postcode?: string };
  owner?: { name?: string; email?: string };
};

export type LeadsSubmissionItem = {
  id: string;
  type: "submission";
  match_id: string;
  address_line_1: string;
  postcode: string;
  contact_name: string;
  status: string;
  created_at: string;
};

/** Company signals from signal_events (e.g. Companies House). */
export type CompanySignalItem = {
  id: string;
  type: "company_signal";
  source: string;
  category: string;
  headline: string;
  occurred_at: string;
  company_number: string;
  company_name: string;
  confidence: number;
};

export type LeadsFeed = {
  workspaceId: string | null;
  categoryId: string | null;
  leads: LeadsFeedItem[];
  submissions: LeadsSubmissionItem[];
  companySignals: CompanySignalItem[];
};

export async function getLeadsFeed(categoryId: string | null): Promise<LeadsFeed> {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) {
    return { workspaceId: null, categoryId, leads: [], submissions: [], companySignals: [] };
  }

  const category = categoryId && SOURCING_CATEGORY_IDS.includes(categoryId as any) ? categoryId : SOURCING_CATEGORY_IDS[0];

  const leads: LeadsFeedItem[] = [];
  const submissions: LeadsSubmissionItem[] = [];
  let companySignals: CompanySignalItem[] = [];

  if (category) {
    const { data: signalRows } = await supabase
      .from("signals")
      .select("lead_id")
      .eq("signal_type", category);
    const leadIds = [...new Set((signalRows ?? []).map((r) => r.lead_id).filter(Boolean))];

    if (leadIds.length > 0) {
      const { data: leadRows } = await supabase
        .from("leads")
        .select("id, title, pipeline_stage, score, created_at, properties(address_line_1, postcode), owners(name, email)")
        .eq("workspace_id", workspaceId)
        .in("id", leadIds)
        .order("created_at", { ascending: false });
      for (const x of leadRows ?? []) {
        const p = (x as any).properties;
        const o = (x as any).owners;
        leads.push({
          id: x.id,
          type: "lead",
          title: x.title ?? null,
          pipeline_stage: x.pipeline_stage,
          score: x.score ?? null,
          created_at: x.created_at,
          property: Array.isArray(p) ? p[0] : p,
          owner: Array.isArray(o) ? o[0] : o,
        });
      }
    }

    const { data: matches } = await supabase
      .from("matches")
      .select("id, status, created_at, landlord_submissions(id, address_line_1, postcode, contact_name, status, created_at, signal_tag)")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    for (const m of matches ?? []) {
      const sub = (m as any).landlord_submissions;
      const s = Array.isArray(sub) ? sub[0] : sub;
      if (s?.id && (s as any).signal_tag === category) {
        submissions.push({
          id: s.id,
          type: "submission",
          match_id: m.id,
          address_line_1: s.address_line_1 ?? "",
          postcode: s.postcode ?? "",
          contact_name: s.contact_name ?? "",
          status: m.status ?? "",
          created_at: s.created_at ?? m.created_at,
        });
      }
    }
  }

  if (category) {
    try {
      const serviceSupabase = await createServiceRoleClient();
      const categoriesToShow =
        category === "financial_distress" || category === "corporate_disposal"
          ? [category, "watchlist_update"]
          : [category];
      const { data: signalRows, error: signalError } = await serviceSupabase
        .from("signal_events")
        .select("id, source, category, headline, occurred_at, company_number, company_name, confidence")
        .in("category", categoriesToShow)
        .order("occurred_at", { ascending: false })
        .limit(50);
      if (signalError) {
        console.error("getLeadsFeed: signal_events error", signalError);
      }
      companySignals = (signalRows ?? []).map((r) => ({
        id: r.id,
        type: "company_signal" as const,
        source: r.source ?? "",
        category: r.category ?? "",
        headline: r.headline ?? "",
        occurred_at: r.occurred_at ?? "",
        company_number: r.company_number ?? "",
        company_name: r.company_name ?? "",
        confidence: r.confidence ?? 0,
      }));
    } catch (e) {
      console.error("getLeadsFeed: signal_events fetch failed", e);
    }
  }

  return { workspaceId, categoryId: category, leads, submissions, companySignals };
}
