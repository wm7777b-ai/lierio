import { AGENT_FLOW_ITEMS } from "@/data/mock-cases";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";

interface AgentProgressProps {
  stage: PageStage;
}

export function AgentProgress({ stage }: AgentProgressProps) {
  return (
    <div className="space-y-2.5">
      {AGENT_FLOW_ITEMS.map((item) => {
        const done = hasReachedStage(stage, item.gate);
        return (
          <div
            key={item.key}
            className={cn(
              "flex items-center justify-between rounded-xl border px-3 py-2",
              done ? "border-blue-200 bg-blue-50/70" : "border-slate-200 bg-white",
            )}
          >
            <div>
              <p className={cn("text-xs font-semibold", done ? "text-blue-700" : "text-slate-700")}>
                {item.zhLabel}
              </p>
              <p className="text-[11px] text-slate-500">{item.enLabel}</p>
            </div>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-medium",
                done ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500",
              )}
            >
              {done ? "已完成" : "待执行"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
