"use client";

import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from "@/data/mock-cases";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui/section-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { MonitoringState, PageStage, ResolutionState } from "@/types/conversation";

interface HumanReviewCardProps {
  stage: PageStage;
  monitoring: MonitoringState;
  resolution: ResolutionState;
  reviewAlert?: string;
  category: string;
  priority: string;
  onCategoryChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onSubmit: (mode?: "ticket" | "no_followup") => void;
}

export function HumanReviewCard({
  stage,
  monitoring,
  resolution,
  reviewAlert,
  category,
  priority,
  onCategoryChange,
  onPriorityChange,
  onSubmit,
}: HumanReviewCardProps) {
  const visible = hasReachedStage(stage, "resolving");
  const canDecide = stage === "ready";
  const submitted = stage === "submitted";

  const hasHighRisk =
    monitoring.emotion === "高风险" ||
    monitoring.riskSignals.some((item) => item.includes("投诉")) ||
    resolution.escalate;
  const hasMissingInfo = monitoring.missingInfo.length > 0;
  const followupStatus = resolution.escalate
    ? "建议升级关注"
    : hasMissingInfo
      ? "建议补全信息后跟进"
      : "可按标准流程处理";
  const riskJudgement = hasHighRisk ? "高风险" : monitoring.emotion === "不满" ? "中风险" : "低风险";

  if (!visible) {
    return (
      <SectionCard
        title="审查与处置决策"
        description="审查提示与最终决策"
        tone="default"
        headerExtra={<StatusBadge label="待激活" tone="neutral" />}
      >
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          处置建议生成后，右侧将进入审查与决策模式。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="审查与处置决策"
      description="审查提示与最终决策"
      tone={canDecide ? "active" : submitted ? "stable" : "focus"}
      className="min-h-[690px]"
      headerExtra={
        <StatusBadge
          label={submitted ? "已提交" : canDecide ? "待决策" : "审查中"}
          tone={submitted ? "success" : canDecide ? "warning" : "info"}
        />
      }
    >
      {submitted ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm text-emerald-700">
          处置结果已提交，流程已完成。
        </div>
      ) : null}

      {resolution.escalate ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 px-3 py-2.5">
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700">
            <ShieldAlert className="h-4 w-4" />
            建议升级人工关注
          </p>
        </div>
      ) : null}

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5">
        <p className="text-xs font-semibold text-slate-600">审查提示</p>

        <div className="grid grid-cols-2 gap-2">
          <div
            className={cn(
              "rounded-xl border px-2.5 py-2",
              hasHighRisk
                ? "border-rose-200/70 bg-rose-50/40"
                : "border-slate-200 bg-white/90",
            )}
          >
            <p className="text-[11px] text-slate-500">当前风险判断</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                hasHighRisk ? "text-rose-700" : "text-slate-700",
              )}
            >
              {riskJudgement}
            </p>
          </div>

          <div
            className={cn(
              "rounded-xl border px-2.5 py-2",
              hasMissingInfo
                ? "border-amber-200/70 bg-amber-50/45"
                : "border-slate-200 bg-white/90",
            )}
          >
            <p className="text-[11px] text-slate-500">信息缺口</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                hasMissingInfo ? "text-amber-700" : "text-slate-700",
              )}
            >
              {hasMissingInfo ? "存在" : "完整"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
          <p className="text-[11px] text-slate-500">是否建议升级关注</p>
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 text-sm font-semibold",
              resolution.escalate ? "text-rose-700" : "text-slate-700",
            )}
          >
            {resolution.escalate ? "建议升级" : "标准处理"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
          <p className="text-[11px] text-slate-500">当前建议动作</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {resolution.recommendedAction}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
          <p className="text-[11px] text-slate-500">当前建议跟进状态</p>
          <p
            className={cn(
              "mt-1 text-sm font-semibold",
              resolution.escalate ? "text-rose-700" : "text-slate-800",
            )}
          >
            {followupStatus}
          </p>
        </div>

        {hasMissingInfo ? (
          <p className="inline-flex items-center gap-1 text-xs text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            {monitoring.missingInfo.join("、")}
          </p>
        ) : null}

        {reviewAlert ? (
          <p className="text-xs text-slate-500">审查提示：{reviewAlert}</p>
        ) : null}
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-2.5">
        <p className="text-xs font-semibold text-slate-600">处置建议</p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
          <p className="text-[11px] text-slate-500">推荐动作</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{resolution.recommendedAction}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
            <p className="text-[11px] text-slate-500">建议优先级</p>
            <p
              className={cn(
                "mt-1 text-sm font-semibold",
                resolution.suggestedPriority.includes("高") ? "text-rose-700" : "text-slate-800",
              )}
            >
              {resolution.suggestedPriority}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
            <p className="text-[11px] text-slate-500">下一步建议</p>
            <p className="mt-1 text-[13px] leading-5 text-slate-800">{resolution.nextStepAdvice}</p>
          </div>
        </div>

        <div className="space-y-1 rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-2 text-[11px] text-slate-500">
          <p>
            推荐原因：<span className="text-slate-600">{resolution.reason}</span>
          </p>
          <p>
            命中SOP：<span className="text-slate-600">{resolution.sopTitle}</span>
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-2.5">
        <p className="text-xs font-semibold text-slate-600">最终处置</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-500">分类</p>
            <Select
              value={category}
              onValueChange={(value) => onCategoryChange(value ?? "")}
              disabled={!canDecide || submitted}
            >
              <SelectTrigger className="w-full rounded-xl bg-white">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <p className="text-[11px] text-slate-500">优先级</p>
            <Select
              value={priority}
              onValueChange={(value) => onPriorityChange(value ?? "")}
              disabled={!canDecide || submitted}
            >
              <SelectTrigger className="w-full rounded-xl bg-white">
                <SelectValue placeholder="选择优先级" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2.5">
        <p className="text-xs font-semibold text-slate-600">处置动作</p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onSubmit("no_followup")}
            disabled={!canDecide || submitted}
            variant="outline"
            className="h-10 rounded-xl border-slate-200 bg-white text-slate-700"
          >
            无需跟进
          </Button>

          <Button
            onClick={() => onSubmit("ticket")}
            disabled={!canDecide || submitted}
            className="h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-300"
          >
            <CheckCircle2 className="mr-1 h-4 w-4" />
            提交生成工单
          </Button>
        </div>
      </div>
    </SectionCard>
  );
}
