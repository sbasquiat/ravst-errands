import { redirect } from "next/navigation";
import { getCurrentUser, getCustomerSubscription, getCustomerErrands } from "@/lib/supabase/queries";
import SubscriptionView from "@/components/dashboard/SubscriptionView";

export default async function SubscriptionPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [subscription, errands] = await Promise.all([
    getCustomerSubscription(user.id),
    getCustomerErrands(user.id),
  ]);

  // Calculate this month's stats
  const now = new Date();
  const thisMonth = errands.filter((e) => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const spent = thisMonth
    .filter((e) => e.status === "completed")
    .reduce((sum, e) => sum + (e.total_price ?? 0), 0);

  return (
    <SubscriptionView
      currentPlan={subscription?.plan ?? "pay_as_you_go"}
      monthlyErrands={thisMonth.length}
      monthlySpent={spent}
    />
  );
}
