import { AlertTriangle, FileText, Link2 } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { hasReachedStage } from "@/lib/stage";
import type { PageStage } from "@/types/conversation";
import type { CurrentSessionStatusViewModel } from "@/types/workbench-view-model";

interface LiveRecognitionSummaryCardProps {
  stage: PageStage;
  status: CurrentSessionStatusViewModel;
}

export function LiveRecognitionSummaryCard({
  stage,
  status,
}: LiveRecognitionSummaryCardProps) {
  const visible = hasReachedStage(stage, "monitoring");
  const emotionToneClass =
    status.currentEmotion === "高风险"
      ? "text-rose-700"
      : status.currentEmotion === "激动" || status.currentEmotion === "不满"
        ? "text-amber-700"
        : "text-slate-900";

  if (!visible) {
    return (
      <SectionCard title="当前会话状态" description="系统对当前会话的实时理解" tone="focus">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          开始分析后展示当前会话状态。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="当前会话状态" description="系统对当前会话的实时理解" tone="active">
      <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">会话摘要</p>
        <p className="text-sm leading-6 text-slate-900">{status.summary}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
          <p className="mb-1 text-xs text-slate-500">当前诉求</p>
          <p className="text-sm font-semibold text-slate-900">{status.currentDemand}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
          <p className="mb-1 text-xs text-slate-500">当前情绪</p>
          <p className={`text-sm font-semibold ${emotionToneClass}`}>
            {status.currentEmotion}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">预计缺失信息</p>
        <div className="space-y-1.5">
          {status.expectedMissingInfo.map((item) => (
            <p key={item} className="inline-flex items-center gap-1 text-sm text-slate-700">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              {item}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">判断依据</p>
        <p className="mb-2 text-sm leading-6 text-slate-900">
          一句话理解：{status.judgmentBasis.oneLineUnderstanding}
        </p>
        <div className="space-y-1.5">
          {status.judgmentBasis.facts.map((fact) => (
            <p key={fact} className="inline-flex items-start gap-1.5 text-sm text-slate-800">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
              <span>{fact}</span>
            </p>
          ))}
        </div>
        {status.judgmentBasis.docLinks.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {status.judgmentBasis.docLinks.map((doc) => (
              <a
                key={`${doc.label}:${doc.href}`}
                href={doc.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-600"
              >
                <Link2 className="h-3.5 w-3.5" />
                {doc.label}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
