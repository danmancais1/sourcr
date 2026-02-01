import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "./app-nav";
import { Button } from "@/components/ui/button";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import { PropIxLogo } from "@/components/PropIxLogo";

export const dynamic = "force-dynamic";


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

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile as any)?.role;

  if (!role) {
    return <RoleSelectionModal />;
  }

  if (role === "seller") {
    redirect("/seller/dashboard");
  }

  return (
    <div className="min-h-screen bg-deep-teal-950 flex">
      <aside className="w-64 flex-shrink-0 border-r border-deep-teal-800 bg-deep-teal-950">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <PropIxLogo href="/app/dashboard" size="sm" />
          <AppNav />
          <div className="mt-auto pt-4 border-t border-deep-teal-800">
            <form action="/api/auth/signout" method="post">
              <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-deep-teal-200 hover:text-deep-teal-50">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
