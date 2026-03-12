import { cn } from "@/lib/utils";

interface InfoFieldProps {
  label: string;
  value: string;
  strong?: boolean;
  className?: string;
}

export function InfoField({ label, value, strong, className }: InfoFieldProps) {
  return (
    <div className={cn("grid grid-cols-[88px_1fr] items-start gap-2", className)}>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className={cn("text-sm text-slate-700", strong && "font-semibold text-slate-900")}>
        {value}
      </p>
    </div>
  );
}
