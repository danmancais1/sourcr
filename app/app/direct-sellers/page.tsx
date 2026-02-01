import { createClient } from "@/lib/supabase/server";
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
      <h1 className="text-display">Landlords</h1>
      <p className="text-deep-teal-200">Landlord submissions matched to your criteria.</p>

      <Card>
        <CardHeader>
          <CardTitle>Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-deep-teal-800">
            {(matches ?? []).map((m: any) => {
              const submission = m.landlord_submissions?.[0];

              return (
                <li key={m.id} className="py-3 flex items-center justify-between">
                  <span>
                    {submission
                      ? `${submission.address_line_1}, ${submission.postcode}`
                      : "—"}
                    {submission?.contact_name && (
                      <span className="ml-2 text-body-sm text-deep-teal-200">
                        ({submission.contact_name})
                      </span>
                    )}
                  </span>
                  <span className="text-body-sm text-deep-teal-200">{m.status}</span>
                </li>
              );
            })}
          </ul>

          {(!matches || matches.length === 0) && (
            <p className="py-8 text-center text-body-sm text-deep-teal-200">
              No matches yet. Set up your buy box in Settings.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
