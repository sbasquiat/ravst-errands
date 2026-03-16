import { redirect } from "next/navigation";
import { getCurrentUser, getCustomerErrands } from "@/lib/supabase/queries";
import ErrandsList from "@/components/dashboard/ErrandsList";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const errands = await getCustomerErrands(user.id);

  return (
    <ErrandsList errands={errands} customerId={user.id} />
  );
}
