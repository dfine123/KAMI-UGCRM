import { Suspense } from "react";
import { AnalyticsContent } from "@/components/analytics/analytics-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep performance analysis across all creators</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[800px]" />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
