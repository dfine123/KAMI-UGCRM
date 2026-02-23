"use client";

import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { formatNumber, formatCurrency, formatCPV } from "@/lib/utils";

interface Video {
  id: string;
  platform: string;
  contentType: string;
  postUrl: string | null;
  postedAt: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  amountPaid: number;
  paymentStatus: string;
  caption: string | null;
  productFeatured: string | null;
}

export function CreatorVideosTab({
  creatorId,
  videos,
  onRefresh,
}: {
  creatorId: string;
  videos: Video[];
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{videos.length} video{videos.length !== 1 ? "s" : ""}</p>
        <Link href={`/creators/${creatorId}/videos/new`}>
          <Button size="sm"><Plus className="h-4 w-4 mr-2" /> Add Video</Button>
        </Link>
      </div>
      {videos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No videos yet</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((video) => (
            <Card key={video.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={video.platform} />
                  <span className="text-xs text-muted-foreground">
                    {video.contentType.replace(/_/g, " ")}
                  </span>
                </div>
                <StatusBadge status={video.paymentStatus} type="payment" />
              </div>
              <div className="text-sm text-white">
                {new Date(video.postedAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </div>
              {video.caption && (
                <p className="text-xs text-muted-foreground line-clamp-2">{video.caption}</p>
              )}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Views</p>
                  <p className="text-sm font-semibold text-white">{formatNumber(video.views)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Likes</p>
                  <p className="text-sm font-semibold text-white">{formatNumber(video.likes)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Comments</p>
                  <p className="text-sm font-semibold text-white">{formatNumber(video.comments)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">CPV</p>
                  <p className="text-sm font-semibold text-green-400">{formatCPV(video.amountPaid, video.views)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-sm text-white">{formatCurrency(video.amountPaid)}</span>
                {video.postUrl && (
                  <a href={video.postUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-300 text-xs flex items-center gap-1">
                    View Post <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
