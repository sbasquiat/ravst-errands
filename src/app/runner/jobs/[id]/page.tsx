import { redirect, notFound } from "next/navigation";
import {
  getCurrentUser,
  getErrandById,
  getErrandMessages,
  getErrandProofs,
} from "@/lib/supabase/queries";
import RunnerJobDetail from "@/components/runner/RunnerJobDetail";

export default async function RunnerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let errand;
  try {
    errand = await getErrandById(id);
  } catch {
    notFound();
  }

  if (!errand) notFound();

  const [messages, proofs] = await Promise.all([
    getErrandMessages(id),
    getErrandProofs(id),
  ]);

  return (
    <RunnerJobDetail
      errand={errand}
      messages={messages}
      proofs={proofs}
      currentUserId={user.id}
    />
  );
}
