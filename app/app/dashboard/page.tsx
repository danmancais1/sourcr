import Link from "next/link";
import { redirect } from "next/navigation";
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
  const first = (memberships ?? [])[0] as any;
  const workspaces = first?.workspaces;
  const ws = Array.isArray(workspaces) ? workspaces?.[0] : workspaces;

  if (!ws?.id) {
    redirect("/app/onboarding");
  }


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
        <h1 className="text-display text-deep-teal-50">Dashboard</h1>
        <p className="text-body text-deep-teal-200">
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-label font-semibold text-deep-teal-50">Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-section font-bold text-deep-teal-50">{leadsCount ?? 0}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-deep-teal-800 overflow-hidden">
                  <div className="progress-bar-gradient h-full rounded-full" style={{ width: `${Math.min(100, ((leadsCount ?? 0) / 50) * 100)}%` }} />
                </div>
                <Link href="/app/leads" className="mt-2 inline-block">
                  <Button variant="link" className="p-0 h-auto text-deep-teal-400">View leads</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-label font-semibold text-deep-teal-50">Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-section font-bold text-deep-teal-50">{campaignsCount ?? 0}</p>
                <div className="mt-2 h-1.5 w-full rounded-full bg-deep-teal-800 overflow-hidden">
                  <div className="progress-bar-gradient h-full rounded-full" style={{ width: `${Math.min(100, ((campaignsCount ?? 0) / 20) * 100)}%` }} />
                </div>
                <Link href="/app/campaigns" className="mt-2 inline-block">
                  <Button variant="link" className="p-0 h-auto text-deep-teal-400">View campaigns</Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-label font-semibold text-deep-teal-50">Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-deep-teal-50 capitalize">{ws.plan}</p>
                <Link href="/app/settings#billing" className="mt-2 inline-block">
                  <Button variant="link" className="p-0 h-auto text-deep-teal-400">Manage billing</Button>
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
