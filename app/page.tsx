import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropIxLogo } from "@/components/PropIxLogo";
import { LandingHero } from "@/components/landing/LandingHero";
import { StatsBar } from "@/components/landing/StatsBar";
import { TiltedCard } from "@/components/landing/TiltedCard";
import { AppMockup } from "@/components/landing/AppMockup";
import { FAQ } from "@/components/landing/FAQ";

const benefits = [
  {
    title: "Compliance-first",
    description:
      "Suppression lists, opt-out handling, consent rules, and audit logs. Assisted sending only by default.",
  },
  {
    title: "Real data signals",
    description:
      "Companies House, EPC, Gazette, and Land Registry. Distress scoring and off-market leads, no placeholders.",
  },
  {
    title: "One pipeline",
    description:
      "Leads, scoring, pipeline, campaigns, and messaging in one place. Built for serious UK property investors.",
  },
  {
    title: "Premium interface",
    description:
      "Clean dashboard, quiet-sale submissions for sellers, and secure messaging. Works on desktop and mobile.",
  },
];

const stepsInvestor = [
  { num: "1", title: "Access signals", body: "Combine public data to score distressed properties and find off-market leads." },
  { num: "2", title: "Find sellers", body: "Browse quiet-sale submissions and direct-seller matches by area and criteria." },
  { num: "3", title: "Close deals", body: "Message sellers, run compliant campaigns, and manage your pipeline." },
];

const stepsSeller = [
  { num: "1", title: "Submit property", body: "Simple form, no upfront fees. No estate agent commissions." },
  { num: "2", title: "Get matched", body: "We match you with investors looking in your area and property type." },
  { num: "3", title: "Sell discreetly", body: "Secure messaging. Control your privacy and engage only serious buyers." },
];

const testimonials = [
  {
    quote: "Prop IX transformed my deal pipeline. The distress signals are incredibly accurate and save me hours of manual research.",
    author: "Tom H.",
    role: "Property Investor",
  },
  {
    quote: "I sold my property without listing it publicly. The investors on Prop IX were professional and the process was smooth.",
    author: "Sarah M.",
    role: "Landlord",
  },
  {
    quote: "Finally, a compliant outreach tool that respects data privacy and opt-out rules. Essential for serious sourcers.",
    author: "James P.",
    role: "Property Sourcer",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-deep-teal-950 text-deep-teal-50 overflow-x-hidden">
      {/* Gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[70vh] opacity-80"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(71, 184, 152, 0.08) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-0 w-[60%] h-[50vh] opacity-60"
          style={{
            background: "radial-gradient(ellipse at 100% 80%, rgba(71, 184, 152, 0.05) 0%, transparent 50%)",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-deep-teal-800/80 bg-deep-teal-950/90 backdrop-blur-xl">
        <div className="container mx-auto flex h-14 md:h-16 items-center justify-between gap-4 px-4 md:px-6">
          <PropIxLogo href="/" size="sm" />
          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="min-h-[44px] touch-manipulation text-deep-teal-100 hover:text-deep-teal-50 px-3 md:px-4">
                Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="min-h-[44px] touch-manipulation text-deep-teal-100 hover:text-deep-teal-50 px-3 md:px-4">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="premium-button min-h-[44px] touch-manipulation px-4 md:px-6">Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <LandingHero />

      {/* Social proof / stats */}
      <StatsBar />

      {/* Why Prop IX – tilted benefit cards */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-section font-bold text-deep-teal-50 text-center mb-4">
          Why choose Prop IX?
        </h2>
        <p className="text-body-lg text-deep-teal-300 text-center max-w-2xl mx-auto mb-16">
          Built for seamless, compliant, and data-driven property sourcing and quiet sales.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <TiltedCard key={b.title} className="h-full" tiltAmount={6} delay={i * 0.1}>
              <Card className="h-full border-deep-teal-700/80 bg-deep-teal-900/70 shadow-xl shadow-black/20 shadow-[0_0_40px_rgba(1,205,158,0.12)] hover:shadow-[0_0_50px_rgba(1,205,158,0.18)] transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-subsection font-semibold text-deep-teal-50 mb-2">{b.title}</h3>
                  <p className="text-body-sm text-deep-teal-200">{b.description}</p>
                </CardContent>
              </Card>
            </TiltedCard>
          ))}
        </div>
      </section>

      {/* Product showcase – one platform + mockup */}
      <section className="border-y border-deep-teal-800/80 bg-deep-teal-900/30 py-16 md:py-24 shadow-[inset_0_0_80px_rgba(1,205,158,0.06)]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="text-section font-bold text-deep-teal-50 mb-4">
                One platform for investors and sellers
              </h2>
              <p className="text-body-lg text-deep-teal-300 mb-8">
                Dashboard, leads, pipeline, campaigns, and messaging in one place. Sellers get a simple quiet-sale form and secure matching—no public listings.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup?intent=investor">
                  <Button size="lg" className="premium-button">
                    I&apos;m an investor
                  </Button>
                </Link>
                <Link href="/quiet-sale">
                  <Button size="lg" variant="outline" className="border-deep-teal-600 text-deep-teal-300 hover:bg-deep-teal-800">
                    Submit a property
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center lg:justify-end">
              <AppMockup variant="browser" placeholderLabel="Dashboard preview" className="w-full max-w-xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works – two columns */}
      <section className="container mx-auto px-4 md:px-6 py-16 md:py-24">
        <h2 className="text-section font-bold text-deep-teal-50 text-center mb-4">
          How it works
        </h2>
        <p className="text-body text-deep-teal-300 text-center max-w-2xl mx-auto mb-16">
          A simple, fast, and compliant platform for investors and sellers—in a few steps.
        </p>
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <Card className="border-deep-teal-700/80 bg-deep-teal-900/60 shadow-[0_0_40px_rgba(1,205,158,0.08)]">
            <CardContent className="p-8">
              <h3 className="text-subsection font-semibold text-deep-teal-50 mb-6">For investors</h3>
              <ul className="space-y-6">
                {stepsInvestor.map((s) => (
                  <li key={s.num} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deep-teal-700 text-label font-bold text-deep-teal-50">
                      {s.num}
                    </span>
                    <div>
                      <h4 className="text-label font-semibold text-deep-teal-50">{s.title}</h4>
                      <p className="text-body-sm text-deep-teal-100 mt-0.5">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="border-deep-teal-700/80 bg-deep-teal-900/60 shadow-[0_0_40px_rgba(1,205,158,0.08)]">
            <CardContent className="p-8">
              <h3 className="text-subsection font-semibold text-deep-teal-50 mb-6">For sellers</h3>
              <ul className="space-y-6">
                {stepsSeller.map((s) => (
                  <li key={s.num} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deep-teal-700 text-label font-bold text-deep-teal-50">
                      {s.num}
                    </span>
                    <div>
                      <h4 className="text-label font-semibold text-deep-teal-50">{s.title}</h4>
                      <p className="text-body-sm text-deep-teal-100 mt-0.5">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-deep-teal-900/40 py-16 md:py-24 border-y border-deep-teal-800/80">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-section font-bold text-deep-teal-50 text-center mb-4">
            Trusted by investors and sellers
          </h2>
          <p className="text-body text-deep-teal-300 text-center max-w-2xl mx-auto mb-14">
            Join a growing community who use Prop IX for compliant sourcing and discreet sales.
          </p>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {testimonials.map((t, i) => (
              <Card key={i} className="border-deep-teal-700/80 bg-deep-teal-950/60">
                <CardContent className="p-6">
                  <p className="text-body-sm text-deep-teal-200 mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-label font-semibold text-deep-teal-400">
                    — {t.author}, {t.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* Final CTA */}
      <section className="border-t border-deep-teal-800/80 bg-deep-teal-950/80 py-16 md:py-24 shadow-[inset_0_0_100px_rgba(1,205,158,0.06)]">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-section font-bold text-deep-teal-50 mb-4">
            Ready to take control of your property pipeline?
          </h2>
          <p className="text-body-lg text-deep-teal-300 mb-10 max-w-2xl mx-auto">
            Join investors and sellers who use Prop IX for secure, compliant, and data-driven deals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
            <Link href="/signup">
              <Button size="lg" className="premium-button text-label min-h-[48px] touch-manipulation px-8 md:px-10 py-4">
                Get started now
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="min-h-[48px] touch-manipulation border-deep-teal-600 text-deep-teal-300 hover:bg-deep-teal-800 px-8 md:px-10 py-4">
                View pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-deep-teal-800 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-body-sm text-deep-teal-400">
              © 2026 Prop IX. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-body-sm text-deep-teal-400 hover:text-deep-teal-50">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-body-sm text-deep-teal-400 hover:text-deep-teal-50">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
