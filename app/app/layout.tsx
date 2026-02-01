import { redirect, unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "./app-nav";
import { Button } from "@/components/ui/button";
import { RoleSelectionModal } from "@/components/role-selection-modal";
import { AppSidebar } from "@/components/AppSidebar";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function ConfigError() {
  return (
    <div className="min-h-screen bg-deep-teal-950 flex items-center justify-center p-4">
      <div className="rounded-xl border border-deep-teal-700 bg-deep-teal-900/80 p-6 max-w-md text-center">
        <h1 className="text-display text-deep-teal-50">Configuration needed</h1>
        <p className="mt-2 text-body text-deep-teal-200">
          Supabase environment variables are not set. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your deployment (e.g. Vercel project settings).
        </p>
      </div>
    </div>
  );
}

function LayoutError({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-deep-teal-950 flex items-center justify-center p-4">
      <div className="rounded-xl border border-deep-teal-700 bg-deep-teal-900/80 p-6 max-w-md text-center">
        <h1 className="text-display text-deep-teal-50">Something went wrong</h1>
        <p className="mt-2 text-body text-deep-teal-200">{message}</p>
        <p className="mt-4 text-body-sm text-deep-teal-300">
          Check your deployment logs for details, or try again later.
        </p>
      </div>
    </div>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return <ConfigError />;
    }

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

    // Investors: workspace check is done in dashboard (and pages that need it)
    // so we avoid using headers() here (which can fail in some production runtimes)
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
  } catch (err) {
    const nextErr = err as { digest?: string } | undefined;
    if (nextErr?.digest?.startsWith?.("NEXT_")) {
      unstable_rethrow(err);
    }
    console.error("App layout error:", err);
    return (
      <LayoutError message="We couldn't load this page. Please try again or contact support." />
    );
  }
}
