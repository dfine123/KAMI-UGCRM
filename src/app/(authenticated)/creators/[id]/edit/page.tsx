import { CreatorForm } from "@/components/creators/creator-form";

export default function EditCreatorPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Edit Creator</h1>
        <p className="text-muted-foreground mt-1">Update creator information</p>
      </div>
      <CreatorForm creatorId={params.id} />
    </div>
  );
}
