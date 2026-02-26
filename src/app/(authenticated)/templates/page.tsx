import { Suspense } from "react";
import { TemplatesContent } from "@/components/templates/templates-content";

export default function TemplatesPage() {
  return (
    <div>
      <Suspense fallback={<div className="text-muted-foreground">Loading templates...</div>}>
        <TemplatesContent />
      </Suspense>
    </div>
  );
}
