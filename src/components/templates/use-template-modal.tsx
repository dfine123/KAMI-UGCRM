"use client";

import { useEffect, useState } from "react";
import { Copy, Sparkles, RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatNumber } from "@/lib/utils";

interface Creator {
  id: string;
  name: string;
  handle: string;
  bio: string | null;
  followerCount: number;
  category: string;
  platform: string;
  ratePerVideo: number | null;
  notes: string | null;
  tone: string;
}

interface Template {
  id: string;
  name: string;
  category: string;
  platform: string;
  body: string;
  subject: string | null;
}

interface UseTemplateModalProps {
  creator: Creator;
  onClose: () => void;
}

function getGreeting(tone: string): string {
  switch (tone) {
    case "CASUAL_MALE": return "Yo what's good bro";
    case "CASUAL_FEMALE": return "Hey!";
    case "FORMAL": return "Hi";
    default: return "Hey!";
  }
}

function applyVariables(body: string, creator: Creator): string {
  return body
    .replaceAll("{{creator_name}}", creator.name)
    .replaceAll("{{handle}}", `@${creator.handle}`)
    .replaceAll("{{follower_count}}", formatNumber(creator.followerCount))
    .replaceAll("{{bio}}", creator.bio || "")
    .replaceAll("{{platform}}", creator.platform.replace(/_/g, " "))
    .replaceAll("{{rate}}", creator.ratePerVideo ? `$${creator.ratePerVideo}` : "TBD")
    .replaceAll("{{product}}", "PlayKami digital packs")
    .replaceAll("{{greeting}}", getGreeting(creator.tone));
}

export function UseTemplateModal({ creator, onClose }: UseTemplateModalProps) {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Template | null>(null);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/templates?activeOnly=true")
      .then((r) => r.json())
      .then((data) => {
        setTemplates(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const selectTemplate = (t: Template) => {
    setSelected(t);
    setMessage(applyVariables(t.body, creator));
  };

  const aiPersonalize = async () => {
    if (!selected) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai-personalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateBody: selected.body,
          creator: {
            name: creator.name,
            handle: creator.handle,
            bio: creator.bio,
            followerCount: creator.followerCount,
            category: creator.category,
            notes: creator.notes,
          },
          tone: creator.tone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setMessage(data.message);
      } else {
        addToast({ title: data.error || "AI generation failed", variant: "destructive" });
      }
    } catch {
      addToast({ title: "AI generation failed", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Increment usage count
    if (selected) {
      fetch(`/api/templates/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementUsage: true }),
      });
    }

    // Log activity
    const activityType = selected?.platform === "EMAIL" ? "EMAIL" : "DM";
    fetch(`/api/creators/${creator.id}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: activityType,
        content: `${activityType === "EMAIL" ? "Email" : "DM"} drafted using template "${selected?.name}": ${message.slice(0, 200)}...`,
      }),
    });

    addToast({ title: "Copied to clipboard!", variant: "success" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-card border border-white/10 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">
            {selected ? "Personalize Message" : "Choose Template"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            // Template list
            loading ? (
              <p className="text-muted-foreground">Loading templates...</p>
            ) : templates.length === 0 ? (
              <p className="text-muted-foreground">No active templates. Create one in the Templates page.</p>
            ) : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => selectTemplate(t)}
                    className="w-full text-left rounded-lg border border-white/5 p-4 hover:border-primary/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white text-sm">{t.name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {t.category.replace(/_/g, " ")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {t.platform.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.body.slice(0, 120)}...</p>
                  </button>
                ))}
              </div>
            )
          ) : (
            // Message editor
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setSelected(null); setMessage(""); }}
                  className="text-sm text-muted-foreground hover:text-white"
                >
                  &larr; Back to templates
                </button>
                <Badge variant="outline" className="text-[10px]">{selected.name}</Badge>
              </div>

              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
                placeholder="Message will appear here..."
              />

              <div className="flex gap-2">
                <Button onClick={aiPersonalize} disabled={aiLoading} variant="outline" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {aiLoading ? "Generating..." : "AI Personalize"}
                </Button>
                {aiLoading ? null : message && (
                  <Button onClick={aiPersonalize} variant="ghost" size="sm" className="gap-1" title="Regenerate">
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selected && message && (
          <div className="border-t border-white/5 px-6 py-4">
            <Button onClick={copyToClipboard} className="w-full gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy to Clipboard"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
