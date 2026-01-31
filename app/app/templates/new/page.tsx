import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTemplateAction } from "./actions";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <Link href="/app/templates">
        <Button variant="ghost">← Templates</Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New template</CardTitle>
          <CardDescription>Letter, email or SMS template. Use placeholders like {"{{owner_name}}"} for personalisation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTemplateAction} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Q1 Letter" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="channel">Channel</Label>
              <select id="channel" name="channel" required className="rounded-md border border-input bg-background px-3 py-2 text-sm w-full">
                <option value="letter">Letter</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (email only)</Label>
              <Input id="subject" name="subject" placeholder="Re: your property" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <textarea id="body" name="body" required rows={8} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Dear {{owner_name}}, ..." />
            </div>
            <Button type="submit">Create template</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
