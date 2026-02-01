import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import { SellerNav } from "./seller-nav";

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
      <aside className="w-64 flex-shrink-0 border-r border-deep-teal-800 bg-deep-teal-950">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <Link href="/seller/dashboard" className="mb-6 text-subsection font-bold text-deep-teal-50">
            Sourcr
          </Link>
          <SellerNav />
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
