"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit, Plus, ArrowLeft, ExternalLink, Mail, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumber, formatCurrency, formatCPV, formatPercentage, formatRelativeTime, getInitials } from "@/lib/utils";
import { ALL_STATUSES } from "@/lib/constants";
import { CreatorVideosTab } from "@/components/creators/creator-videos-tab";
import { CreatorPaymentsTab } from "@/components/creators/creator-payments-tab";
import { CreatorActivityTab } from "@/components/creators/creator-activity-tab";
import { CreatorNotesTab } from "@/components/creators/creator-notes-tab";
import { useToast } from "@/components/ui/toast";

export function CreatorDetail({ id }: { id: string }) {
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useToast();

  const fetchCreator = async () => {
    const res = await fetch(`/api/creators/${id}`);
    if (!res.ok) {
      router.push("/creators");
      return;
    }
    const data = await res.json();
    setCreator(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCreator();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    const oldStatus = creator.status;
    setCreator((prev: any) => ({ ...prev, status: newStatus }));
    const res = await fetch(`/api/creators/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      addToast({ title: "Status updated", variant: "success" });
      fetchCreator();
    } else {
      setCreator((prev: any) => ({ ...prev, status: oldStatus }));
      addToast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  if (loading || !creator) {
    return <div className="text-muted-foreground">Loading creator...</div>;
  }

  const { stats } = creator;

  return (
    <div className="space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Link href="/creators" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Creators</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/creators/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
          </Link>
          <Link href={`/creators/${id}/videos/new`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Video
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20 border-2 border-primary/30">
          {creator.profileImageUrl && <AvatarImage src={creator.profileImageUrl} />}
          <AvatarFallback className="text-2xl">{getInitials(creator.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">{creator.name}</h1>
            <PlatformIcon platform={creator.platform} size={20} />
            <StatusBadge status={creator.priority} type="priority" />
          </div>
          <p className="text-muted-foreground">@{creator.handle}</p>
          <div className="flex items-center gap-2 mt-2">
            <Select value={creator.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-44 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {creator.email && (
              <a href={`mailto:${creator.email}`} className="text-muted-foreground hover:text-white">
                <Mail className="h-4 w-4" />
              </a>
            )}
          </div>
          {/* Quick Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div>
              <span className="text-muted-foreground">Followers</span>
              <p className="font-semibold text-white">{formatNumber(creator.followerCount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Videos</span>
              <p className="font-semibold text-white">{creator._count?.videos || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Views</span>
              <p className="font-semibold text-white">{formatNumber(stats.totalViews)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Views</span>
              <p className="font-semibold text-white">{formatNumber(Math.round(stats.avgViews))}</p>
            </div>
            <div>
              <span className="text-muted-foreground">CPV</span>
              <p className="font-semibold text-green-400">{formatCPV(stats.totalSpend, stats.totalViews)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Paid</span>
              <p className="font-semibold text-white">{formatCurrency(stats.totalPaid)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Deal Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Rate per Video" value={creator.ratePerVideo ? formatCurrency(creator.ratePerVideo) : "Not set"} />
                <InfoRow label="Rate Type" value={creator.rateType?.replace(/_/g, " ") || "Not set"} />
                <InfoRow label="Payment Terms" value={creator.paymentTerms?.replace(/_/g, " ") || "Not set"} />
                {creator.revSharePercentage && (
                  <InfoRow label="Rev Share" value={`${creator.revSharePercentage}%`} />
                )}
                <InfoRow label="Deal Closed" value={creator.closedDate ? new Date(creator.closedDate).toLocaleDateString() : "—"} />
                {creator.contractNotes && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Contract Notes</p>
                    <p className="text-sm text-white whitespace-pre-wrap">{creator.contractNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Creator Info */}
            <Card>
              <CardHeader><CardTitle className="text-base">Creator Information</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <InfoRow label="Email" value={creator.email || "—"} />
                <InfoRow label="Phone" value={creator.phone || "—"} />
                <InfoRow label="Category" value={creator.category} />
                <InfoRow label="Source" value={creator.source?.replace(/_/g, " ")} />
                <InfoRow label="Assigned To" value={creator.assignedTo?.name || "Unassigned"} />
                <InfoRow label="Outreach Date" value={creator.outreachDate ? new Date(creator.outreachDate).toLocaleDateString() : "—"} />
                <InfoRow label="Response Date" value={creator.responseDate ? new Date(creator.responseDate).toLocaleDateString() : "—"} />
                {creator.tags.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {creator.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {creator.bio && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Bio</p>
                    <p className="text-sm text-white">{creator.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Performance Summary</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <StatBox label="Total Videos" value={creator._count?.videos || 0} />
                  <StatBox label="Total Views" value={formatNumber(stats.totalViews)} />
                  <StatBox label="Total Likes" value={formatNumber(stats.totalLikes)} />
                  <StatBox label="Avg Engagement" value={formatPercentage(stats.avgEngagement)} />
                  <StatBox label="Total Paid" value={formatCurrency(stats.totalPaid)} />
                  <StatBox label="CPV" value={formatCPV(stats.totalSpend, stats.totalViews)} highlight />
                  <StatBox label="Avg Views" value={formatNumber(Math.round(stats.avgViews))} />
                </div>
                {stats.bestVideo && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Best Performing Video</p>
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={stats.bestVideo.platform} />
                      <span className="text-sm text-white">{formatNumber(stats.bestVideo.views)} views</span>
                      {stats.bestVideo.postUrl && (
                        <a href={stats.bestVideo.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-300">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <CreatorVideosTab creatorId={id} videos={creator.videos || []} onRefresh={fetchCreator} />
        </TabsContent>

        <TabsContent value="payments">
          <CreatorPaymentsTab creatorId={id} payments={creator.payments || []} onRefresh={fetchCreator} />
        </TabsContent>

        <TabsContent value="activity">
          <CreatorActivityTab creatorId={id} activities={creator.activities || []} onRefresh={fetchCreator} />
        </TabsContent>

        <TabsContent value="notes">
          <CreatorNotesTab creatorId={id} initialNotes={creator.notes || ""} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-white">{value}</span>
    </div>
  );
}

function StatBox({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="text-center p-3 rounded-lg bg-surface-overlay/50">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-green-400" : "text-white"}`}>{value}</p>
    </div>
  );
}
