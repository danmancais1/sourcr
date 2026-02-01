import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "./app-nav";
import { Button } from "@/components/ui/button";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import { AppSidebar } from "@/components/AppSidebar";

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

  // Investors must complete onboarding (workspace + Stripe) before accessing the app
  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname !== "/app/onboarding") {
    const { data: membership } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    if (!membership?.workspace_id) {
      redirect("/app/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-deep-teal-950 flex">
      <AppSidebar logoHref="/app/dashboard">
        <AppNav />
        <div className="mt-auto pt-4 border-t border-deep-teal-800">
          <form action="/api/auth/signout" method="post">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-deep-teal-200 hover:text-deep-teal-50 min-h-[44px] touch-manipulation">
              Sign out
            </Button>
          </form>
        </div>
      </AppSidebar>
      <main className="flex-1 overflow-auto p-4 md:p-6 pt-14 md:pt-6">{children}</main>
    </div>
  );
}
