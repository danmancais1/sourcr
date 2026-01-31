import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { syncCheckoutSession } from "./actions";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  if (params.session_id) {
    await syncCheckoutSession(params.session_id);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, plan)")
    .eq("user_id", user.id);
  const workspace = (memberships ?? [])[0] as { workspaces: { id: string; name: string; plan: string } } | undefined;
  const ws = workspace?.workspaces;

  const { count: leadsCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ws?.id ?? "");

  const { count: campaignsCount } = await supabase
    .from("campaigns")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ws?.id ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Workspace: {ws?.name ?? "—"}
        </p>
      </div>

      {!ws && (
        <Card>
          <CardHeader>
            <CardTitle>No workspace</CardTitle>
            <CardDescription>
              Create a workspace and subscribe to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/onboarding?plan=starter">
              <Button>Create workspace</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {ws && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{leadsCount ?? 0}</p>
                <Link href="/app/leads">
                  <Button variant="link" className="p-0 h-auto">View leads</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{campaignsCount ?? 0}</p>
                <Link href="/app/campaigns">
                  <Button variant="link" className="p-0 h-auto">View campaigns</Button>
                </Link>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold capitalize">{ws.plan}</p>
                <Link href="/app/settings#billing">
                  <Button variant="link" className="p-0 h-auto">Manage billing</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Link href="/app/leads?action=import">
                  <Button variant="outline">Import leads (CSV)</Button>
                </Link>
                <Link href="/app/campaigns?action=new">
                  <Button variant="outline">New campaign</Button>
                </Link>
                <Link href="/app/direct-sellers">
                  <Button variant="outline">Direct Sellers inbox</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
