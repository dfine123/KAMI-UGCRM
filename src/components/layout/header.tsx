"use client";

import { useSession } from "next-auth/react";
import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Header() {
  const { data: session } = useSession();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/creators?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-surface/80 backdrop-blur-xl px-6">
      <form onSubmit={handleSearch} className="relative w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search creators, tags, notes..."
          className="pl-10 bg-surface-overlay border-white/5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </form>
      <div className="flex items-center gap-4">
        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {session?.user?.name ? getInitials(session.user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-white">
              {session?.user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {session?.user?.role || "Viewer"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
