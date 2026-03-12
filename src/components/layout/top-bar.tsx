import { Bell, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { APP_META } from "@/lib/constants";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/70 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-sm font-semibold text-foreground">{APP_META.name}</p>
          <p className="text-xs text-muted-foreground">{APP_META.phase}</p>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <Badge variant="secondary" className="rounded-full">
          会话进行中
        </Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          质检规则待接入
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
          <Bell className="h-3.5 w-3.5 text-amber-600" />
          实时告警待接入
        </span>
      </div>
    </header>
  );
}
