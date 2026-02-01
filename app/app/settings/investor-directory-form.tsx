"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getInvestorDirectoryEntry, upsertInvestorDirectory } from "./actions";

export function InvestorDirectoryForm({ workspaceId }: { workspaceId: string }) {
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [postcodesOrAreas, setPostcodesOrAreas] = useState("");
  const [criteria, setCriteria] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getInvestorDirectoryEntry(workspaceId).then((entry) => {
      if (entry) {
        setDisplayName(entry.display_name);
        setContactEmail(entry.contact_email);
        setContactPhone(entry.contact_phone ?? "");
        setPostcodesOrAreas(entry.postcodes_or_areas ?? "");
        setCriteria(entry.criteria ?? "");
      }
      setLoading(false);
    });
  }, [workspaceId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    formData.set("workspaceId", workspaceId);
    const result = await upsertInvestorDirectory(formData);
    setSaving(false);
    if (result.error) setError(result.error);
    else setSaved(true);
  }

  if (loading) return <p className="text-body-sm text-deep-teal-200">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name">Display name</Label>
        <Input id="display_name" name="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_email">Contact email</Label>
        <Input id="contact_email" name="contact_email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_phone">Contact phone (optional)</Label>
        <Input id="contact_phone" name="contact_phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="postcodes_or_areas">Postcodes or areas (optional)</Label>
        <Input id="postcodes_or_areas" name="postcodes_or_areas" value={postcodesOrAreas} onChange={(e) => setPostcodesOrAreas(e.target.value)} placeholder="e.g. NW London, SW1" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="criteria">What you look for (optional)</Label>
        <Input id="criteria" name="criteria" value={criteria} onChange={(e) => setCriteria(e.target.value)} placeholder="e.g. Probate, landlord exit" />
      </div>
      {error && <p className="text-body-sm text-destructive">{error}</p>}
      {saved && <p className="text-body-sm text-deep-teal-300">Saved. Sellers can see your details in the investor directory.</p>}
      <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save directory listing"}</Button>
    </form>
  );
}
