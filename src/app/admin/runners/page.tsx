import { getAllRunners } from "@/lib/supabase/queries";
import AdminRunners from "@/components/admin/AdminRunners";

export default async function AdminRunnersPage() {
  const runners = await getAllRunners();

  return <AdminRunners runners={runners as never} />;
}
