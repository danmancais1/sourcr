import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export default async function DirectSellersPage() {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: matches } = await supabase
    .from("matches")
    .select("id, status, created_at, landlord_submissions(address_line_1, postcode, contact_name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Direct Sellers</h1>
      <p className="text-muted-foreground">Landlord quiet-sale submissions matched to your buy box.</p>
      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {(matches ?? []).map((m: { id: string; status: string; created_at: string; landlord_submissions: { address_line_1: string; postcode: string; contact_name: string } | null }) => (
              <li key={m.id} className="py-3">
                <Link href={`/app/messaging?match=${m.id}`} className="flex items-center justify-between hover:underline">
                  <span>
                    {m.landlord_submissions
                      ? `${(m.landlord_submissions as { address_line_1: string }).address_line_1}, ${(m.landlord_submissions as { postcode: string }).postcode}`
                      : "—"}
                    {m.landlord_submissions && (m.landlord_submissions as { contact_name: string }).contact_name && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({(m.landlord_submissions as { contact_name: string }).contact_name})
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">{m.status}</span>
                </Link>
              </li>
            ))}
          </ul>
          {(!matches || matches.length === 0) && (
            <p className="py-8 text-center text-muted-foreground">No matches yet. Set up your buy box in Settings.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
