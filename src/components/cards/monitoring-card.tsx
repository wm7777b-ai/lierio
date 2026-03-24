import { TriangleAlert } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import type { MonitoringState, PageStage } from "@/types/conversation";

interface MonitoringCardProps {
  monitoring: MonitoringState;
  stage: PageStage;
}

export function MonitoringCard({ monitoring, stage }: MonitoringCardProps) {
  const visible = hasReachedStage(stage, "monitoring");
  const highRisk = monitoring.emotion === "高风险" || monitoring.emotion === "激动";

  if (!visible) {
    return (
      <SectionCard title="话中监测" description="当前主诉求、情绪和风险信号" tone="focus">
        <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 px-4 py-6 text-sm text-blue-700">
          点击“开始分析”后进入话中监测阶段。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="话中监测"
      description="当前主诉求、情绪和风险信号"
      tone={stage === "monitoring" ? "active" : "focus"}
      headerExtra={<StatusBadge label={`情绪：${monitoring.emotion}`} tone={highRisk ? "danger" : "warning"} />}
    >
      <div className="space-y-2">
        <p className="text-xs text-slate-500">当前主诉求</p>
        <p className="text-sm font-semibold text-slate-900">{monitoring.currentIntent}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-500">风险信号</p>
        <div className="flex flex-wrap gap-2">
          {monitoring.riskSignals.map((signal) => (
            <StatusBadge key={signal} label={signal} tone={highRisk ? "danger" : "warning"} />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3">
        <p className="mb-1 flex items-center gap-1 text-xs font-medium text-amber-700">
          <TriangleAlert className="h-3.5 w-3.5" />
          信息缺口提示
        </p>
        <ul className="space-y-1 text-sm text-amber-800">
          {monitoring.missingInfo.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
