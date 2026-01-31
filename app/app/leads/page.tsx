import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; stage?: string }>;
}) {
  const supabase = await createClient();
  const ws = await getCurrentWorkspace(supabase);
  if (!ws) return null;

  const params = await searchParams;
  let query = supabase
    .from("leads")
    .select("id, title, pipeline_stage, score, created_at, properties(address_line_1, postcode), owners(name, email)", { count: "exact" })
    .eq("workspace_id", ws.id)
    .order("created_at", { ascending: false })
    .range(0, 49);
  if (params.q) query = query.or(`title.ilike.%${params.q}%,notes.ilike.%${params.q}%`);
  if (params.stage) query = query.eq("pipeline_stage", params.stage);
  const { data: leads, count } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Link href="/app/leads/import">
          <Button>Import CSV</Button>
        </Link>
      </div>
      <form method="get" className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search..."
          defaultValue={params.q}
          name="q"
          className="max-w-sm"
        />
        <select name="stage" defaultValue={params.stage ?? ""} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="">All stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="viewing">Viewing</option>
            <option value="offer">Offer</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        <Button type="submit" variant="secondary">Filter</Button>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>All leads ({count ?? 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {(leads ?? []).map((lead: { id: string; title: string | null; pipeline_stage: string; score: number | null; created_at: string; properties: { address_line_1: string; postcode: string } | null; owners: { name: string; email: string | null } | null }) => (
              <li key={lead.id} className="py-3">
                <Link href={`/app/leads/${lead.id}`} className="flex items-center justify-between hover:underline">
                  <div>
                    <span className="font-medium">{lead.title || (lead.properties as { address_line_1?: string })?.address_line_1 || "Untitled"}</span>
                    {lead.owners && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        {(lead.owners as { name: string }).name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{lead.pipeline_stage}</span>
                    {lead.score != null && <span>Score: {lead.score}</span>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {(!leads || leads.length === 0) && (
            <p className="py-8 text-center text-muted-foreground">No leads yet. Import a CSV or add manually.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
