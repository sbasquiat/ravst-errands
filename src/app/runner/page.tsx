import { redirect } from "next/navigation";
import { getCurrentUser, getAvailableJobs, getRunnerJobs, getRunnerProfile, getPendingOffers } from "@/lib/supabase/queries";
import RunnerJobsBoard from "@/components/runner/RunnerJobsBoard";

export default async function RunnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [runnerProfile, availableJobs, myJobs, pendingOffers] = await Promise.all([
    getRunnerProfile(user.id),
    getAvailableJobs(),
    getRunnerJobs(user.id, "active"),
    getPendingOffers(user.id),
  ]);

  if (!runnerProfile) redirect("/dashboard");

  return (
    <RunnerJobsBoard
      availableJobs={availableJobs ?? []}
      myJobs={myJobs ?? []}
      pendingOffers={pendingOffers ?? []}
      runnerStats={{
        todayEarnings: runnerProfile.total_earnings,
        rating: runnerProfile.rating,
      }}
    />
  );
}
