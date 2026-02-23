import { VideoForm } from "@/components/videos/video-form";

export default function NewVideoPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Add Video</h1>
        <p className="text-muted-foreground mt-1">Record a new branded content piece</p>
      </div>
      <VideoForm creatorId={params.id} />
    </div>
  );
}
