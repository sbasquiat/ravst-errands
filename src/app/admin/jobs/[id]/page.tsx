import { notFound } from "next/navigation";
import {
  getErrandById,
  getErrandTimeline,
  getErrandProofs,
  getAllRunners,
} from "@/lib/supabase/queries";
import AdminJobDetail from "@/components/admin/AdminJobDetail";

export default async function AdminJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let errand;
  try {
    errand = await getErrandById(id);
  } catch {
    notFound();
  }

  if (!errand) notFound();

  const [timeline, proofs, allRunners] = await Promise.all([
    getErrandTimeline(id),
    getErrandProofs(id),
    getAllRunners(),
  ]);

  // Filter to active runners for reassignment
  const availableRunners = (allRunners ?? [])
    .filter((r) => r.status === "active")
    .map((r) => ({
      id: r.id,
      profile: {
        full_name: r.profile?.full_name ?? null,
        avatar_url: r.profile?.avatar_url ?? null,
      },
    }));

  return (
    <AdminJobDetail
      errand={errand as never}
      timeline={timeline}
      proofs={proofs}
      availableRunners={availableRunners}
    />
  );
}
