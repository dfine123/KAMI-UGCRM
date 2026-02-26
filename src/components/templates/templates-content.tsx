"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { TEMPLATE_CATEGORIES, TEMPLATE_PLATFORMS } from "@/lib/constants";

interface Template {
  id: string;
  name: string;
  category: string;
  platform: string;
  subject: string | null;
  body: string;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdBy: { name: string };
  createdAt: string;
  updatedAt: string;
}

const SAMPLE_DATA: Record<string, string> = {
  "{{creator_name}}": "Alex Rivera",
  "{{handle}}": "@alexrivera",
  "{{follower_count}}": "125K",
  "{{bio}}": "TCG collector & pack opener",
  "{{platform}}": "Instagram",
  "{{rate}}": "$500",
  "{{product}}": "PlayKami digital packs",
  "{{greeting}}": "Hey!",
};

function renderPreview(body: string): string {
  let result = body;
  Object.entries(SAMPLE_DATA).forEach(([key, value]) => {
    result = result.replaceAll(key, value);
  });
  return result;
}

export function TemplatesContent() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [platFilter, setPlatFilter] = useState("");

  const [form, setForm] = useState({
    name: "", category: "INITIAL_OUTREACH", platform: "UNIVERSAL",
    subject: "", body: "", tags: "", isActive: true,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter) params.set("category", catFilter);
    if (platFilter) params.set("platform", platFilter);
    const res = await fetch(`/api/templates?${params}`);
    const data = await res.json();
    setTemplates(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, [search, catFilter, platFilter]);

  const resetForm = () => {
    setForm({ name: "", category: "INITIAL_OUTREACH", platform: "UNIVERSAL", subject: "", body: "", tags: "", isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (t: Template) => {
    setForm({
      name: t.name, category: t.category, platform: t.platform,
      subject: t.subject || "", body: t.body, tags: t.tags.join(", "), isActive: t.isActive,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.body) {
      addToast({ title: "Name and body are required", variant: "destructive" });
      return;
    }
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const url = editingId ? `/api/templates/${editingId}` : "/api/templates";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) {
      addToast({ title: editingId ? "Template updated" : "Template created", variant: "success" });
      resetForm();
      fetchTemplates();
    } else {
      addToast({ title: "Failed to save template", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
    if (res.ok) {
      addToast({ title: "Template deleted", variant: "success" });
      fetchTemplates();
    }
  };

  const catColorMap: Record<string, string> = {
    INITIAL_OUTREACH: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    FOLLOW_UP: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    NEGOTIATION: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    ONBOARDING: "bg-green-500/20 text-green-300 border-green-500/30",
    REACTIVATION: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    RATE_RESPONSE: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    INFO_RESPONSE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    CUSTOM: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Templates</h1>
          <p className="text-muted-foreground mt-1">{templates.length} message template{templates.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search templates..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={catFilter} onValueChange={setCatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {TEMPLATE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={platFilter} onValueChange={setPlatFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All Platforms" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Platforms</SelectItem>
            {TEMPLATE_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">{editingId ? "Edit Template" : "Create Template"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Initial DM - TCG Creators" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TEMPLATE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={form.platform} onValueChange={(v) => setForm((p) => ({ ...p, platform: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TEMPLATE_PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject (for emails)</Label>
                  <Input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Email subject line..." />
                </div>
                <div className="space-y-2">
                  <Label>Body *</Label>
                  <Textarea
                    value={form.body}
                    onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                    placeholder={"Hey {{creator_name}}! I came across your page {{handle}} and loved your content..."}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Variables: {"{{creator_name}}, {{handle}}, {{follower_count}}, {{bio}}, {{platform}}, {{rate}}, {{product}}, {{greeting}}"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="tcg, outreach, dm" />
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                </div>
              </div>

              {/* Live Preview */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Eye className="h-3 w-3" /> Live Preview</Label>
                <div className="rounded-lg border border-white/10 bg-surface-overlay/50 p-4 min-h-[300px]">
                  {form.subject && (
                    <p className="text-sm font-medium text-white mb-3 pb-2 border-b border-white/10">
                      Subject: {renderPreview(form.subject)}
                    </p>
                  )}
                  <p className="text-sm text-white whitespace-pre-wrap">
                    {form.body ? renderPreview(form.body) : <span className="text-muted-foreground">Start typing to see preview...</span>}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Preview uses sample data. Actual creator data will be used when applying templates.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Cards */}
      {loading ? (
        <div className="text-muted-foreground">Loading templates...</div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No templates yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className={!t.isActive ? "opacity-50" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-white text-sm">{t.name}</h3>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEdit(t)} className="p-1 text-muted-foreground hover:text-white">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1 text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={`text-[10px] ${catColorMap[t.category] || catColorMap.CUSTOM}`}>
                    {t.category.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {t.platform.replace(/_/g, " ")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  {t.body.slice(0, 150)}{t.body.length > 150 ? "..." : ""}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-white/5">
                  <span>Used {t.usageCount}x</span>
                  {t.tags.length > 0 && (
                    <span className="truncate ml-2">{t.tags.join(", ")}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
