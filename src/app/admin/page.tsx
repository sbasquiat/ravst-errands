import { getAllErrands, getAdminStats } from "@/lib/supabase/queries";
import AdminOverview from "@/components/admin/AdminOverview";

export default async function AdminOverviewPage() {
  const [errands, stats] = await Promise.all([
    getAllErrands(undefined, 50),
    getAdminStats(),
  ]);

  return <AdminOverview errands={errands as never} stats={stats} />;
}
