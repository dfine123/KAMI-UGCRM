import { Suspense } from "react";
import { CreatorsContent } from "@/components/creators/creators-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorsPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <CreatorsContent />
      </Suspense>
    </div>
  );
}
