import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "./settings-form";
import { ApiKeysForm } from "./api-keys-form";
import { RefreshPpdButton } from "./refresh-ppd-button";
import { InvestorDirectoryForm } from "./investor-directory-form";
import { ProfileForm } from "./profile-form";
import { createBillingPortalSession } from "./actions";
import { getProfile } from "./profile-actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  const ws = await getCurrentWorkspace(supabase);
  if (!ws) return null;

  const profile = await getProfile();
  const profileInitial = profile ?? { full_name: null, avatar_url: null, bio: null };

  return (
    <div className="space-y-8">
      <h1 className="text-display text-deep-teal-50">Settings</h1>

      <Card id="profile">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your display name, bio and profile photo. Visible where you&apos;re listed (e.g. investor directory).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initial={profileInitial} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Your workspace name and slug.</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm workspaceId={ws.id} name={ws.name} slug={ws.slug} />
        </CardContent>
      </Card>

      <Card id="directory">
        <CardHeader>
          <CardTitle>Investor directory listing</CardTitle>
          <CardDescription>
            Show your contact details to sellers on the platform so they can reach you about properties and opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvestorDirectoryForm workspaceId={ws.id} />
        </CardContent>
      </Card>

      <Card id="api-keys">
        <CardHeader>
          <CardTitle>API keys</CardTitle>
          <CardDescription>
            Add and validate API keys for Companies House, EPC, Resend (email), and Twilio (SMS). Keys are stored securely and never exposed to the client.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeysForm workspaceId={ws.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Land Registry PPD</CardTitle>
          <CardDescription>
            Refresh Price Paid Data from the monthly update. You can also schedule the cron endpoint on Vercel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RefreshPpdButton />
        </CardContent>
      </Card>

      <Card id="billing">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>
            Manage your subscription and payment method via Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-deep-teal-200 mb-2">Plan: {ws.plan}</p>
          <form action={createBillingPortalSession}>
            <input type="hidden" name="workspaceId" value={ws.id} />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl text-label font-medium bg-deep-teal-500 text-white h-10 px-4 py-2 hover:bg-deep-teal-400 shadow-[0_4px_14px_rgba(71,184,152,0.3)]"
            >
              Open customer portal
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
