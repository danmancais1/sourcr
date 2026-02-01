import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PropIxLogo } from "@/components/PropIxLogo";

const plans = [
  {
    name: "Starter",
    price: "£29",
    period: "/month",
    description: "For individuals and small teams.",
    features: ["Up to 25 sends per day", "Leads, pipeline, campaigns", "Letter PDFs, email, SMS (assisted)", "Companies House, EPC, Gazette, PPD", "Suppression list & audit log"],
    cta: "Get started",
    href: "/signup?plan=starter",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "£79",
    period: "/month",
    description: "For growing teams and higher volume.",
    features: ["Up to 200 sends per day", "Everything in Starter", "Direct Sellers inbox & matching", "Investor–landlord messaging", "Priority support"],
    cta: "Get started",
    href: "/signup?plan=pro",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-deep-teal-950">
      <header className="border-b border-deep-teal-800 bg-deep-teal-900/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <PropIxLogo href="/" size="sm" />
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-display text-deep-teal-50">
            Simple pricing
          </h1>
          <p className="mt-2 text-body text-deep-teal-200">
            Choose Starter or Pro. Cancel anytime.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "border-deep-teal-500 ring-2 ring-deep-teal-500/30"
                  : "border-deep-teal-800"
              }
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <p className="text-section font-bold text-deep-teal-50">
                  {plan.price}
                  <span className="text-body font-normal text-deep-teal-200">
                    {plan.period}
                  </span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-body-sm text-deep-teal-200">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="text-deep-teal-400">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
