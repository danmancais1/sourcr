import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { createCampaignAction } from "./actions";

export default async function NewCampaignPage() {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, channel")
    .eq("workspace_id", workspaceId);

  return (
    <div className="space-y-6">
      <Link href="/app/campaigns">
        <Button variant="ghost">← Campaigns</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New campaign</CardTitle>
          <CardDescription>Create a campaign and add steps (assisted send).</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createCampaignAction} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign name</Label>
              <Input id="name" name="name" required placeholder="Q1 Letter Drop" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template_id">Template (optional)</Label>
              <select id="template_id" name="template_id" className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full">
                <option value="">—</option>
                {(templates ?? []).map((t: any) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="b2b_confirmed" name="b2b_confirmed" value="1" className="rounded border-input" />
              <Label htmlFor="b2b_confirmed">B2B basis confirmed (for company owners)</Label>
            </div>
            <Button type="submit">Create campaign</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
