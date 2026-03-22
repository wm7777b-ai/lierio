"use client";

import { SectionCard } from "@/components/ui/section-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasReachedStage } from "@/lib/stage";
import { cn } from "@/lib/utils";
import type { PageStage } from "@/types/conversation";
import type { FeedbackClosureViewModel } from "@/types/workbench-view-model";

interface FeedbackClosureCardProps {
  stage: PageStage;
  feedbackClosure: FeedbackClosureViewModel;
  actionExecuted: boolean;
}

export function FeedbackClosureCard({
  stage,
  feedbackClosure,
  actionExecuted,
}: FeedbackClosureCardProps) {
  const visible = hasReachedStage(stage, "ready");
  const showFinalStatus = actionExecuted;

  if (!visible) {
    return (
      <SectionCard title="反馈沉淀" description="会后沉淀状态" tone="default">
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          会后收口后，这里显示沉淀结果。
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="反馈沉淀"
      description="仅展示沉淀与回流判断"
      tone="default"
      className={cn(feedbackClosure.weakDisplay && "opacity-90")}
      headerExtra={
        <StatusBadge
          label={showFinalStatus ? "已更新" : "待确认"}
          tone={showFinalStatus ? "success" : "neutral"}
        />
      }
    >
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">是否沉淀知识库</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {showFinalStatus
            ? feedbackClosure.depositToKnowledgeBase
              ? "是"
              : "否"
            : "待确认"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
        <p className="text-xs text-slate-500">是否回流badcase</p>
        <p className="mt-1 text-sm font-semibold text-slate-900">
          {showFinalStatus
            ? feedbackClosure.fallbackToBadcase
              ? "是"
              : "否"
            : "待确认"}
        </p>
      </div>
    </SectionCard>
  );
}
