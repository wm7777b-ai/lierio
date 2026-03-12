import { AlertOctagon, WandSparkles } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import type { PageStage, ResolutionState } from "@/types/conversation";

interface ResolutionCardProps {
  resolution: ResolutionState;
  stage: PageStage;
}

export function ResolutionCard({ resolution, stage }: ResolutionCardProps) {
  const visible = hasReachedStage(stage, "resolving");

  if (!visible) {
    return (
      <SectionCard title="处置建议" description="决策建议区" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          处置建议将在 resolving 阶段生成。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="处置建议"
      description="决策建议区"
      tone={stage === "resolving" ? "active" : "focus"}
      headerExtra={<StatusBadge label={resolution.escalate ? "建议升级" : "标准处理"} tone={resolution.escalate ? "danger" : "info"} />}
    >
      <div className="rounded-2xl bg-blue-50/80 p-4">
        <p className="mb-1 flex items-center gap-1 text-xs text-blue-700">
          <WandSparkles className="h-3.5 w-3.5" />
          推荐动作
        </p>
        <p className="text-base font-semibold text-slate-900">{resolution.recommendedAction}</p>
      </div>

      {resolution.escalate ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-3 text-sm font-semibold text-rose-700">
          <p className="flex items-center gap-1.5">
            <AlertOctagon className="h-4 w-4" />
            建议升级人工关注
          </p>
        </div>
      ) : null}

      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
        <p>
          推荐原因：<span className="text-slate-600">{resolution.reason}</span>
        </p>
        <p>
          命中SOP：<span className="text-slate-600">{resolution.sopTitle}</span>
        </p>
      </div>
    </SectionCard>
  );
}
