"use client";

import { useEffect, useState } from "react";
import { Plus, Download, Trash2, Users, Tag, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface TagInfo {
  tag: string;
  count: number;
}

export function SettingsContent() {
  const { addToast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

  // New user form
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "VIEWER" });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((d) => { setUsers(Array.isArray(d) ? d : []); setLoadingUsers(false); });
    fetch("/api/tags").then((r) => r.json()).then((d) => { setTags(Array.isArray(d) ? d : []); setLoadingTags(false); });
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      addToast({ title: "All fields are required", variant: "destructive" });
      return;
    }
    setAddingUser(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      const user = await res.json();
      setUsers((prev) => [user, ...prev]);
      setNewUser({ name: "", email: "", password: "", role: "VIEWER" });
      addToast({ title: "User created", variant: "success" });
    } else {
      const err = await res.json();
      addToast({ title: err.error || "Failed to create user", variant: "destructive" });
    }
    setAddingUser(false);
  };

  return (
    <Tabs defaultValue="users" className="space-y-6">
      <TabsList>
        <TabsTrigger value="users"><Users className="h-4 w-4 mr-2" /> Users</TabsTrigger>
        <TabsTrigger value="tags"><Tag className="h-4 w-4 mr-2" /> Tags</TabsTrigger>
        <TabsTrigger value="export"><FileDown className="h-4 w-4 mr-2" /> Export</TabsTrigger>
      </TabsList>

      {/* Users Tab */}
      <TabsContent value="users" className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Add New User</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} placeholder="Password" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={addingUser}>
                <Plus className="h-4 w-4 mr-2" /> {addingUser ? "Adding..." : "Add User"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Team Members</CardTitle></CardHeader>
          <CardContent>
            {loadingUsers ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <div className="rounded-lg border border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-surface-overlay/50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm font-medium text-white">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-3">
                          <Badge variant={user.role === "ADMIN" ? "default" : "outline"} className="text-xs">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Tags Tab */}
      <TabsContent value="tags">
        <Card>
          <CardHeader><CardTitle className="text-base">All Tags ({tags.length})</CardTitle></CardHeader>
          <CardContent>
            {loadingTags ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : tags.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tags yet</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <Badge key={t.tag} variant="secondary" className="text-sm py-1 px-3">
                    {t.tag} <span className="ml-1 text-muted-foreground">({t.count})</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Export Tab */}
      <TabsContent value="export">
        <Card>
          <CardHeader><CardTitle className="text-base">Export Data</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Download your CRM data as CSV files.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/api/export?type=creators" download>
                <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Download className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-white">Export Creators</p>
                      <p className="text-xs text-muted-foreground">All creators with status, rates, and metadata</p>
                    </div>
                  </div>
                </Card>
              </a>
              <a href="/api/export?type=payments" download>
                <Card className="p-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Download className="h-8 w-8 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Export Payments</p>
                      <p className="text-xs text-muted-foreground">All payment records with creator info</p>
                    </div>
                  </div>
                </Card>
              </a>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
