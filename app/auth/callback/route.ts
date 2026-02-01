import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/app/dashboard";

  try {
    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Auth callback error:", error.message);
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
      }
    }
  } catch (err) {
    console.error("Auth callback:", err instanceof Error ? err.message : err);
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
