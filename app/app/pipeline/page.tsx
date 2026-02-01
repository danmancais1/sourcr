import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STAGES = ["new", "contacted", "viewing", "offer", "under_offer", "won", "lost"] as const;

export default async function PipelinePage() {
  const supabase = await createClient();
  const ws = await getCurrentWorkspace(supabase);
  if (!ws) return null;

  const { data: leads } = await supabase
    .from("leads")
    .select("id, title, pipeline_stage, score, properties(address_line_1), owners(name)")
    .eq("workspace_id", ws.id)
    .order("created_at", { ascending: false });

  const byStage: Record<string, any[]> = {};
  for (const s of STAGES) byStage[s] = [];

  (leads ?? []).forEach((l: any) => {
    const stage = l.pipeline_stage || "new";
    if (!byStage[stage]) byStage[stage] = [];
    byStage[stage].push(l);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-display">Pipeline</h1>
      <p className="text-body text-deep-teal-200">Drag and drop can come later. This is the working MVP view.</p>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {STAGES.map((stage) => (
          <Card key={stage}>
            <CardHeader>
              <CardTitle className="text-label capitalize">
                {stage.replace("_", " ")} ({(byStage[stage] ?? []).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(byStage[stage] ?? []).map((lead: any) => {
                const property = lead.properties?.[0];
                const owner = lead.owners?.[0];

                return (
                  <div key={lead.id} className="rounded-md border border-deep-teal-700 p-2">
                    <Link href={`/app/leads/${lead.id}`} className="block hover:underline">
                      <div className="text-body-sm font-medium">
                        {lead.title || property?.address_line_1 || "Untitled"}
                      </div>
                      {owner?.name && (
                        <div className="text-body-sm text-deep-teal-200">{owner.name}</div>
                      )}
                      {lead.score != null && (
                        <div className="text-xs text-deep-teal-200">Score: {lead.score}</div>
                      )}
                    </Link>
                  </div>
                );
              })}

              {(byStage[stage] ?? []).length === 0 && (
                <div className="text-body-sm text-deep-teal-200">No leads in this stage.</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
