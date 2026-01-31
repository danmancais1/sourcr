import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, slug)")
    .eq("user_id", user.id);
  const workspaces = (memberships ?? []).map((m) => (m as { workspaces: { id: string; name: string; slug: string } }).workspaces).filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/app/dashboard" className="text-lg font-bold text-primary">
            Sourcr
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Link href="/app/leads">
              <Button variant="ghost" size="sm">Leads</Button>
            </Link>
            <Link href="/app/pipeline">
              <Button variant="ghost" size="sm">Pipeline</Button>
            </Link>
            <Link href="/app/campaigns">
              <Button variant="ghost" size="sm">Campaigns</Button>
            </Link>
            <Link href="/app/templates">
              <Button variant="ghost" size="sm">Templates</Button>
            </Link>
            <Link href="/app/direct-sellers">
              <Button variant="ghost" size="sm">Direct Sellers</Button>
            </Link>
            <Link href="/app/messaging">
              <Button variant="ghost" size="sm">Messaging</Button>
            </Link>
            <Link href="/app/settings">
              <Button variant="ghost" size="sm">Settings</Button>
            </Link>
            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm">
                Sign out
              </Button>
            </form>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
