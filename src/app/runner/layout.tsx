import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, getRunnerProfile } from "@/lib/supabase/queries";
import RunnerNav from "@/components/runner/RunnerNav";

export const metadata: Metadata = {
  title: "Runner Dashboard",
  robots: { index: false, follow: false },
};

export default async function RunnerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const runnerData = await getRunnerProfile(user.id);
  if (!runnerData) redirect("/dashboard");

  const initials = runnerData.profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <RunnerNav
      userInitials={initials}
      initialAvailable={runnerData.is_available}
    >
      {children}
    </RunnerNav>
  );
}
