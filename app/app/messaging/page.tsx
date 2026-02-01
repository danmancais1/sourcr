import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessagingThread } from "./messaging-thread";

export default async function MessagingPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: matches } = await supabase
    .from("matches")
    .select("id, status, landlord_submissions(address_line_1, postcode, contact_name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  const selectedId = params.match ?? (matches ?? [])[0]?.id;

  return (
    <div className="space-y-6">
      <h1 className="text-display">Messaging</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-label">Threads</CardTitle>
          </CardHeader>

          <CardContent>
            <ul className="space-y-1">
              {(matches ?? []).map((m: any) => {
                const submission = m.landlord_submissions?.[0];

                return (
                  <li key={m.id}>
                    <a
                      href={`/app/messaging?match=${m.id}`}
                      className={`block rounded px-2 py-2 text-body-sm ${
                        selectedId === m.id
                          ? "bg-deep-teal-800 font-medium"
                          : "hover:bg-deep-teal-800/50"
                      }`}
                    >
                      {submission
                        ? `${submission.address_line_1}, ${submission.postcode}`
                        : "—"}
                      {submission?.contact_name && (
                        <span className="ml-2 text-body-sm text-deep-teal-200">
                          ({submission.contact_name})
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          {selectedId ? (
            <MessagingThread matchId={selectedId} workspaceId={workspaceId} />
          ) : (
            <CardContent className="py-8 text-center text-body-sm text-deep-teal-200">
              Select a thread or create a match from Direct Sellers.
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
