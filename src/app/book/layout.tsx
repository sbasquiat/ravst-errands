import type { Metadata } from "next";
import { Suspense } from "react";
import BookingShell from "@/components/booking/BookingShell";

export const metadata: Metadata = {
  title: "Book an Errand",
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BookingShell>
      <Suspense>{children}</Suspense>
    </BookingShell>
  );
}
