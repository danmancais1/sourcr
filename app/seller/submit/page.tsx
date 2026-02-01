"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPropertyAction } from "./actions";

export default function SubmitPropertyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await submitPropertyAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-deep-teal-700">
          <CardHeader>
            <CardTitle className="text-deep-teal-50">Thank you</CardTitle>
            <CardDescription className="text-deep-teal-200">
              Your property has been submitted. We will match you with interested investors and you can message through the platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/seller/dashboard">
              <Button className="premium-button">Go to dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-display text-deep-teal-50">Submit your property</h1>
      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Property details</CardTitle>
          <CardDescription className="text-deep-teal-200">
            Tell us about your property. We will match you with verified investors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line_1" className="text-deep-teal-200">Address line 1</Label>
              <Input id="address_line_1" name="address_line_1" required className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line_2" className="text-deep-teal-200">Address line 2 (optional)</Label>
              <Input id="address_line_2" name="address_line_2" className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="text-deep-teal-200">Town / City</Label>
              <Input id="city" name="city" className="bg-deep-teal-900 border-deep-teal-700" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode" className="text-deep-teal-200">Postcode</Label>
              <Input id="postcode" name="postcode" required className="bg-deep-teal-900 border-deep-teal-700" />
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
            <div className="flex items-start gap-3">
              <input type="checkbox" id="consent" name="consent" required className="mt-1" />
              <Label htmlFor="consent" className="text-body-sm text-deep-teal-200">
                I agree to be contacted by verified property investors regarding the sale of my property.
              </Label>
            </div>
            {error && (
              <p className="text-body-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full premium-button">
              Submit property
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
