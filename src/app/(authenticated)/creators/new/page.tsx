import { CreatorForm } from "@/components/creators/creator-form";

export default function NewCreatorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Add Creator</h1>
        <p className="text-muted-foreground mt-1">Add a new creator to your CRM pipeline</p>
      </div>
      <CreatorForm />
    </div>
  );
}
