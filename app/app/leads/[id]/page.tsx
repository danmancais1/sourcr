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
          <p className="text-body-sm text-deep-teal-200">
            Stage: {lead.pipeline_stage} {lead.score != null && ` · Score: ${lead.score}`}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {(() => {
            const property = (lead as any).properties?.[0];
            const owner = (lead as any).owners?.[0];
            return (
              <>
                {property && (
                  <div>
                    <h3 className="text-subsection font-medium">Property</h3>
                    <p className="text-body-sm text-deep-teal-200">
                      {property.address_line_1}, {property.postcode}
                    </p>
                  </div>
                )}
                {owner && (
                  <div>
                    <h3 className="text-subsection font-medium">Owner</h3>
                    <p className="text-body-sm text-deep-teal-200">
                      {owner.name}
                      {owner.email && ` · ${owner.email}`}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
          {lead.notes && (
            <div>
              <h3 className="text-subsection font-medium">Notes</h3>
              <p className="text-body-sm text-deep-teal-200">{lead.notes}</p>
            </div>
          )}
          {lead.breakdown_json && (
            <div>
              <h3 className="text-subsection font-medium">Score breakdown</h3>
              <pre className="mt-1 rounded bg-deep-teal-800 p-2 text-xs">
                {JSON.stringify(lead.breakdown_json, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
