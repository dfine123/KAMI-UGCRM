"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, AlertTriangle, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/ui/image-upload";
import { useToast } from "@/components/ui/toast";
import { ALL_STATUSES, CATEGORIES, PLATFORMS, SOURCES, RATE_TYPES, PAYMENT_TERMS, TONES } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

interface CreatorFormProps {
  creatorId?: string;
}

interface IGProfile {
  fullName: string;
  username: string;
  bio: string;
  profilePicUrl: string;
  followers: number;
  following: number;
  postCount: number;
  isPrivate: boolean;
}

export function CreatorForm({ creatorId }: CreatorFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!creatorId);
  const [users, setUsers] = useState<{ id: string; name: string }[]>([]);

  // Instagram import state
  const [igInput, setIgInput] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [igProfile, setIgProfile] = useState<IGProfile | null>(null);

  const [form, setForm] = useState({
    name: "", handle: "", email: "", phone: "",
    platform: "INSTAGRAM", category: "TCG",
    followerCount: 0, engagementRate: 0,
    profileImageUrl: "", bio: "", tone: "NEUTRAL",
    status: "LEAD", source: "OUTBOUND_DM", priority: "MEDIUM",
    assignedToId: "", outreachDate: "", responseDate: "", closedDate: "",
    ratePerVideo: 0, rateType: "FLAT", paymentTerms: "NET_30",
    revSharePercentage: 0, contractNotes: "",
    tags: "", notes: "",
  });

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((data) => setUsers(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (!creatorId) return;
    fetch(`/api/creators/${creatorId}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          name: data.name || "", handle: data.handle || "",
          email: data.email || "", phone: data.phone || "",
          platform: data.platform || "INSTAGRAM", category: data.category || "TCG",
          followerCount: data.followerCount || 0, engagementRate: data.engagementRate || 0,
          profileImageUrl: data.profileImageUrl || "", bio: data.bio || "",
          tone: data.tone || "NEUTRAL",
          status: data.status || "LEAD", source: data.source || "OUTBOUND_DM",
          priority: data.priority || "MEDIUM", assignedToId: data.assignedToId || "",
          outreachDate: data.outreachDate ? data.outreachDate.split("T")[0] : "",
          responseDate: data.responseDate ? data.responseDate.split("T")[0] : "",
          closedDate: data.closedDate ? data.closedDate.split("T")[0] : "",
          ratePerVideo: data.ratePerVideo || 0, rateType: data.rateType || "FLAT",
          paymentTerms: data.paymentTerms || "NET_30",
          revSharePercentage: data.revSharePercentage || 0,
          contractNotes: data.contractNotes || "",
          tags: (data.tags || []).join(", "), notes: data.notes || "",
        });
        setFetching(false);
      });
  }, [creatorId]);

  const fetchInstagramProfile = async () => {
    if (!igInput.trim()) return;
    setIgLoading(true);
    setIgProfile(null);
    try {
      const res = await fetch("/api/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: igInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast({ title: data.error || "Failed to fetch profile", variant: "destructive" });
        return;
      }
      setIgProfile(data);
    } catch {
      addToast({ title: "Failed to fetch Instagram profile", variant: "destructive" });
    } finally {
      setIgLoading(false);
    }
  };

  const applyInstagramProfile = () => {
    if (!igProfile) return;
    setForm((prev) => ({
      ...prev,
      name: igProfile.fullName || prev.name,
      handle: igProfile.username || prev.handle,
      bio: igProfile.bio || prev.bio,
      profileImageUrl: igProfile.profilePicUrl || prev.profileImageUrl,
      followerCount: igProfile.followers || prev.followerCount,
      platform: "INSTAGRAM",
      notes: igProfile.postCount > 0
        ? `${prev.notes ? prev.notes + "\n" : ""}Instagram posts: ${igProfile.postCount}`
        : prev.notes,
    }));
    setIgProfile(null);
    addToast({ title: "Profile data imported", variant: "success" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.handle) {
      addToast({ title: "Name and handle are required", variant: "destructive" });
      return;
    }
    setLoading(true);

    const payload = {
      ...form,
      followerCount: Number(form.followerCount),
      engagementRate: Number(form.engagementRate),
      ratePerVideo: Number(form.ratePerVideo) || null,
      revSharePercentage: Number(form.revSharePercentage) || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      assignedToId: form.assignedToId || null,
      outreachDate: form.outreachDate || null,
      responseDate: form.responseDate || null,
      closedDate: form.closedDate || null,
    };

    const url = creatorId ? `/api/creators/${creatorId}` : "/api/creators";
    const method = creatorId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      addToast({ title: creatorId ? "Creator updated" : "Creator added", variant: "success" });
      router.push(`/creators/${data.id || creatorId}`);
    } else {
      addToast({ title: "Failed to save creator", variant: "destructive" });
    }
    setLoading(false);
  };

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  if (fetching) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link href={creatorId ? `/creators/${creatorId}` : "/creators"} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Instagram Import */}
      {!creatorId && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" /> Import from Instagram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={igInput}
                onChange={(e) => setIgInput(e.target.value)}
                placeholder="@username or https://instagram.com/username"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), fetchInstagramProfile())}
              />
              <Button
                type="button"
                onClick={fetchInstagramProfile}
                disabled={igLoading || !igInput.trim()}
              >
                {igLoading ? "Fetching..." : "Fetch"}
              </Button>
            </div>

            {igProfile && (
              <div className="rounded-lg border border-white/10 bg-surface-overlay/50 p-4 space-y-3">
                {igProfile.isPrivate && (
                  <div className="flex items-center gap-2 text-amber-400 text-sm">
                    <Lock className="h-4 w-4" />
                    <span>This account is private. Only public info is available.</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {igProfile.profilePicUrl && (
                    <img
                      src={`/api/image-proxy?url=${encodeURIComponent(igProfile.profilePicUrl)}`}
                      alt={igProfile.fullName}
                      className="h-16 w-16 rounded-full object-cover border border-white/10"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{igProfile.fullName}</p>
                    <p className="text-sm text-muted-foreground">@{igProfile.username}</p>
                    {igProfile.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{igProfile.bio}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Followers</span>
                    <p className="font-semibold text-white">{formatNumber(igProfile.followers)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Following</span>
                    <p className="font-semibold text-white">{formatNumber(igProfile.following)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Posts</span>
                    <p className="font-semibold text-white">{formatNumber(igProfile.postCount)}</p>
                  </div>
                </div>
                <Button type="button" onClick={applyInstagramProfile} className="w-full">
                  Apply to Form
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Creator name" required />
          </div>
          <div className="space-y-2">
            <Label>Handle *</Label>
            <Input value={form.handle} onChange={(e) => update("handle", e.target.value)} placeholder="@handle" required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => update("category", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Follower Count</Label>
            <Input type="number" value={form.followerCount} onChange={(e) => update("followerCount", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Engagement Rate (%)</Label>
            <Input type="number" step="0.1" value={form.engagementRate} onChange={(e) => update("engagementRate", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={form.tone} onValueChange={(v) => update("tone", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TONES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Profile Image</Label>
            <ImageUpload value={form.profileImageUrl} onChange={(url) => update("profileImageUrl", url)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Brief bio..." />
          </div>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <Card>
        <CardHeader><CardTitle className="text-base">Pipeline</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => update("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCES.map((s) => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => update("priority", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Assigned To</Label>
            <Select value={form.assignedToId} onValueChange={(v) => update("assignedToId", v)}>
              <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">Unassigned</SelectItem>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Outreach Date</Label>
            <Input type="date" value={form.outreachDate} onChange={(e) => update("outreachDate", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Response Date</Label>
            <Input type="date" value={form.responseDate} onChange={(e) => update("responseDate", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Deal Terms */}
      <Card>
        <CardHeader><CardTitle className="text-base">Deal Terms</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Rate per Video ($)</Label>
            <Input type="number" step="0.01" value={form.ratePerVideo} onChange={(e) => update("ratePerVideo", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Rate Type</Label>
            <Select value={form.rateType} onValueChange={(v) => update("rateType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RATE_TYPES.map((r) => <SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Payment Terms</Label>
            <Select value={form.paymentTerms} onValueChange={(v) => update("paymentTerms", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_TERMS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Rev Share %</Label>
            <Input type="number" step="0.1" value={form.revSharePercentage} onChange={(e) => update("revSharePercentage", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Closed Date</Label>
            <Input type="date" value={form.closedDate} onChange={(e) => update("closedDate", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Contract Notes</Label>
            <Textarea value={form.contractNotes} onChange={(e) => update("contractNotes", e.target.value)} placeholder="Deal terms, conditions..." />
          </div>
        </CardContent>
      </Card>

      {/* Tags & Notes */}
      <Card>
        <CardHeader><CardTitle className="text-base">Tags & Notes</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tags (comma separated)</Label>
            <Input value={form.tags} onChange={(e) => update("tags", e.target.value)} placeholder="whale, pokemon, micro-influencer" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Additional notes..." className="min-h-[120px]" />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Link href={creatorId ? `/creators/${creatorId}` : "/creators"}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : creatorId ? "Update Creator" : "Add Creator"}
        </Button>
      </div>
    </form>
  );
}
