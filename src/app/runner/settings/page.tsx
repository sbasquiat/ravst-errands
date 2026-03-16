import { redirect } from "next/navigation";
import {
  getCurrentUser,
  getRunnerProfile,
  getRunnerDocuments,
  getNotificationPreferences,
} from "@/lib/supabase/queries";
import RunnerSettings from "@/components/runner/RunnerSettings";

export default async function RunnerSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [runnerData, documents, notificationPrefs] = await Promise.all([
    getRunnerProfile(user.id),
    getRunnerDocuments(user.id),
    getNotificationPreferences(user.id),
  ]);

  if (!runnerData) redirect("/dashboard");

  const memberSince = new Date(runnerData.profile.created_at).toLocaleDateString("en-IE", {
    month: "long",
    year: "numeric",
  });

  return (
    <RunnerSettings
      profile={runnerData.profile}
      runnerProfile={runnerData}
      documents={documents}
      notificationPrefs={notificationPrefs}
      memberSince={memberSince}
      stripeConnectAccountId={runnerData.stripe_connect_account_id ?? null}
    />
  );
}
