import { createClient } from "@/lib/supabase/server";
import AdminCustomers from "@/components/admin/AdminCustomers";

export default async function AdminCustomersPage() {
  const supabase = await createClient();

  // Fetch all customers
  const { data: customers, error: custError } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (custError) throw custError;

  // Fetch errand counts and totals per customer
  const { data: errandStats } = await supabase
    .from("errands")
    .select("customer_id, total_price");

  // Fetch dispute counts per customer (filed_by)
  const { data: disputeStats } = await supabase
    .from("disputes")
    .select("filed_by");

  // Build lookup maps
  const errandMap = new Map<string, { count: number; spent: number }>();
  for (const e of errandStats ?? []) {
    const existing = errandMap.get(e.customer_id) ?? { count: 0, spent: 0 };
    existing.count += 1;
    existing.spent += e.total_price;
    errandMap.set(e.customer_id, existing);
  }

  const disputeMap = new Map<string, number>();
  for (const d of disputeStats ?? []) {
    disputeMap.set(d.filed_by, (disputeMap.get(d.filed_by) ?? 0) + 1);
  }

  // Enrich customer data
  const enriched = (customers ?? []).map((c) => ({
    ...c,
    errand_count: errandMap.get(c.id)?.count ?? 0,
    total_spent: errandMap.get(c.id)?.spent ?? 0,
    dispute_count: disputeMap.get(c.id) ?? 0,
  }));

  return <AdminCustomers customers={enriched} />;
}
