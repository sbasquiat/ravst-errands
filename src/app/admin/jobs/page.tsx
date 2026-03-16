import { getAllErrands } from "@/lib/supabase/queries";
import AdminJobs from "@/components/admin/AdminJobs";

export default async function AdminJobsPage() {
  const errands = await getAllErrands(undefined, 100);

  return <AdminJobs errands={errands as never} />;
}
