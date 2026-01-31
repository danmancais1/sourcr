import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-primary">
            Sourcr
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/quiet-sale" className="text-sm text-muted-foreground hover:text-foreground">
              Quiet Sale
            </Link>
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
        <section className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            UK property sourcing & quiet-sale marketplace
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Source leads, score distress, run compliant outreach. Connect with landlords who want a quiet sale.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-sourcr-dark text-sourcr-mint hover:bg-sourcr-brown">
                For investors
              </Button>
            </Link>
            <Link href="/quiet-sale">
              <Button size="lg" variant="outline">
                I want a quiet sale
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-24 grid gap-8 md:grid-cols-2">
          <Card className="border-sourcr-gold/30 bg-card">
            <CardHeader>
              <CardTitle className="text-sourcr-dark">For investors</CardTitle>
              <CardDescription>
                Manage leads, score distress signals, run compliant letter/email/SMS campaigns with assisted sending, suppression lists and daily limits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/signup">
                <Button className="w-full">Start sourcing</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="border-sourcr-gold/30 bg-card">
            <CardHeader>
              <CardTitle className="text-sourcr-dark">For landlords</CardTitle>
              <CardDescription>
                Submit your property for a quiet sale. We match you with verified investors and you message through the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/quiet-sale">
                <Button variant="outline" className="w-full">
                  Submit quiet sale
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="mt-24 border-t border-border py-8">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4">
          <span className="text-sm text-muted-foreground">© Sourcr. UK property sourcing.</span>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
