import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-deep-teal-950">
      <header className="border-b border-deep-teal-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-deep-teal-50">
            Sourcr
          </Link>
          <Link href="/">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-display text-deep-teal-50">Terms of Service</h1>
        <p className="mt-2 text-sm text-deep-teal-200">Last updated: January 2025</p>
        <div className="prose prose-invert mt-8 dark:prose-invert">
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of Sourcr (&quot;we&quot;, &quot;us&quot;, &quot;the platform&quot;). By using Sourcr you agree to these Terms.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">1. Use of the platform</h2>
          <p>
            You must use the platform in accordance with UK law, including data protection (UK GDPR), electronic marketing (PECR), and consumer protection. You are responsible for obtaining any required consents before sending marketing communications.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">2. Subscription and payment</h2>
          <p>
            Paid plans are billed via Stripe. You may cancel at any time. Refunds are at our discretion.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">3. Limitation of liability</h2>
          <p>
            We provide the platform &quot;as is&quot;. We are not liable for indirect, consequential or punitive damages arising from your use of the platform.
          </p>
          <h2 className="mt-6 text-subsection font-semibold">4. Changes</h2>
          <p>
            We may update these Terms. Continued use after changes constitutes acceptance.
          </p>
        </div>
      </main>
    </div>
  );
}
