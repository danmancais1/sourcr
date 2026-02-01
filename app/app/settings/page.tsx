import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvestorDirectoryForm } from "./investor-directory-form";
import { ProfileForm } from "./profile-form";
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
    </div>
  );
}
