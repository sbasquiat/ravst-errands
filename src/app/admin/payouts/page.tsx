import { getAllPayouts } from "@/lib/supabase/queries";
import AdminPayouts from "@/components/admin/AdminPayouts";

export default async function AdminPayoutsPage() {
  const payouts = await getAllPayouts();

  return <AdminPayouts payouts={payouts as never} />;
}
