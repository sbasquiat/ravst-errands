import { redirect, notFound } from "next/navigation";
import { getCurrentUser, getErrandById, getErrandTimeline, getErrandProofs, getErrandMessages } from "@/lib/supabase/queries";
import ErrandDetail from "@/components/dashboard/ErrandDetail";

export default async function ErrandDetailPage({
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

  // Only the customer or assigned runner should see this
  if (errand.customer_id !== user.id && errand.runner_id !== user.id) {
    redirect("/dashboard");
  }

  let timeline: Awaited<ReturnType<typeof getErrandTimeline>> = [];
  let proofs: Awaited<ReturnType<typeof getErrandProofs>> = [];
  let messages: Awaited<ReturnType<typeof getErrandMessages>> = [];

  try {
    [timeline, proofs, messages] = await Promise.all([
      getErrandTimeline(id),
      getErrandProofs(id),
      getErrandMessages(id),
    ]);
  } catch (err) {
    console.error("Failed to load errand details:", err);
    // Continue with empty arrays — page still renders
  }

  return (
    <ErrandDetail
      errand={errand}
      timeline={timeline}
      proofs={proofs}
      messages={messages}
      currentUserId={user.id}
    />
  );
}
