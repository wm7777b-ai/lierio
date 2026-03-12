import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  tone?: "neutral" | "intent" | "info" | "warning" | "danger" | "success";
  className?: string;
}

const toneMap: Record<NonNullable<StatusBadgeProps["tone"]>, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200/80",
  intent: "bg-slate-100 text-slate-700 ring-slate-200/80",
  info: "bg-blue-50/85 text-blue-700 ring-blue-200/80",
  warning: "bg-amber-50/85 text-amber-700 ring-amber-200/80",
  danger: "bg-rose-50/90 text-rose-700 ring-rose-200/80",
  success: "bg-emerald-50/85 text-emerald-700 ring-emerald-200/80",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full px-2.5 py-[3px] text-[11px] font-medium ring-1",
        toneMap[tone],
        className,
      )}
    >
      {label}
    </Badge>
  );
}
