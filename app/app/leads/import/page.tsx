import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { importLeadsAction } from "./actions";

export default function ImportLeadsPage() {
  return (
    <div className="space-y-6">
      <Link href="/app/leads">
        <Button variant="ghost">← Leads</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Import leads (CSV)</CardTitle>
          <CardDescription>
            Upload a CSV with columns: address_line_1, postcode, city (optional), owner_name, owner_email (optional), owner_phone (optional). First row can be headers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={importLeadsAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">CSV file</Label>
              <input id="file" name="file" type="file" accept=".csv" required className="block w-full text-sm" />
            </div>
            <Button type="submit">Import</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
