"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if ((c === "," && !inQuotes) || (c === "\n" && !inQuotes)) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

export async function importLeadsAction(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file?.name?.endsWith(".csv")) {
    redirect("/app/leads/import?error=" + encodeURIComponent("Please upload a CSV file."));
  }
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) redirect("/app/leads/import?error=" + encodeURIComponent("Not authorised."));

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) redirect("/app/leads/import?error=" + encodeURIComponent("CSV must have a header row and at least one data row."));

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const addrIdx = header.findIndex((h) => h === "address_line_1" || h === "address");
  const postcodeIdx = header.findIndex((h) => h === "postcode");
  const cityIdx = header.findIndex((h) => h === "city");
  const nameIdx = header.findIndex((h) => h === "owner_name" || h === "name");
  const emailIdx = header.findIndex((h) => h === "owner_email" || h === "email");
  const phoneIdx = header.findIndex((h) => h === "owner_phone" || h === "phone");

  if (addrIdx === -1 || postcodeIdx === -1) {
    redirect("/app/leads/import?error=" + encodeURIComponent("CSV must include address_line_1 (or address) and postcode columns."));
  }

  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const address_line_1 = values[addrIdx]?.trim();
    const postcode = values[postcodeIdx]?.trim();
    if (!address_line_1 || !postcode) continue;

    const { data: prop } = await supabase
      .from("properties")
      .insert({
        workspace_id: workspaceId,
        address_line_1,
        postcode: postcode.toUpperCase(),
        city: cityIdx >= 0 ? values[cityIdx]?.trim() || null : null,
      })
      .select("id")
      .single();

    let ownerId: string | null = null;
    if ((nameIdx >= 0 && values[nameIdx]) || (emailIdx >= 0 && values[emailIdx])) {
      const { data: owner } = await supabase
        .from("owners")
        .insert({
          workspace_id: workspaceId,
          name: nameIdx >= 0 ? values[nameIdx]?.trim() || "Unknown" : "Unknown",
          email: emailIdx >= 0 ? values[emailIdx]?.trim() || null : null,
          phone: phoneIdx >= 0 ? values[phoneIdx]?.trim() || null : null,
        })
        .select("id")
        .single();
      ownerId = owner?.id ?? null;
    }

    await supabase.from("leads").insert({
      workspace_id: workspaceId,
      property_id: prop?.id ?? null,
      owner_id: ownerId,
      pipeline_stage: "new",
    });
    imported++;
  }

  redirect("/app/leads?imported=" + imported);
}
