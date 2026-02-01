"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSellerDirectoryEntry, upsertSellerDirectory } from "./seller-directory-actions";

export function SellerDirectoryForm() {
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [areasOrCriteria, setAreasOrCriteria] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSellerDirectoryEntry().then((entry) => {
      if (entry) {
        setDisplayName(entry.display_name);
        setContactEmail(entry.contact_email);
        setContactPhone(entry.contact_phone ?? "");
        setAreasOrCriteria(entry.areas_or_criteria ?? "");
      }
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    const result = await upsertSellerDirectory(formData);
    setSaving(false);
    if (result.error) setError(result.error);
    else setSaved(true);
  }

  if (loading) return <p className="text-body-sm text-deep-teal-200">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="display_name" className="text-deep-teal-200">Display name</Label>
        <Input id="display_name" name="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required className="bg-deep-teal-900 border-deep-teal-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_email" className="text-deep-teal-200">Contact email</Label>
        <Input id="contact_email" name="contact_email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required className="bg-deep-teal-900 border-deep-teal-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_phone" className="text-deep-teal-200">Contact phone (optional)</Label>
        <Input id="contact_phone" name="contact_phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="bg-deep-teal-900 border-deep-teal-700" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="areas_or_criteria" className="text-deep-teal-200">Areas or criteria (optional)</Label>
        <Input id="areas_or_criteria" name="areas_or_criteria" value={areasOrCriteria} onChange={(e) => setAreasOrCriteria(e.target.value)} placeholder="e.g. NW London, probate" className="bg-deep-teal-900 border-deep-teal-700" />
      </div>
      {error && <p className="text-body-sm text-destructive">{error}</p>}
      {saved && <p className="text-body-sm text-deep-teal-300">Saved. Investors can see your details on the Sellers page.</p>}
      <Button type="submit" disabled={saving} className="premium-button">{saving ? "Saving…" : "Save directory listing"}</Button>
    </form>
  );
}
