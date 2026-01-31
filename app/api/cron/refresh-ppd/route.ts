import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { downloadAndImportPpd } from "@/lib/ppd";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== "Bearer " + cronSecret) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  try {
    const result = await downloadAndImportPpd(supabase);
    return NextResponse.json({
      ok: true,
      imported: result.imported,
      errors: result.errors,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("PPD refresh error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
