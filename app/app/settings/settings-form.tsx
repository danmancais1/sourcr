"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceName } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

export function SettingsForm({
  workspaceId,
  name,
  slug,
}: {
  workspaceId: string;
  name: string;
  slug: string;
}) {
  return (
    <form action={updateWorkspaceName} className="space-y-4 max-w-sm">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="space-y-2">
        <Label htmlFor="name">Workspace name</Label>
        <Input id="name" name="name" defaultValue={name} required />
      </div>
      <p className="text-body-sm text-deep-teal-200">Slug: {slug}</p>
      <SubmitButton />
    </form>
  );
}
