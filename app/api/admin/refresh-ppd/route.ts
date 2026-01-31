import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { downloadAndImportPpd } from "@/lib/ppd";

export async function POST(request: Request) {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const serviceSupabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    const result = await downloadAndImportPpd(serviceSupabase);
    return NextResponse.json({
      imported: result.imported,
      errors: result.errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("PPD refresh error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
