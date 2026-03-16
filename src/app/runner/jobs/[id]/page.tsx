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

  let messages: Awaited<ReturnType<typeof getErrandMessages>> = [];
  let proofs: Awaited<ReturnType<typeof getErrandProofs>> = [];

  try {
    [messages, proofs] = await Promise.all([
      getErrandMessages(id),
      getErrandProofs(id),
    ]);
  } catch (err) {
    console.error("Failed to load messages/proofs:", err);
    // Continue with empty arrays — page still renders
  }

  return (
    <RunnerJobDetail
      errand={errand}
      messages={messages}
      proofs={proofs}
      currentUserId={user.id}
    />
  );
}
