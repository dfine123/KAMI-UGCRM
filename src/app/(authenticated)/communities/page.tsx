import { Suspense } from "react";
import { CommunitiesContent } from "@/components/communities/communities-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommunitiesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Communities</h1>
        <p className="text-muted-foreground mt-1">Discord community partnership outreach</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <CommunitiesContent />
      </Suspense>
    </div>
  );
}
