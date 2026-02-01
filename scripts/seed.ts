/**
 * Seed script: 15 leads, 5 landlord submissions, 6 investor buy boxes.
 * Run: npx tsx scripts/seed.ts
 * Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 * Creates one test user (you must create in Supabase Auth first or use a real user id), one workspace, then seed data.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

async function seed() {
  // Create workspace and get or create a user for membership
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users?.users?.[0]?.id;
  if (!userId) {
    console.error("No users in Auth. Create a user via Supabase Auth (e.g. sign up in the app) first.");
    process.exit(1);
  }

  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .insert({
      name: "Demo Workspace",
      slug: "demo-workspace-" + Date.now(),
      plan: "pro",
    })
    .select("id")
    .single();

  if (wsErr || !ws) {
    console.error("Workspace create failed:", wsErr?.message);
    process.exit(1);
  }

  await supabase.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: userId,
    role: "owner",
  });

  const workspaceId = ws.id;

  // Properties and owners for leads
  const propertyRows = [
    { address_line_1: "1 High Street", postcode: "SW1A 1AA", city: "London" },
    { address_line_1: "2 Church Road", postcode: "M1 1AE", city: "Manchester" },
    { address_line_1: "3 Victoria Gardens", postcode: "B1 1AA", city: "Birmingham" },
    { address_line_1: "4 Park Lane", postcode: "L1 0AB", city: "Liverpool" },
    { address_line_1: "5 Station Road", postcode: "LS1 1AA", city: "Leeds" },
    { address_line_1: "6 Queen Street", postcode: "BS1 1AA", city: "Bristol" },
    { address_line_1: "7 Castle Hill", postcode: "S1 1AA", city: "Sheffield" },
    { address_line_1: "8 Mill Lane", postcode: "NE1 1AA", city: "Newcastle" },
    { address_line_1: "9 Riverside", postcode: "NG1 1AA", city: "Nottingham" },
    { address_line_1: "10 Harbour View", postcode: "SO14 1AA", city: "Southampton" },
    { address_line_1: "11 Market Square", postcode: "LE1 1AA", city: "Leicester" },
    { address_line_1: "12 Bridge Street", postcode: "CV1 1AA", city: "Coventry" },
    { address_line_1: "13 Hill Top", postcode: "HU1 1AA", city: "Hull" },
    { address_line_1: "14 Oak Avenue", postcode: "BD1 1AA", city: "Bradford" },
    { address_line_1: "15 Green Lane", postcode: "SR1 1AA", city: "Sunderland" },
  ];

  const { data: properties } = await supabase
    .from("properties")
    .insert(
      propertyRows.map((p) => ({
        workspace_id: workspaceId,
        ...p,
      }))
    )
    .select("id");

  const ownerRows = Array.from({ length: 15 }, (_, i) => ({
    workspace_id: workspaceId,
    name: `Owner ${i + 1}`,
    email: `owner${i + 1}@example.com`,
    phone: i % 2 === 0 ? `07${String(i).padStart(9, "0")}` : null,
    consent_status: i % 3 === 0 ? "consented" : "unknown",
  }));

  const { data: owners } = await supabase
    .from("owners")
    .insert(ownerRows)
    .select("id");

  const stages = ["new", "contacted", "viewing", "offer", "won", "lost"];
  const leads = (properties ?? []).map((p: any, i: number) => ({
    workspace_id: workspaceId,
    property_id: p.id,
    owner_id: (owners ?? [])[i]?.id ?? null,
    pipeline_stage: stages[i % stages.length],
    title: `Lead ${i + 1}`,
    notes: i % 2 === 0 ? "Interested in quiet sale." : null,
    score: 20 + i * 5,
    breakdown_json: { insolvency: 0, gazette: 0, total: 20 + i * 5 },
  }));

  await supabase.from("leads").insert(leads);

  // Landlord submissions (public)
  const submissions = [
    { address_line_1: "20 Quiet Close", postcode: "SW2 2BB", city: "London", contact_name: "Jane Smith", contact_email: "jane@example.com", contact_phone: "07700900001" },
    { address_line_1: "21 Peace Road", postcode: "M2 2BB", city: "Manchester", contact_name: "John Doe", contact_email: "john@example.com", contact_phone: null },
    { address_line_1: "22 Calm Street", postcode: "B2 2BB", city: "Birmingham", contact_name: "Alice Brown", contact_email: "alice@example.com", contact_phone: "07700900003" },
    { address_line_1: "23 Serenity Lane", postcode: "L2 2BB", city: "Liverpool", contact_name: "Bob Wilson", contact_email: "bob@example.com", contact_phone: null },
    { address_line_1: "24 Still Gardens", postcode: "LS2 2BB", city: "Leeds", contact_name: "Carol White", contact_email: "carol@example.com", contact_phone: "07700900005" },
  ];

  const { data: landlordSubs } = await supabase
    .from("landlord_submissions")
    .insert(
      submissions.map((s) => ({
        ...s,
        status: "pending",
      }))
    )
    .select("id");

  // Investor buy boxes
  const buyBoxes = [
    { name: "London SW", postcodes: ["SW1", "SW2", "SW3"], min_beds: null, max_price: 500000, notes: "Central London" },
    { name: "Manchester M", postcodes: ["M1", "M2", "M3"], min_beds: 2, max_price: 250000, notes: null },
    { name: "Birmingham B", postcodes: ["B1", "B2", "B3"], min_beds: null, max_price: 300000, notes: null },
    { name: "Leeds LS", postcodes: ["LS1", "LS2"], min_beds: 3, max_price: 200000, notes: null },
    { name: "Bristol BS", postcodes: ["BS1", "BS2"], min_beds: 2, max_price: 350000, notes: null },
    { name: "Any", postcodes: [], min_beds: null, max_price: null, notes: "Open to all" },
  ];

  const { data: buyBoxRows } = await supabase
    .from("investor_buy_box")
    .insert(
      buyBoxes.map((b) => ({
        workspace_id: workspaceId,
        ...b,
      }))
    )
    .select("id");

  // Matches: link first 3 landlord submissions to workspace
  const matchSubIds = (landlordSubs ?? []).slice(0, 3).map((s: any) => s.id);
  for (const subId of matchSubIds) {
    await supabase.from("matches").insert({
      landlord_submission_id: subId,
      workspace_id: workspaceId,
      status: "new",
    });
  }

  console.log("Seed complete.");
  console.log("Workspace ID:", workspaceId);
  console.log("15 leads, 5 landlord submissions, 6 investor buy boxes, 3 matches.");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
