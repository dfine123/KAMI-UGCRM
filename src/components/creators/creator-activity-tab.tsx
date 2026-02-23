"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Activity {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  metadata: any;
  user: { name: string };
}

export function CreatorActivityTab({
  creatorId,
  activities,
  onRefresh,
}: {
  creatorId: string;
  activities: Activity[];
  onRefresh: () => void;
}) {
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState("NOTE");
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    setSubmitting(true);

    const res = await fetch(`/api/creators/${creatorId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: noteType, content: note }),
    });

    if (res.ok) {
      setNote("");
      addToast({ title: "Activity logged", variant: "success" });
      onRefresh();
    } else {
      addToast({ title: "Failed to log activity", variant: "destructive" });
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      {/* Add Note */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <Select value={noteType} onValueChange={setNoteType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOTE">Note</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="DM">DM</SelectItem>
            <SelectItem value="CALL">Call</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Add a note or log an interaction..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={submitting || !note.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Timeline */}
      <div className="space-y-1">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No activity yet</div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0"
            >
              <StatusBadge status={activity.type} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white">{activity.content}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity.user.name} &middot; {formatRelativeTime(activity.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
