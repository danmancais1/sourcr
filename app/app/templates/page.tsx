import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: templates } = await supabase
    .from("templates")
    .select("id, name, channel, subject, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display">Templates</h1>
        <Link href="/app/templates/new">
          <Button>New template</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Letter, email & SMS templates</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {(templates ?? []).map((t: any) => (
              <li key={t.id} className="py-3">
                <Link href={`/app/templates/${t.id}`} className="flex items-center justify-between hover:underline">
                  <span className="text-label font-medium">{t.name}</span>
                  <span className="text-body-sm text-deep-teal-200">{t.channel}{t.subject ? ` · ${t.subject}` : ""}</span>
                </Link>
              </li>
            ))}
          </ul>
          {(!templates || templates.length === 0) && (
            <p className="py-8 text-center text-body-sm text-deep-teal-200">No templates yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
