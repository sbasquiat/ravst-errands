import { redirect } from "next/navigation";
import { getCurrentUser, getErrandById } from "@/lib/supabase/queries";
import BookingConfirmation from "@/components/booking/BookingConfirmation";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ errand?: string; pi?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { errand: errandId } = await searchParams;

  if (!errandId) {
    redirect("/book");
  }

  let errand;
  try {
    errand = await getErrandById(errandId);
  } catch {
    redirect("/book");
  }

  // Only the customer who booked should see confirmation
  if (errand.customer_id !== user.id) {
    redirect("/dashboard");
  }

  return (
    <BookingConfirmation
      booking={{
        displayId: errand.display_id ?? errandId.slice(0, 8).toUpperCase(),
        type: errand.type,
        pickup: errand.pickup_address,
        dropoff: errand.dropoff_address,
        date: errand.scheduled_date,
        timeSlot: `${errand.time_slot_start}-${errand.time_slot_end}`,
        item: errand.item_description,
        total: errand.total_price,
        status: errand.status,
      }}
    />
  );
}
