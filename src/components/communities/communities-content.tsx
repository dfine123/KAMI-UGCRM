"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2, Users, Send, MessageCircle, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MetricCard } from "@/components/shared/metric-card";
import { useToast } from "@/components/ui/toast";
import { cn, formatNumber } from "@/lib/utils";
import { COMMUNITY_STATUSES, COMMUNITY_STATUS_COLORS } from "@/lib/constants";

interface Community {
  id: string;
  name: string;
  communityPlatform: string;
  creatorPlatform: string | null;
  communitySize: number;
  creatorSize: string | null;
  status: string;
  askingDeal: string | null;
  notes: string | null;
  updatedAt: string;
}

const EMPTY_FORM = {
  name: "", communityPlatform: "DISCORD", creatorPlatform: "", communitySize: "",
  creatorSize: "", status: "NOT_CONTACTED", askingDeal: "", notes: "",
};

const label = (s: string) => s.replace(/_/g, " ");

export function CommunitiesContent() {
  const { addToast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCommunities = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    const res = await fetch(`/api/communities?${params}`);
    const data = await res.json();
    setCommunities(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { fetchCommunities(); }, [fetchCommunities]);

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (c: Community) => {
    setForm({
      name: c.name,
      communityPlatform: c.communityPlatform,
      creatorPlatform: c.creatorPlatform || "",
      communitySize: String(c.communitySize),
      creatorSize: c.creatorSize || "",
      status: c.status,
      askingDeal: c.askingDeal || "",
      notes: c.notes || "",
    });
    setEditingId(c.id);
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      addToast({ title: "Name is required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const res = await fetch(editingId ? `/api/communities/${editingId}` : "/api/communities", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      addToast({ title: "Failed to save community", variant: "destructive" });
      return;
    }
    addToast({ title: editingId ? "Community updated" : "Community added", variant: "success" });
    setDialogOpen(false);
    fetchCommunities();
  };

  const changeStatus = async (id: string, status: string) => {
    const previous = communities;
    setCommunities((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    const res = await fetch(`/api/communities/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setCommunities(previous);
      addToast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const remove = async (c: Community) => {
    if (!confirm(`Delete ${c.name}?`)) return;
    const res = await fetch(`/api/communities/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      addToast({ title: "Community deleted", variant: "success" });
      fetchCommunities();
    }
  };

  const update = (field: keyof typeof EMPTY_FORM, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const totalReach = communities.reduce((sum, c) => sum + c.communitySize, 0);
  const contacted = communities.filter((c) => c.status !== "NOT_CONTACTED").length;
  const responded = communities.filter((c) =>
    ["RESPONDED", "NEGOTIATING", "PARTNERED"].includes(c.status)
  ).length;
  const partnered = communities.filter((c) => c.status === "PARTNERED").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Community Reach" value={formatNumber(totalReach)} icon={Users} glowColor="purple" />
        <MetricCard title="Reached Out" value={`${contacted} / ${communities.length}`} icon={Send} />
        <MetricCard title="Responded" value={responded} icon={MessageCircle} glowColor="amber" />
        <MetricCard title="Partnered" value={partnered} icon={Handshake} glowColor="green" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search communities or notes..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            {COMMUNITY_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={openNew} className="ml-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Community
        </Button>
      </div>

      <div className="rounded-lg border border-white/5 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 bg-surface-overlay/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Community</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Size</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Creator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Asking Deal</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Notes</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading communities...</td></tr>
            ) : communities.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No communities found</td></tr>
            ) : (
              communities.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02] transition-colors align-top">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{label(c.communityPlatform)}</p>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-white">{formatNumber(c.communitySize)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {c.creatorPlatform && <Badge variant="outline" className="text-xs">{c.creatorPlatform}</Badge>}
                      {c.creatorSize && <Badge variant="secondary" className="text-xs">{c.creatorSize}</Badge>}
                      {!c.creatorPlatform && !c.creatorSize && <span className="text-sm text-muted-foreground">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Select value={c.status} onValueChange={(v) => changeStatus(c.id, v)}>
                      <SelectTrigger className={cn("h-7 w-36 border text-xs font-semibold", COMMUNITY_STATUS_COLORS[c.status])}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMUNITY_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{c.askingDeal || <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs whitespace-pre-wrap">{c.notes || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(c)} className="p-1 text-muted-foreground hover:text-white" aria-label="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c)} className="p-1 text-muted-foreground hover:text-red-400" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Community" : "Add Community"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label>Creator / Community Name *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. AyeZee" />
            </div>
            <div className="space-y-2">
              <Label>Community Platform</Label>
              <Input value={form.communityPlatform} onChange={(e) => update("communityPlatform", e.target.value)} placeholder="DISCORD" />
            </div>
            <div className="space-y-2">
              <Label>Community Size</Label>
              <Input type="number" value={form.communitySize} onChange={(e) => update("communitySize", e.target.value)} placeholder="Members" />
            </div>
            <div className="space-y-2">
              <Label>Creator Main Platform</Label>
              <Input value={form.creatorPlatform} onChange={(e) => update("creatorPlatform", e.target.value)} placeholder="KICK, INSTAGRAM..." />
            </div>
            <div className="space-y-2">
              <Label>Creator Size</Label>
              <Input value={form.creatorSize} onChange={(e) => update("creatorSize", e.target.value)} placeholder="S, M, L, XL, XXL" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMMUNITY_STATUSES.map((s) => <SelectItem key={s} value={s}>{label(s)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Asking Deal</Label>
              <Input value={form.askingDeal} onChange={(e) => update("askingDeal", e.target.value)} placeholder="e.g. Retainer + rev share" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Creator / community notes..." />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : editingId ? "Update" : "Add Community"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
