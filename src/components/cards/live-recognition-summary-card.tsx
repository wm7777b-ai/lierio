import { AlertTriangle, FileText, ShieldAlert } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
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
        <div
          className={
            status.currentEmotion === "高风险"
              ? "rounded-xl border border-rose-200/70 bg-rose-50/60 p-2.5"
              : status.currentEmotion === "激动"
                ? "rounded-xl border border-amber-200/70 bg-amber-50/50 p-2.5"
              : "rounded-xl border border-slate-200/80 bg-slate-50 p-2.5"
          }
        >
          <p className="mb-1 text-xs text-slate-500">当前情绪</p>
          <p
            className={
              status.currentEmotion === "高风险"
                ? "text-sm font-semibold text-rose-700"
                : status.currentEmotion === "激动"
                  ? "text-sm font-semibold text-amber-700"
                : "text-sm font-semibold text-slate-900"
            }
          >
            {status.currentEmotion}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-2.5">
          <p className="mb-1 text-xs text-slate-500">当前阶段</p>
          <p className="text-sm font-semibold text-slate-900">{status.currentStage}</p>
        </div>
        <div
          className={
            status.riskLevel === "高"
              ? "rounded-xl border border-rose-200/70 bg-rose-50/60 p-2.5"
              : status.riskLevel === "中"
                ? "rounded-xl border border-amber-200/70 bg-amber-50/45 p-2.5"
                : "rounded-xl border border-slate-200/80 bg-slate-50 p-2.5"
          }
        >
          <p className="mb-1 text-xs text-slate-500">风险等级</p>
          <p
            className={
              status.riskLevel === "高"
                ? "text-sm font-semibold text-rose-700"
                : status.riskLevel === "中"
                  ? "text-sm font-semibold text-amber-700"
                  : "text-sm font-semibold text-slate-900"
            }
          >
            {status.riskLevel}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">关键事实</p>
        <div className="space-y-1.5">
          {status.keyFacts.map((fact) => (
            <p key={fact} className="inline-flex items-start gap-1.5 text-sm text-slate-800">
              <FileText className="mt-0.5 h-3.5 w-3.5 text-slate-500" />
              <span>{fact}</span>
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">缺失信息</p>
        <div className="space-y-1.5">
          {status.missingInfo.map((item) => (
            <p key={item} className="inline-flex items-center gap-1 text-sm text-slate-700">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              {item}
            </p>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white p-2.5">
        <p className="mb-1 text-xs font-semibold text-slate-600">风险提示</p>
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge
            label={`风险等级：${status.riskLevel}`}
            tone={status.riskLevel === "高" ? "danger" : status.riskLevel === "中" ? "warning" : "neutral"}
            className="text-[10px]"
          />
          {status.riskLevel === "高" ? (
            <StatusBadge label="建议重点关注" tone="danger" className="text-[10px]" />
          ) : (
            <StatusBadge label="持续跟踪中" tone="info" className="text-[10px]" />
          )}
          {status.currentEmotion === "高风险" ? (
            <StatusBadge label="情绪已升级" tone="danger" className="text-[10px]" />
          ) : null}
          {status.riskLevel !== "低" ? (
            <p className="inline-flex items-center gap-1 text-xs text-slate-600">
              <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
              结合上下文进行人工确认
            </p>
          ) : null}
        </div>
      </div>
    </SectionCard>
  );
}
