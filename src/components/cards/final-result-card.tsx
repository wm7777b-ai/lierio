import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import type { PageStage } from "@/types/conversation";

interface FinalResultCardProps {
  stage: PageStage;
  summary: string;
  category: string;
  priority: string;
  riskLevel: string;
}

export function FinalResultCard({
  stage,
  summary,
  category,
  priority,
  riskLevel,
}: FinalResultCardProps) {
  const visible = hasReachedStage(stage, "ready");
  const submitted = stage === "submitted";

  if (!visible) {
    return (
      <SectionCard title="正式结果" description="沉淀完成区" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          ready 阶段将填充正式摘要、分类、优先级和风险等级。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="正式结果"
      description="沉淀完成区"
      tone={submitted ? "stable" : "focus"}
      headerExtra={<StatusBadge label={submitted ? "已提交" : "待确认"} tone={submitted ? "success" : "warning"} />}
    >
      <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
        <p className="text-xs text-slate-500">正式摘要</p>
        <p className="text-sm leading-6 text-slate-800">{summary}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">正式工单分类</p>
          <p className="text-sm font-semibold text-slate-900">{category}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs text-slate-500">正式优先级</p>
          <p className="text-sm font-semibold text-slate-900">{priority}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
          <p className="text-xs text-slate-500">正式风险等级</p>
          <p className="text-sm font-semibold text-slate-900">{riskLevel}</p>
        </div>
      </div>
    </SectionCard>
  );
}
