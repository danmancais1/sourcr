import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { importLeadsAction } from "./actions";

export default async function ImportLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <Link href="/app/leads">
        <Button variant="ghost">← Leads</Button>
      </Link>
      <h1 className="text-display">Import Leads</h1>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {params?.error && (
            <p className="text-body-sm text-red-600">
              {decodeURIComponent(params.error)}
            </p>
          )}

          <form action={importLeadsAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">CSV file</Label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".csv"
                required
                className="block w-full text-body-sm"
              />
              <p className="text-xs text-deep-teal-200">
                Columns: address_line_1 (or address), postcode. Optional: city, owner_name, owner_email, owner_phone.
              </p>
            </div>

            <Button type="submit">Import</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
