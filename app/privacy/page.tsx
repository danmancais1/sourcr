import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Sourcr
          </Link>
          <Link href="/">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: January 2025</p>
        <div className="prose prose-neutral mt-8 dark:prose-invert">
          <p>
            Sourcr (&quot;we&quot;) respects your privacy. This policy describes how we collect, use and protect your data.
          </p>
          <h2 className="mt-6 text-xl font-semibold">1. Data we collect</h2>
          <p>
            We collect account data (email, name), workspace and lead data you provide, and usage data necessary to operate the service. We use Supabase and Stripe; their privacy policies apply to their processing.
          </p>
          <h2 className="mt-6 text-xl font-semibold">2. How we use it</h2>
          <p>
            We use your data to provide the platform, process payments, send transactional emails, and improve our service. We do not sell your data.
          </p>
          <h2 className="mt-6 text-xl font-semibold">3. Your rights</h2>
          <p>
            Under UK GDPR you have rights to access, rectify, erase, restrict processing and object. Contact us to exercise these rights.
          </p>
          <h2 className="mt-6 text-xl font-semibold">4. Security</h2>
          <p>
            We use industry-standard measures to protect your data. Data is stored in the UK/EEA where applicable.
          </p>
        </div>
      </main>
    </div>
  );
}
