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
          <p className="text-sm text-muted-foreground">
            Status: {campaign.status} · Template: {(campaign.templates as { name: string } | null)?.name ?? "—"}
          </p>
        </CardHeader>
        <CardContent>
          <h3 className="font-medium mb-2">Steps (assisted send)</h3>
          <ul className="divide-y divide-border">
            {(campaign.campaign_steps ?? []).map((s: { id: string; status: string; owners: { name: string; email: string | null } | null }) => (
              <li key={s.id} className="py-2 flex justify-between">
                <span>{(s.owners as { name: string } | null)?.name ?? "—"}</span>
                <span className="text-sm text-muted-foreground">{s.status}</span>
              </li>
            ))}
          </ul>
          {(!campaign.campaign_steps || campaign.campaign_steps.length === 0) && (
            <p className="text-sm text-muted-foreground">No steps yet. Add leads/owners to send.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
