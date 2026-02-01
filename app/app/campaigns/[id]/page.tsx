import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: campaign, error } = await supabase
    .from("campaigns")
    .select("*, templates(name, channel), campaign_steps(*, owners(name, email), leads(id))")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .single();

  if (error || !campaign) notFound();

  return (
    <div className="space-y-6">
      <Link href="/app/campaigns">
        <Button variant="ghost">← Campaigns</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{campaign.name}</CardTitle>
          <p className="text-body-sm text-deep-teal-200">
            Status: {campaign.status} · Template: {(campaign as any).templates?.[0]?.name ?? "—"}
          </p>
        </CardHeader>
        <CardContent>
          <h3 className="text-subsection font-medium mb-2">Steps (assisted send)</h3>
          <ul className="divide-y divide-border">
            {((campaign as any).campaign_steps ?? []).map((s: any) => {
              const owner = s.owners?.[0];
              return (
              <li key={s.id} className="py-2 flex justify-between">
                <span>{owner?.name ?? "—"}</span>
                <span className="text-body-sm text-deep-teal-200">{s.status}</span>
              </li>
              );
            })}
          </ul>
          {(!(campaign as any).campaign_steps || (campaign as any).campaign_steps.length === 0) && (
            <p className="text-body-sm text-deep-teal-200">No steps yet. Add leads/owners to send.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
