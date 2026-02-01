"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSellerAd, getMySellerAds } from "./actions";
import { SOURCING_CATEGORIES } from "@/lib/sourcing-categories";

export default function PostAdPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ads, setAds] = useState<{ id: string; title: string; description: string; signal_tag: string | null; status: string; created_at: string }[]>([]);

  useEffect(() => {
    getMySellerAds().then(setAds);
  }, [submitted]);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await createSellerAd(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
    setAds(await getMySellerAds());
  }

  const submitLabel = submitted ? "Ad posted" : "Post ad";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Post an ad</h1>
        <p className="text-body text-deep-teal-200 mt-2">
          Looking for an investor? Post an opportunity ad with details about your situation.
        </p>
      </div>

      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">New opportunity ad</CardTitle>
          <CardDescription className="text-deep-teal-200">
            Describe the opportunity. Investors can find and contact you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await handleSubmit(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title" className="text-deep-teal-200">Title</Label>
              <Input id="title" name="title" required placeholder="e.g. Probate sale, NW London" className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-deep-teal-200">Description</Label>
              <textarea id="description" name="description" required rows={4} placeholder="Describe the opportunity, property type, area, situation…" className="flex w-full rounded-md border border-deep-teal-700 bg-deep-teal-900 px-3 py-2 text-sm text-deep-teal-50 placeholder:text-deep-teal-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signal_tag" className="text-deep-teal-200">Category (optional)</Label>
              <select id="signal_tag" name="signal_tag" className="flex h-10 w-full rounded-md border border-deep-teal-700 bg-deep-teal-900 px-3 py-2 text-sm text-deep-teal-50">
                <option value="">Select…</option>
                {SOURCING_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_name" className="text-deep-teal-200">Your name</Label>
              <Input id="contact_name" name="contact_name" required className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="text-deep-teal-200">Email</Label>
              <Input id="contact_email" name="contact_email" type="email" required className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="text-deep-teal-200">Phone (optional)</Label>
              <Input id="contact_phone" name="contact_phone" type="tel" className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            {error && <p className="text-body-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full premium-button">{submitLabel}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Your ads</CardTitle>
          <CardDescription className="text-deep-teal-200">Ads you&apos;ve posted</CardDescription>
        </CardHeader>
        <CardContent>
          {ads.length === 0 ? (
            <p className="text-body-sm text-deep-teal-400">No ads yet.</p>
          ) : (
            <ul className="divide-y divide-deep-teal-800">
              {ads.map((ad) => (
                <li key={ad.id} className="py-3">
                  <p className="font-medium text-deep-teal-50">{ad.title}</p>
                  <p className="text-body-sm text-deep-teal-200 line-clamp-2 mt-1">{ad.description}</p>
                  <p className="text-body-sm text-deep-teal-400 mt-1">{ad.status} · {new Date(ad.created_at).toLocaleDateString("en-GB")}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-body-sm text-deep-teal-400">
        <Link href="/seller" className="underline hover:text-deep-teal-200">Back to options</Link>
      </p>
    </div>
  );
}
