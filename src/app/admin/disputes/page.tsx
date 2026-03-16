import { getAllDisputes } from "@/lib/supabase/queries";
import AdminDisputes from "@/components/admin/AdminDisputes";

export default async function AdminDisputesPage() {
  const disputes = await getAllDisputes();

  return <AdminDisputes disputes={disputes as never} />;
}
