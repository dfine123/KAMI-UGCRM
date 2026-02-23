import { cn } from "@/lib/utils";
import { STATUS_COLORS, PRIORITY_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "priority" | "payment";
  className?: string;
}

export function StatusBadge({ status, type = "status", className }: StatusBadgeProps) {
  const colorMap =
    type === "priority"
      ? PRIORITY_COLORS
      : type === "payment"
      ? PAYMENT_STATUS_COLORS
      : STATUS_COLORS;

  const colors = colorMap[status] || "bg-gray-500/20 text-gray-300 border-gray-500/30";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold",
        colors,
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
