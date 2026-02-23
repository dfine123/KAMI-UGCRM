"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Clock, CheckCircle, AlertCircle, Download } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  createdAt: string;
  creator: { id: string; name: string; handle: string };
  video: { id: string; platform: string; postUrl: string | null } | null;
}

export function PaymentsContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const { addToast } = useToast();

  const fetchPayments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
    if (methodFilter && methodFilter !== "ALL") params.set("method", methodFilter);
    const res = await fetch(`/api/payments?${params.toString()}`);
    const data = await res.json();
    setPayments(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [statusFilter, methodFilter]);

  const markAsPaid = async (ids: string[]) => {
    const res = await fetch("/api/payments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, status: "COMPLETED" }),
    });
    if (res.ok) {
      addToast({ title: "Payment(s) marked as completed", variant: "success" });
      fetchPayments();
    }
  };

  const totalPaid = payments.filter((p) => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PROCESSING" || p.status === "SCHEDULED").reduce((s, p) => s + p.amount, 0);
  const totalScheduled = payments.filter((p) => p.status === "SCHEDULED").reduce((s, p) => s + p.amount, 0);
  const thisMonth = payments.filter((p) => {
    if (p.status !== "COMPLETED" || !p.completedDate) return false;
    const d = new Date(p.completedDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, p) => s + p.amount, 0);

  const upcoming = payments
    .filter((p) => p.status === "SCHEDULED" || p.status === "PROCESSING")
    .sort((a, b) => {
      const aDate = a.scheduledDate || a.createdAt;
      const bDate = b.scheduledDate || b.createdAt;
      return new Date(aDate).getTime() - new Date(bDate).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Paid (All Time)" value={formatCurrency(totalPaid)} icon={DollarSign} glowColor="green" />
        <MetricCard title="Paid This Month" value={formatCurrency(thisMonth)} icon={CheckCircle} />
        <MetricCard title="Pending" value={formatCurrency(totalPending)} icon={Clock} glowColor="amber" />
        <MetricCard title="Scheduled" value={formatCurrency(totalScheduled)} icon={AlertCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Payments Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Method" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Methods</SelectItem>
                <SelectItem value="PAYPAL">PayPal</SelectItem>
                <SelectItem value="WIRE">Wire</SelectItem>
                <SelectItem value="CRYPTO">Crypto</SelectItem>
                <SelectItem value="VENMO">Venmo</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <a href="/api/export?type=payments" download className="ml-auto">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </a>
          </div>

          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-surface-overlay/50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Creator</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Reference</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No payments found</td></tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <Link href={`/creators/${p.creator.id}`} className="text-sm font-medium text-white hover:text-primary transition-colors">
                          {p.creator.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">@{p.creator.handle}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-white">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.method}</td>
                      <td className="px-4 py-3"><StatusBadge status={p.status} type="payment" /></td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {p.completedDate ? new Date(p.completedDate).toLocaleDateString() : p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : formatRelativeTime(p.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{p.reference || "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {(p.status === "SCHEDULED" || p.status === "PROCESSING") && (
                          <Button variant="ghost" size="sm" onClick={() => markAsPaid([p.id])} className="text-xs text-green-400 hover:text-green-300">
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Payments Sidebar */}
        <Card>
          <CardHeader><CardTitle className="text-base">Upcoming Payments</CardTitle></CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming payments</p>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 10).map((p) => (
                  <div key={p.id} className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0">
                    <div>
                      <Link href={`/creators/${p.creator.id}`} className="text-sm font-medium text-white hover:text-primary transition-colors">
                        {p.creator.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {p.scheduledDate ? new Date(p.scheduledDate).toLocaleDateString() : "No date"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{formatCurrency(p.amount)}</p>
                      <button onClick={() => markAsPaid([p.id])} className="text-xs text-green-400 hover:text-green-300">
                        Mark Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
