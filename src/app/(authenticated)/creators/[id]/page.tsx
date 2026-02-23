import { Suspense } from "react";
import { CreatorDetail } from "@/components/creators/creator-detail";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<Skeleton className="h-[800px]" />}>
      <CreatorDetail id={params.id} />
    </Suspense>
  );
}
