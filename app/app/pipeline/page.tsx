import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { updateLeadStageAction } from "./actions";

const STAGES = ["new", "contacted", "viewing", "offer", "won", "lost"] as const;

export default async function PipelinePage() {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: leads } = await supabase
    .from("leads")
    .select("id, title, pipeline_stage, score, properties(address_line_1), owners(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const byStage = STAGES.reduce((acc, stage) => {
    acc[stage] = (leads ?? []).filter((l: { pipeline_stage: string }) => l.pipeline_stage === stage);
    return acc;
  }, {} as Record<string, typeof leads>);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pipeline</h1>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <Card key={stage} className="min-w-[280px] flex-1">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-medium capitalize">{stage}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(byStage[stage] ?? []).map((lead: { id: string; title: string | null; score: number | null; properties: { address_line_1: string } | null; owners: { name: string } | null }) => (
                <div key={lead.id} className="block">
                  <Link
                    href={`/app/leads/${lead.id}`}
                    className="block rounded border border-border bg-card p-3 text-sm hover:bg-muted/50"
                  >
                    <span className="font-medium">{lead.title || (lead.properties as { address_line_1?: string })?.address_line_1 || "Untitled"}</span>
                    {lead.owners && (
                      <span className="mt-1 block text-xs text-muted-foreground">{(lead.owners as { name: string }).name}</span>
                    )}
                    {lead.score != null && <span className="mt-1 block text-xs">Score: {lead.score}</span>}
                  </Link>
                  <form action={updateLeadStageAction} className="mt-1 flex gap-1 flex-wrap">
                    <input type="hidden" name="leadId" value={lead.id} />
                    {STAGES.filter((s) => s !== stage).map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="stage"
                        value={s}
                        className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                      >
                        → {s}
                      </button>
                    ))}
                  </form>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
