import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SellerMessagingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: matches } = await supabase
    .from("matches")
    .select("id, status, created_at, landlord_submissions!inner(contact_email)")
    .eq("landlord_submissions.contact_email", user.email ?? "");

  return (
    <div className="space-y-8">
      <h1 className="text-display text-deep-teal-50">Messages</h1>
      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Investor conversations</CardTitle>
        </CardHeader>
        <CardContent>
          {(!matches || matches.length === 0) ? (
            <p className="py-8 text-center text-body-sm text-deep-teal-200">No matches yet. Once investors are interested, you can message them here.</p>
          ) : (
            <ul className="divide-y divide-border">
              {matches.map((m: any) => (
                <li key={m.id} className="py-3">
                  <a href={`/seller/messaging/${m.id}`} className="block hover:underline text-deep-teal-200">
                    Match #{m.id.slice(0, 8)} · {m.status}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
