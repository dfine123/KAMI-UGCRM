"use client";

import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Payment {
  id: string;
  amount: number;
  method: string;
  status: string;
  reference: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  createdAt: string;
  videoId: string | null;
}

export function CreatorPaymentsTab({
  creatorId,
  payments,
  onRefresh,
}: {
  creatorId: string;
  payments: Payment[];
  onRefresh: () => void;
}) {
  const totalPaid = payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === "PROCESSING" || p.status === "SCHEDULED").reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(totalPaid)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(totalPending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Payments</p>
          <p className="text-2xl font-bold text-white">{payments.length}</p>
        </Card>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No payments recorded</div>
      ) : (
        <div className="rounded-lg border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-surface-overlay/50">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-sm text-white">
                    {payment.completedDate
                      ? new Date(payment.completedDate).toLocaleDateString()
                      : payment.scheduledDate
                      ? new Date(payment.scheduledDate).toLocaleDateString()
                      : formatRelativeTime(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-white">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {payment.method}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={payment.status} type="payment" />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {payment.reference || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
