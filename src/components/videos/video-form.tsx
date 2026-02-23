"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { VIDEO_PLATFORMS, CONTENT_TYPES } from "@/lib/constants";

export function VideoForm({ creatorId }: { creatorId: string }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    platform: "INSTAGRAM_REEL",
    postUrl: "",
    thumbnailUrl: "",
    postedAt: new Date().toISOString().split("T")[0],
    contentType: "PACK_OPENING",
    caption: "",
    productFeatured: "",
    views: 0, likes: 0, comments: 0, shares: 0, saves: 0,
    amountPaid: 0,
    paymentStatus: "PENDING",
  });

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/creators/${creatorId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        views: Number(form.views),
        likes: Number(form.likes),
        comments: Number(form.comments),
        shares: Number(form.shares),
        saves: Number(form.saves),
        amountPaid: Number(form.amountPaid),
      }),
    });

    if (res.ok) {
      addToast({ title: "Video added", variant: "success" });
      router.push(`/creators/${creatorId}`);
    } else {
      addToast({ title: "Failed to add video", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Link href={`/creators/${creatorId}`} className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors text-sm">
        <ArrowLeft className="h-4 w-4" /> Back to Creator
      </Link>

      <Card>
        <CardHeader><CardTitle className="text-base">Content Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={form.platform} onValueChange={(v) => update("platform", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VIDEO_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Content Type</Label>
            <Select value={form.contentType} onValueChange={(v) => update("contentType", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Post URL</Label>
            <Input value={form.postUrl} onChange={(e) => update("postUrl", e.target.value)} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Posted Date</Label>
            <Input type="date" value={form.postedAt} onChange={(e) => update("postedAt", e.target.value)} required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Caption</Label>
            <Textarea value={form.caption} onChange={(e) => update("caption", e.target.value)} placeholder="Video caption..." />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Product Featured</Label>
            <Input value={form.productFeatured} onChange={(e) => update("productFeatured", e.target.value)} placeholder="e.g., PlayKami Pokemon Collection" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Performance Metrics</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Views</Label>
            <Input type="number" value={form.views} onChange={(e) => update("views", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Likes</Label>
            <Input type="number" value={form.likes} onChange={(e) => update("likes", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Comments</Label>
            <Input type="number" value={form.comments} onChange={(e) => update("comments", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Shares</Label>
            <Input type="number" value={form.shares} onChange={(e) => update("shares", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Saves</Label>
            <Input type="number" value={form.saves} onChange={(e) => update("saves", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount Paid ($)</Label>
            <Input type="number" step="0.01" value={form.amountPaid} onChange={(e) => update("amountPaid", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select value={form.paymentStatus} onValueChange={(v) => update("paymentStatus", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="INVOICED">Invoiced</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="DISPUTED">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 justify-end">
        <Link href={`/creators/${creatorId}`}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Video"}
        </Button>
      </div>
    </form>
  );
}
