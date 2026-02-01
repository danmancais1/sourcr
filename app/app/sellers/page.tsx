import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSellerDirectory } from "./actions";

export const dynamic = "force-dynamic";

export default async function SellersPage() {
  const entries = await getSellerDirectory();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display text-deep-teal-50">Sellers</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Seller directory</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-body-sm text-deep-teal-400 py-8">
              No sellers have listed their contact details yet. Check back later.
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
                  {entry.areas_or_criteria && (
                    <p className="text-body-sm text-deep-teal-300 mt-1">{entry.areas_or_criteria}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-body-sm text-deep-teal-400">
        <Link href="/app/leads" className="underline hover:text-deep-teal-200">Back to Leads</Link>
      </p>
    </div>
  );
}
