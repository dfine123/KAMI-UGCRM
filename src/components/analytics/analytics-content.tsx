"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, formatCurrency, formatCPV, formatPercentage } from "@/lib/utils";
import { CHART_COLORS } from "@/lib/constants";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

export function AnalyticsContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics?period=${period}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [period]);

  if (loading || !data) {
    return <div className="text-muted-foreground">Loading analytics...</div>;
  }

  const { leaderboard, contentByType, contentByPlatform, topVideos, sourceStats } = data;

  const pieColors = [CHART_COLORS.primary, CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.cyan, CHART_COLORS.gray];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg border border-white/10 bg-card p-3 shadow-lg">
        <p className="text-sm font-medium text-white mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs text-muted-foreground">
            {entry.name}: {typeof entry.value === "number" && entry.value > 1000 ? formatNumber(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[
          { label: "7 Days", value: "7" },
          { label: "30 Days", value: "30" },
          { label: "90 Days", value: "90" },
          { label: "All Time", value: "99999" },
        ].map((p) => (
          <Button
            key={p.value}
            variant={period === p.value ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>

      {/* Creator Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Creator Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-surface-overlay/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase w-8">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Creator</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Videos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total Views</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Total Spend</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">CPV</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Engagement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.slice(0, 20).map((creator: any, i: number) => (
                  <tr key={creator.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-sm text-muted-foreground">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link href={`/creators/${creator.id}`} className="text-sm font-medium text-white hover:text-primary transition-colors">
                        {creator.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">{creator.videoCount}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{formatNumber(creator.totalViews)}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{formatCurrency(creator.totalSpend)}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-400">
                      {formatCPV(creator.totalSpend, creator.totalViews)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {formatPercentage(creator.engagementRate)}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">No data for this period</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content by Type */}
        <Card>
          <CardHeader><CardTitle className="text-base">Performance by Content Type</CardTitle></CardHeader>
          <CardContent>
            {contentByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentByType}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="type" tick={{ fill: "#94A3B8", fontSize: 11 }} tickFormatter={(v: string) => v.replace(/_/g, " ")} />
                  <YAxis tick={{ fill: "#94A3B8", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="views" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Views" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Content by Platform */}
        <Card>
          <CardHeader><CardTitle className="text-base">Performance by Platform</CardTitle></CardHeader>
          <CardContent>
            {contentByPlatform.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={contentByPlatform}
                    dataKey="views"
                    nameKey="platform"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ platform, percent }: any) => `${platform.replace(/_/g, " ")} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {contentByPlatform.map((_: any, i: number) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Source Effectiveness */}
        <Card>
          <CardHeader><CardTitle className="text-base">Source Effectiveness</CardTitle></CardHeader>
          <CardContent>
            {sourceStats.length > 0 ? (
              <div className="space-y-4">
                {sourceStats.map((s: any) => (
                  <div key={s.source} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white">{s.source.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground">
                        {s.active}/{s.total} active ({formatPercentage(s.conversionRate)} conv.)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface-overlay overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(s.conversionRate, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-12">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Top Videos */}
        <Card>
          <CardHeader><CardTitle className="text-base">Top Performing Videos</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[350px] overflow-y-auto">
              {topVideos.length > 0 ? topVideos.slice(0, 10).map((v: any, i: number) => (
                <div key={v.id} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0">
                  <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {v.creator?.name} — {v.contentType.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">{v.platform.replace(/_/g, " ")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-white">{formatNumber(v.views)} views</p>
                    <p className="text-xs text-green-400">CPV: {formatCPV(v.amountPaid, v.views)}</p>
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-12">No videos found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
