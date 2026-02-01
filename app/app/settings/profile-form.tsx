"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, uploadAvatar } from "./profile-actions";
import Image from "next/image";

export type ProfileFormProps = {
  initial: { full_name: string | null; avatar_url: string | null; bio: string | null };
};

export function ProfileForm({ initial }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initial.full_name ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    const formData = new FormData();
    formData.set("full_name", fullName.trim());
    formData.set("bio", bio.trim());
    const result = await updateProfile(formData);
    setSaving(false);
    if (result.error) setError(result.error);
    else setSaved(true);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("avatar", file);
    const result = await uploadAvatar(formData);
    setUploading(false);
    if (result.error) setError(result.error);
    else if (result.url) setAvatarUrl(result.url);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <div className="flex items-start gap-6">
          <div className="shrink-0">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-deep-teal-800 border border-deep-teal-700">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-deep-teal-400 text-2xl font-medium">
                  {fullName.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload photo"}
              </Button>
            </div>
          </div>
          <div className="flex-1 space-y-4 min-w-0">
            <div className="space-y-2">
              <Label htmlFor="full_name">Display name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="A short bio about you"
                rows={3}
                maxLength={500}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
              />
              <p className="text-body-sm text-deep-teal-400">{bio.length}/500</p>
            </div>
          </div>
        </div>
        {error && <p className="text-body-sm text-destructive">{error}</p>}
        {saved && <p className="text-body-sm text-deep-teal-300">Profile saved.</p>}
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</Button>
      </form>
    </div>
  );
}
