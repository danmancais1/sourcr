"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitQuietSale } from "./actions";

export default function QuietSalePage() {
  const [submitted, setSubmitted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);

    const result = await submitQuietSale(formData);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    // success
    setToken(result.publicToken);
    setSubmitted(true);
  }

  if (submitted && token) {
    return (
      <div className="min-h-screen bg-deep-teal-950">
        <header className="border-b border-deep-teal-800">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="text-xl font-bold text-deep-teal-50">
              Sourcr
            </Link>
          </div>
        </header>

        <main className="container mx-auto max-w-lg px-4 py-16">
          <Card>
            <CardHeader>
              <CardTitle>Thank you</CardTitle>
              <CardDescription>
                Your quiet sale submission has been received. We will match you with interested investors and you can message through the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-deep-teal-200">
                Your reference: <code className="rounded bg-deep-teal-800 px-1 font-mono">{token}</code>
              </p>
              <p className="mt-2 text-sm text-deep-teal-200">
                Keep this reference to check the status of your submission.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-teal-950">
      <header className="border-b border-deep-teal-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-deep-teal-50">
            Sourcr
          </Link>
          <Link href="/">Back</Link>
        </div>
      </header>

      <main className="container mx-auto max-w-lg px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Quiet sale submission</CardTitle>
            <CardDescription>
              Tell us about your property. We will match you with verified investors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_line_1">Address line 1</Label>
                <Input id="address_line_1" name="address_line_1" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_line_2">Address line 2 (optional)</Label>
                <Input id="address_line_2" name="address_line_2" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Town / City</Label>
                <Input id="city" name="city" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postcode">Postcode</Label>
                <Input id="postcode" name="postcode" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_name">Your name</Label>
                <Input id="contact_name" name="contact_name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input id="contact_email" name="contact_email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Phone (optional)</Label>
                <Input id="contact_phone" name="contact_phone" type="tel" />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
