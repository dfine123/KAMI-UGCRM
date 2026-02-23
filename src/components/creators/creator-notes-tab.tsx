"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

export function CreatorNotesTab({
  creatorId,
  initialNotes,
}: {
  creatorId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { addToast } = useToast();

  const saveNotes = useCallback(async (content: string) => {
    setSaving(true);
    const res = await fetch(`/api/creators/${creatorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: content }),
    });
    if (res.ok) {
      setLastSaved(new Date());
    }
    setSaving(false);
  }, [creatorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== initialNotes) {
        saveNotes(notes);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [notes, initialNotes, saveNotes]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Notes are auto-saved. Use markdown for formatting.
        </p>
        <p className="text-xs text-muted-foreground">
          {saving ? "Saving..." : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ""}
        </p>
      </div>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add notes about this creator... negotiation history, content preferences, communication style, etc."
        className="min-h-[400px] font-mono text-sm"
      />
    </div>
  );
}
