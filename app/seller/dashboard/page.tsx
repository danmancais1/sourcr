import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function SellerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: submissions } = await supabase
    .from("landlord_submissions")
    .select("id, address_line_1, postcode, status, created_at")
    .eq("contact_email", user.email ?? "")
    .order("created_at", { ascending: false });

  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, status, landlord_submissions!inner(contact_email)")
    .eq("landlord_submissions.contact_email", user.email ?? "");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Dashboard</h1>
        <p className="text-deep-teal-200 mt-2">
          Welcome back. Manage your property submissions and messages with investors.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-deep-teal-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-medium text-deep-teal-200">Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-section font-bold text-deep-teal-50">{submissions?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-deep-teal-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-medium text-deep-teal-200">Investor Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-section font-bold text-deep-teal-50">{matchesData?.length ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-deep-teal-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-label font-medium text-deep-teal-200">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-section font-bold text-deep-teal-50">—</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Your submissions</CardTitle>
          <CardDescription className="text-deep-teal-200">Properties you've submitted for a quiet sale</CardDescription>
        </CardHeader>
        <CardContent>
          {(!submissions || submissions.length === 0) ? (
            <div className="py-8 text-center">
              <p className="text-deep-teal-200 mb-4">No submissions yet.</p>
              <Link href="/seller/submit">
                <Button className="premium-button">Submit a property</Button>
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-deep-teal-800">
              {submissions.map((s: any) => (
                <li key={s.id} className="py-3 flex items-center justify-between">
                  <span className="text-deep-teal-200">{s.address_line_1}, {s.postcode}</span>
                  <span className="text-body-sm text-deep-teal-200/70">{s.status}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
