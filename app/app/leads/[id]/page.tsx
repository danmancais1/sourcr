import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: lead, error } = await supabase
    .from("leads")
    .select("*, properties(*), owners(*)")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .single();

  if (error || !lead) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/app/leads">
          <Button variant="ghost">← Leads</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{lead.title || "Untitled lead"}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Stage: {lead.pipeline_stage} {lead.score != null && ` · Score: ${lead.score}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {lead.properties && (
            <div>
              <h3 className="font-medium">Property</h3>
              <p className="text-sm text-muted-foreground">
                {(lead.properties as { address_line_1?: string }).address_line_1},{" "}
                {(lead.properties as { postcode?: string }).postcode}
              </p>
            </div>
          )}
          {lead.owners && (
            <div>
              <h3 className="font-medium">Owner</h3>
              <p className="text-sm text-muted-foreground">
                {(lead.owners as { name: string }).name}
                {(lead.owners as { email?: string }).email && ` · ${(lead.owners as { email: string }).email}`}
              </p>
            </div>
          )}
          {lead.notes && (
            <div>
              <h3 className="font-medium">Notes</h3>
              <p className="text-sm text-muted-foreground">{lead.notes}</p>
            </div>
          )}
          {lead.breakdown_json && (
            <div>
              <h3 className="font-medium">Score breakdown</h3>
              <pre className="mt-1 rounded bg-muted p-2 text-xs">
                {JSON.stringify(lead.breakdown_json, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
