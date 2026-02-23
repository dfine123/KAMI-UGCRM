"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { formatNumber, formatCurrency, getInitials } from "@/lib/utils";
import { PIPELINE_STAGES, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  status: string;
  followerCount: number;
  ratePerVideo: number | null;
  profileImageUrl: string | null;
  totalViews: number;
  priority: string;
}

interface KanbanBoardProps {
  creators: Creator[];
  onStatusChange: (creatorId: string, newStatus: string) => void;
}

export function KanbanBoard({ creators, onStatusChange }: KanbanBoardProps) {
  const stages = [...PIPELINE_STAGES, "PAUSED" as const];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => {
        const stageCreators = creators.filter((c) => c.status === stage);
        return (
          <div
            key={stage}
            className="flex-shrink-0 w-72"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const creatorId = e.dataTransfer.getData("creatorId");
              if (creatorId) onStatusChange(creatorId, stage);
            }}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={cn("h-2 w-2 rounded-full", 
                stage === "ACTIVE" ? "bg-green-500" :
                stage === "PAUSED" ? "bg-orange-500" :
                "bg-primary"
              )} />
              <h3 className="text-sm font-medium text-white">
                {stage.replace(/_/g, " ")}
              </h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {stageCreators.length}
              </span>
            </div>
            <div className="space-y-2 min-h-[200px] rounded-lg border border-white/5 bg-surface-overlay/30 p-2">
              {stageCreators.map((creator) => (
                <div
                  key={creator.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("creatorId", creator.id);
                  }}
                  className="rounded-lg border border-white/5 bg-card p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                >
                  <Link href={`/creators/${creator.id}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        {creator.profileImageUrl && (
                          <AvatarImage src={creator.profileImageUrl} />
                        )}
                        <AvatarFallback className="text-[10px]">
                          {getInitials(creator.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {creator.name}
                        </p>
                      </div>
                      <PlatformIcon platform={creator.platform} size={14} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(creator.followerCount)} followers</span>
                      <span>{creator.ratePerVideo ? formatCurrency(creator.ratePerVideo) : "—"}</span>
                    </div>
                    {creator.priority === "HIGH" && (
                      <div className="mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                          HIGH PRIORITY
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
