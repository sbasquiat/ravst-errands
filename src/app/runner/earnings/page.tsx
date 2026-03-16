import { redirect } from "next/navigation";
import { getCurrentUser, getRunnerJobs, getRunnerPayouts, getRunnerProfile } from "@/lib/supabase/queries";
import RunnerEarnings from "@/components/runner/RunnerEarnings";

export default async function RunnerEarningsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [runnerProfile, completedJobs, payouts] = await Promise.all([
    getRunnerProfile(user.id),
    getRunnerJobs(user.id, "completed"),
    getRunnerPayouts(user.id),
  ]);

  if (!runnerProfile) redirect("/dashboard");

  return (
    <RunnerEarnings
      completedJobs={completedJobs ?? []}
      payouts={payouts}
      runnerStats={{
        rating: runnerProfile.rating,
        jobsCompleted: runnerProfile.jobs_completed,
        totalEarnings: runnerProfile.total_earnings,
      }}
    />
  );
}
