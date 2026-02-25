"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Table2, Kanban, Filter, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatNumber, formatCurrency, formatCPV, formatRelativeTime, getInitials, getProxiedImageUrl } from "@/lib/utils";
import { ALL_STATUSES, CATEGORIES, PLATFORMS } from "@/lib/constants";
import { KanbanBoard } from "@/components/creators/kanban-board";

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: string;
  category: string;
  status: string;
  followerCount: number;
  ratePerVideo: number | null;
  priority: string;
  profileImageUrl: string | null;
  tags: string[];
  assignedTo: { id: string; name: string } | null;
  totalViews: number;
  totalSpend: number;
  cpv: number;
  videoCount: number;
  updatedAt: string;
}

export function CreatorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchCreators = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (platformFilter) params.set("platform", platformFilter);

    const res = await fetch(`/api/creators?${params.toString()}`);
    const data = await res.json();
    setCreators(data.creators || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, statusFilter, categoryFilter, platformFilter]);

  useEffect(() => {
    fetchCreators();
  }, [fetchCreators]);

  const handleStatusChange = async (creatorId: string, newStatus: string) => {
    // Optimistic update
    setCreators((prev) =>
      prev.map((c) => (c.id === creatorId ? { ...c, status: newStatus } : c))
    );
    await fetch(`/api/creators/${creatorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setCategoryFilter("");
    setPlatformFilter("");
  };

  const hasFilters = search || statusFilter || categoryFilter || platformFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Creators</h1>
          <p className="text-muted-foreground mt-1">
            {total} creator{total !== 1 ? "s" : ""} in your CRM
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-white/10 p-1">
            <button
              onClick={() => setView("table")}
              className={`rounded-md px-3 py-1.5 text-sm ${
                view === "table" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Table2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`rounded-md px-3 py-1.5 text-sm ${
                view === "kanban" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
              }`}
            >
              <Kanban className="h-4 w-4" />
            </button>
          </div>
          <Link href="/creators/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Creator
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" /> Filters
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" /> Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-white/5 bg-card">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {ALL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Platforms</SelectItem>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Content */}
      {view === "table" ? (
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-surface-overlay/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Followers</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Rate</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Videos</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Views</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">CPV</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    Loading creators...
                  </td>
                </tr>
              ) : creators.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                    No creators found
                  </td>
                </tr>
              ) : (
                creators.map((creator) => (
                  <tr key={creator.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/creators/${creator.id}`} className="flex items-center gap-3 group">
                        <Avatar className="h-8 w-8">
                          {creator.profileImageUrl && (
                            <AvatarImage src={getProxiedImageUrl(creator.profileImageUrl)} />
                          )}
                          <AvatarFallback className="text-xs">
                            {getInitials(creator.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                            {creator.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{creator.handle}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PlatformIcon platform={creator.platform} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">
                        {creator.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={creator.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {formatNumber(creator.followerCount)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {creator.ratePerVideo ? formatCurrency(creator.ratePerVideo) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {creator.videoCount}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-white">
                      {formatNumber(creator.totalViews)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-green-400">
                      {formatCPV(creator.totalSpend, creator.totalViews)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatRelativeTime(creator.updatedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <KanbanBoard creators={creators} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
