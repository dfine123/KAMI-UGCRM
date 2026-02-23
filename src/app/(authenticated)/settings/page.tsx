import { Suspense } from "react";
import { SettingsContent } from "@/components/settings/settings-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage users, tags, and export data</p>
      </div>
      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <SettingsContent />
      </Suspense>
    </div>
  );
}
