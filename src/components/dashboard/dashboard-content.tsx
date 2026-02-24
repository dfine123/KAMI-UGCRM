"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, GitBranch, TrendingUp, Eye, DollarSign, Video, ArrowRight, Plus, Download } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatNumber, formatCurrency, formatCPV, formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

interface DashboardData {
  summary: {
    totalCreators: number;
    activeCreators: number;
    pipelineCreators: number;
    conversionRate: number;
    totalViews: number;
    recentViews: number;
    totalSpend: number;
    avgCPV: number;
    totalVideos: number;
  };
  funnel: { stage: string; count: number }[];
  recentActivities: any[];
  topPerformers: any[];
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="text-muted-foreground">Loading dashboard...</div>;
  }

  const { summary, funnel, recentActivities, topPerformers } = data;

  const funnelColors = [
    "#6B7280", "#3B82F6", "#06B6D4", "#F59E0B", "#22C55E", "#8B5CF6", "#10B981",
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/creators/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add Creator
          </Button>
        </Link>
        <a href="/api/export?type=creators" download>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" /> Export Data
          </Button>
        </a>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Creators"
          value={summary.totalCreators}
          icon={Users}
          glowColor="purple"
        />
        <MetricCard
          title="Active Creators"
          value={summary.activeCreators}
          icon={UserCheck}
          glowColor="green"
        />
        <MetricCard
          title="In Pipeline"
          value={summary.pipelineCreators}
          icon={GitBranch}
          glowColor="amber"
        />
        <MetricCard
          title="Conversion Rate"
          value={summary.conversionRate + "%"}
          icon={TrendingUp}
          glowColor="green"
        />
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Total Views" value={formatNumber(summary.totalViews)} icon={Eye} />
        <MetricCard title="Views (30d)" value={formatNumber(summary.recentViews)} icon={Eye} />
        <MetricCard title="Total Spend" value={formatCurrency(summary.totalSpend)} icon={DollarSign} />
        <MetricCard title="Avg CPV" value={formatCPV(summary.totalSpend, summary.totalViews)} icon={TrendingUp} />
        <MetricCard title="Total Videos" value={summary.totalVideos} icon={Video} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnel.map((stage, i) => {
                const maxCount = Math.max(...funnel.map((f) => f.count), 1);
                const width = Math.max((stage.count / maxCount) * 100, 8);
                return (
                  <Link
                    key={stage.stage}
                    href={`/creators?status=${stage.stage}`}
                    className="block group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-28 text-right">
                        {stage.stage.replace(/_/g, " ")}
                      </span>
                      <div className="flex-1 relative">
                        <div
                          className="h-8 rounded-md flex items-center px-3 transition-all group-hover:opacity-80"
                          style={{
                            width: `${width}%`,
                            backgroundColor: funnelColors[i] || "#6B7280",
                          }}
                        >
                          <span className="text-xs font-bold text-white">
                            {stage.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {recentActivities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent activity
                </p>
              ) : (
                recentActivities.map((activity: any) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-0"
                  >
                    <StatusBadge status={activity.type} className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        <Link
                          href={`/creators/${activity.creator.id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {activity.creator.name}
                        </Link>
                        {" — "}
                        {activity.content}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.user.name} &middot;{" "}
                        {formatRelativeTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Top Performers (30 Days)</CardTitle>
          <Link href="/analytics">
            <Button variant="ghost" size="sm">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-surface-overlay/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Creator</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Videos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Views</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Avg Views</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Spend</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">CPV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topPerformers.map((creator: any) => (
                  <tr key={creator.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/creators/${creator.id}`}
                        className="text-sm font-medium text-white hover:text-primary transition-colors"
                      >
                        {creator.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{creator.handle}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">{creator.videosPosted}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{formatNumber(creator.totalViews)}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{formatNumber(creator.avgViews)}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{formatCurrency(creator.totalSpend)}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-400">{formatCPV(creator.totalSpend, creator.totalViews)}</td>
                  </tr>
                ))}
                {topPerformers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No active creators with recent videos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
