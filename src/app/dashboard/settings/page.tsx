import { redirect } from "next/navigation";
import { getCurrentUser, getProfile, getNotificationPreferences } from "@/lib/supabase/queries";
import SettingsForm from "@/components/dashboard/SettingsForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [profile, notifPrefs] = await Promise.all([
    getProfile(user.id),
    getNotificationPreferences(user.id),
  ]);

  if (!profile) redirect("/login");

  return (
    <SettingsForm
      profile={profile}
      notificationPreferences={notifPrefs}
    />
  );
}
