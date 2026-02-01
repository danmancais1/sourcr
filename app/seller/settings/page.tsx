import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/app/app/settings/profile-form";
import { getProfile } from "@/app/app/settings/profile-actions";
import { SellerDirectoryForm } from "./seller-directory-form";

export const dynamic = "force-dynamic";

export default async function SellerSettingsPage() {
  const profile = await getProfile();
  const profileInitial = profile ?? { full_name: null, avatar_url: null, bio: null };

  return (
    <div className="space-y-8">
      <h1 className="text-display text-deep-teal-50">Profile & listing</h1>

      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Your profile</CardTitle>
          <CardDescription className="text-deep-teal-200">
            Display name, bio and profile photo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initial={profileInitial} />
        </CardContent>
      </Card>

      <Card className="border-deep-teal-700">
        <CardHeader>
          <CardTitle className="text-deep-teal-50">Seller directory listing</CardTitle>
          <CardDescription className="text-deep-teal-200">
            Show your contact details to investors so they can reach you about opportunities.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SellerDirectoryForm />
        </CardContent>
      </Card>
    </div>
  );
}
