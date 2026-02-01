import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import { SellerNav } from "./seller-nav";
import { AppSidebar } from "@/components/AppSidebar";

export const dynamic = "force-dynamic";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile as any)?.role;

  if (!role) {
    return <RoleSelectionModal />;
  }

  if (role === "investor") {
    redirect("/app/dashboard");
  }

  return (
    <div className="min-h-screen bg-deep-teal-950 flex">
      <AppSidebar logoHref="/seller/dashboard">
        <SellerNav />
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
