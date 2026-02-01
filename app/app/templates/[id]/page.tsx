import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;

  const { data: template, error } = await supabase
    .from("templates")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .single();

  if (error || !template) notFound();

  return (
    <div className="space-y-6">
      <Link href="/app/templates">
        <Button variant="ghost">← Templates</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>{template.name}</CardTitle>
          <p className="text-body-sm text-deep-teal-200">
            Channel: {template.channel}{template.subject ? ` · Subject: ${template.subject}` : ""}
          </p>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded bg-deep-teal-800 p-4 text-body-sm">{template.body}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
