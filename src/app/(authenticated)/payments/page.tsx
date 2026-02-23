import { Suspense } from "react";
import { PaymentsContent } from "@/components/payments/payments-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Payments</h1>
        <p className="text-muted-foreground mt-1">Track and manage all creator payments</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <PaymentsContent />
      </Suspense>
    </div>
  );
}
