import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Link href="/app/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {(campaigns ?? []).map((c: { id: string; name: string; status: string; created_at: string }) => (
              <li key={c.id} className="py-3">
                <Link href={`/app/campaigns/${c.id}`} className="flex items-center justify-between hover:underline">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">{c.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          {(!campaigns || campaigns.length === 0) && (
            <p className="py-8 text-center text-muted-foreground">No campaigns yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
