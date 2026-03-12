import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  description?: string;
  tone?: "default" | "focus" | "active" | "stable";
  className?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
}

const toneStyle = {
  default: "ring-slate-200/80 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.18)]",
  focus:
    "ring-slate-200/85 shadow-[0_12px_26px_-20px_rgba(30,64,175,0.2)]",
  active:
    "ring-blue-200/80 shadow-[0_14px_30px_-22px_rgba(37,99,235,0.26)]",
  stable:
    "ring-emerald-200/75 shadow-[0_12px_26px_-22px_rgba(5,150,105,0.22)]",
} as const;

export function SectionCard({
  title,
  description,
  tone = "default",
  className,
  headerExtra,
  children,
}: SectionCardProps) {
  return (
    <Card
      className={cn(
        "rounded-3xl border border-slate-200/75 bg-white/95 backdrop-blur-sm",
        toneStyle[tone],
        className,
      )}
    >
      <CardHeader className="pb-1.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-[15px] font-semibold tracking-tight text-slate-900">
              {title}
            </CardTitle>
            {description ? (
              <CardDescription className="mt-0.5 text-xs text-slate-500">
                {description}
              </CardDescription>
            ) : null}
          </div>
          {headerExtra}
        </div>
      </CardHeader>
      <CardContent className="space-y-3.5">{children}</CardContent>
    </Card>
  );
}
