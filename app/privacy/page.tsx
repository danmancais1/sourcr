import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PropIxLogo } from "@/components/PropIxLogo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-deep-teal-950">
      <header className="border-b border-deep-teal-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <PropIxLogo href="/" size="sm" />
          <Link href="/">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-semibold text-deep-teal-50">Privacy Policy</h1>
        <p className="mt-2 text-body-sm text-deep-teal-200">Last updated: January 2025</p>
        <div className="prose prose-invert mt-8 dark:prose-invert">
          <p>
            Prop IX (&quot;we&quot;) respects your privacy. This policy describes how we collect, use and protect your data.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">1. Data we collect</h2>
          <p>
            We collect account data (email, name), workspace and lead data you provide, and usage data necessary to operate the service. We use Supabase and Stripe; their privacy policies apply to their processing.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">2. How we use it</h2>
          <p>
            We use your data to provide the platform, process payments, send transactional emails, and improve our service. We do not sell your data.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">3. Your rights</h2>
          <p>
            Under UK GDPR you have rights to access, rectify, erase, restrict processing and object. Contact us to exercise these rights.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">4. Security</h2>
          <p>
            We use industry-standard measures to protect your data. Data is stored in the UK/EEA where applicable.
          </p>
        </div>
      </main>
    </div>
  );
}
