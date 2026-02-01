import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvestorDirectory } from "./actions";

export const dynamic = "force-dynamic";

export default async function InvestorsListPage() {
  const entries = await getInvestorDirectory();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Investors on the platform</h1>
        <p className="text-body text-deep-teal-200 mt-2">
          Contact details of investors who have opted in to be listed.
        </p>
      </div>

      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Investor directory</CardTitle>
          <CardDescription className="text-deep-teal-200">
            Use these details to reach out about your property or opportunity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-body-sm text-deep-teal-400 py-8">
              No investors have listed their contact details yet. Check back later.
            </p>
          ) : (
            <ul className="divide-y divide-deep-teal-800">
              {entries.map((entry) => (
                <li key={entry.id} className="py-4">
                  <p className="font-semibold text-deep-teal-50">{entry.display_name}</p>
                  <p className="text-body-sm text-deep-teal-200 mt-1">
                    <a href={`mailto:${entry.contact_email}`} className="underline hover:text-deep-teal-100">
                      {entry.contact_email}
                    </a>
                  </p>
                  {entry.contact_phone && (
                    <p className="text-body-sm text-deep-teal-200">
                      <a href={`tel:${entry.contact_phone}`} className="underline hover:text-deep-teal-100">
                        {entry.contact_phone}
                      </a>
                    </p>
                  )}
                  {entry.postcodes_or_areas && (
                    <p className="text-body-sm text-deep-teal-300 mt-1">Areas: {entry.postcodes_or_areas}</p>
                  )}
                  {entry.criteria && (
                    <p className="text-body-sm text-deep-teal-300 mt-1">{entry.criteria}</p>
                  )}
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
