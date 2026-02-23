import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  glowColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  glowColor,
}: MetricCardProps) {
  return (
    <Card className={cn("relative overflow-hidden p-6", className)}>
      {glowColor && (
        <div
          className={cn("absolute inset-0 opacity-5", glowColor)}
          style={{
            background: `radial-gradient(ellipse at top right, ${
              glowColor === "purple"
                ? "rgba(124,58,237,0.15)"
                : glowColor === "green"
                ? "rgba(34,197,94,0.15)"
                : glowColor === "amber"
                ? "rgba(245,158,11,0.15)"
                : "rgba(124,58,237,0.15)"
            }, transparent)`,
          }}
        />
      )}
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {Icon && (
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        {trend && (
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              trend.value >= 0 ? "text-green-400" : "text-red-400"
            )}
          >
            {trend.value >= 0 ? "+" : ""}
            {trend.value}% {trend.label}
          </p>
        )}
      </div>
    </Card>
  );
}
